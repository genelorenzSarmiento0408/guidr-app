import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

type PaymentProvider = "stripe" | "paymongo";

function getAppUrl(origin: string) {
  return process.env.NEXT_PUBLIC_APP_URL || origin;
}

function getPayMongoPaymentMethods() {
  const raw = process.env.PAYMONGO_PAYMENT_METHOD_TYPES;
  if (!raw) {
    return ["card", "gcash", "paymaya"];
  }

  return raw
    .split(",")
    .map((method) => method.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, provider } = (await request.json()) as {
      postId?: string;
      provider?: PaymentProvider;
    };
    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 },
      );
    }

    const paymentProvider: PaymentProvider = provider || "stripe";

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, title")
      .eq("id", postId)
      .eq("user_id", user.id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post not found or not owned by current user." },
        { status: 404 },
      );
    }

    const requestUrl = new URL(request.url);
    const appUrl = getAppUrl(requestUrl.origin);

    if (paymentProvider === "stripe") {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      const stripePriceId = process.env.STRIPE_PRICE_ID;

      if (!stripeSecretKey || !stripePriceId) {
        return NextResponse.json(
          { error: "Stripe is not configured." },
          { status: 500 },
        );
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2025-06-30.basil",
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/payments/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}&post_id=${post.id}`,
        cancel_url: `${appUrl}/payments/cancel?provider=stripe&post_id=${post.id}`,
        client_reference_id: post.id,
        customer_email: user.email || undefined,
        metadata: {
          postId: post.id,
          userId: user.id,
        },
      });

      return NextResponse.json({
        checkoutUrl: session.url,
        provider: "stripe",
      });
    }

    if (paymentProvider === "paymongo") {
      const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
      const paymongoAmountCents = Number(
        process.env.PAYMONGO_PREMIUM_AMOUNT_CENTS || "9900",
      );
      const paymongoCurrency = (
        process.env.PAYMONGO_CURRENCY || "PHP"
      ).toUpperCase();

      if (!paymongoSecretKey) {
        return NextResponse.json(
          { error: "PayMongo is not configured." },
          { status: 500 },
        );
      }

      if (!Number.isFinite(paymongoAmountCents) || paymongoAmountCents <= 0) {
        return NextResponse.json(
          { error: "Invalid PayMongo premium amount." },
          { status: 500 },
        );
      }

      const encodedKey = Buffer.from(`${paymongoSecretKey}:`).toString(
        "base64",
      );
      const paymentMethods = getPayMongoPaymentMethods();

      const response = await fetch(
        "https://api.paymongo.com/v1/checkout_sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${encodedKey}`,
          },
          body: JSON.stringify({
            data: {
              attributes: {
                send_email_receipt: true,
                show_description: true,
                show_line_items: true,
                payment_method_types: paymentMethods,
                line_items: [
                  {
                    name: `Premium Post: ${post.title}`,
                    quantity: 1,
                    amount: paymongoAmountCents,
                    currency: paymongoCurrency,
                  },
                ],
                success_url: `${appUrl}/payments/success?provider=paymongo&post_id=${post.id}`,
                cancel_url: `${appUrl}/payments/cancel?provider=paymongo&post_id=${post.id}`,
                metadata: {
                  postId: post.id,
                  userId: user.id,
                },
              },
            },
          }),
        },
      );

      const json = await response.json();
      if (!response.ok) {
        const message =
          json?.errors?.[0]?.detail ||
          json?.errors?.[0]?.code ||
          "PayMongo checkout session creation failed";
        return NextResponse.json({ error: message }, { status: 500 });
      }

      const checkoutUrl = json?.data?.attributes?.checkout_url as
        | string
        | undefined;

      if (!checkoutUrl) {
        return NextResponse.json(
          { error: "PayMongo did not return a checkout URL." },
          { status: 500 },
        );
      }

      return NextResponse.json({ checkoutUrl, provider: "paymongo" });
    }

    return NextResponse.json(
      { error: "Unsupported payment provider." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
