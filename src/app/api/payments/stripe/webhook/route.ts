import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !stripeSecretKey ||
    !stripeWebhookSecret ||
    !supabaseUrl ||
    !supabaseServiceKey
  ) {
    return NextResponse.json(
      { error: "Missing webhook configuration" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-06-30.basil",
  });

  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const postId = session.metadata?.postId;
      const userId = session.metadata?.userId;

      if (!postId || !userId) {
        return NextResponse.json(
          { error: "Missing postId/userId metadata" },
          { status: 400 },
        );
      }

      const providerPaymentId = session.id;
      const amountCents = session.amount_total || 0;
      const currency = (session.currency || "usd").toLowerCase();

      const { data: transaction, error: upsertError } = await supabaseAdmin
        .from("payment_transactions")
        .upsert(
          {
            user_id: userId,
            post_id: postId,
            provider: "stripe",
            provider_payment_id: providerPaymentId,
            amount_cents: amountCents,
            currency,
            status: "paid",
            metadata: {
              checkout_session_id: session.id,
              payment_intent: session.payment_intent,
            },
          },
          {
            onConflict: "provider,provider_payment_id",
            ignoreDuplicates: false,
          },
        )
        .select("id")
        .single();

      if (upsertError || !transaction) {
        throw upsertError || new Error("Failed to upsert transaction");
      }

      const { error: premiumError } = await supabaseAdmin
        .from("post_premium_access")
        .upsert(
          {
            post_id: postId,
            payment_transaction_id: transaction.id,
          },
          {
            onConflict: "post_id",
            ignoreDuplicates: false,
          },
        );

      if (premiumError) {
        throw premiumError;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
