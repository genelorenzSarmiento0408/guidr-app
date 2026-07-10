import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type PayMongoEvent = {
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      type?: string;
      event_type?: string;
      data?: {
        id?: string;
        type?: string;
        attributes?: {
          amount?: number;
          currency?: string;
          metadata?: {
            postId?: string;
            userId?: string;
          };
        };
        metadata?: {
          postId?: string;
          userId?: string;
        };
      };
      payload?: {
        id?: string;
        attributes?: {
          amount?: number;
          currency?: string;
          metadata?: {
            postId?: string;
            userId?: string;
          };
        };
        metadata?: {
          postId?: string;
          userId?: string;
        };
      };
    };
  };
};

function extractSignatureParts(signatureHeader: string) {
  const pairs = signatureHeader.split(",").map((part) => part.trim());
  const result: Record<string, string> = {};

  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value) {
      result[key] = value;
    }
  }

  return {
    timestamp: result.t,
    signature: result.v1,
  };
}

function isValidPayMongoSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
) {
  if (!signatureHeader) return false;

  const { timestamp, signature } = extractSignatureParts(signatureHeader);
  if (!signature) return false;

  const digestBodyOnly = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (digestBodyOnly === signature) return true;

  if (timestamp) {
    const digestTimestampBody = crypto
      .createHmac("sha256", webhookSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    return digestTimestampBody === signature;
  }

  return false;
}

function normalizeEventType(event: PayMongoEvent) {
  return (
    event.data?.attributes?.type ||
    event.data?.attributes?.event_type ||
    event.data?.type ||
    ""
  ).toLowerCase();
}

function extractPaymentPayload(event: PayMongoEvent) {
  return event.data?.attributes?.data || event.data?.attributes?.payload;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const paymongoWebhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!supabaseUrl || !supabaseServiceKey || !paymongoWebhookSecret) {
    return NextResponse.json(
      { error: "Missing PayMongo webhook configuration" },
      { status: 500 },
    );
  }

  const signatureHeader = request.headers.get("paymongo-signature");
  const rawBody = await request.text();

  if (
    !isValidPayMongoSignature(rawBody, signatureHeader, paymongoWebhookSecret)
  ) {
    return NextResponse.json(
      { error: "Invalid PayMongo webhook signature" },
      { status: 400 },
    );
  }

  let event: PayMongoEvent;
  try {
    event = JSON.parse(rawBody) as PayMongoEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const eventType = normalizeEventType(event);
    const payload = extractPaymentPayload(event);
    const metadata = payload?.attributes?.metadata || payload?.metadata || {};

    const postId = metadata.postId;
    const userId = metadata.userId;

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "Missing postId/userId metadata in PayMongo event" },
        { status: 400 },
      );
    }

    const providerPaymentId = payload?.id || event.data?.id;
    if (!providerPaymentId) {
      return NextResponse.json(
        { error: "Missing provider payment id in PayMongo event" },
        { status: 400 },
      );
    }

    const amountCents = payload?.attributes?.amount || 0;
    const currency = (payload?.attributes?.currency || "php").toLowerCase();

    let status: "pending" | "paid" | "failed" | "refunded" = "pending";
    if (eventType.includes("paid")) {
      status = "paid";
    } else if (eventType.includes("failed")) {
      status = "failed";
    } else if (eventType.includes("refund")) {
      status = "refunded";
    }

    const { data: transaction, error: upsertError } = await supabaseAdmin
      .from("payment_transactions")
      .upsert(
        {
          user_id: userId,
          post_id: postId,
          provider: "paymongo",
          provider_payment_id: providerPaymentId,
          amount_cents: amountCents,
          currency,
          status,
          metadata: {
            event_type: eventType,
            raw_event_id: event.data?.id,
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
      throw upsertError || new Error("Failed to upsert PayMongo transaction");
    }

    if (status === "paid") {
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

    return NextResponse.json({ received: true, provider: "paymongo" });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "PayMongo webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
