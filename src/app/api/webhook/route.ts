import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSoldCount, invalidateStockCache } from "@/lib/stock";
import { MAX_STOCK, PRODUCT } from "@/lib/constants";
import Stripe from "stripe";

// In-memory idempotency set — prevents processing the same event twice.
// Safe for single-instance Vercel serverless (Stripe retries hit the same instance
// within its retry window). For multi-instance setups, Stripe's own deduplication
// via event.id is already a strong guarantee.
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 1000;

function markEventProcessed(eventId: string): boolean {
  if (processedEvents.has(eventId)) return false;
  // Evict oldest entries when the set grows too large
  if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
    const first = processedEvents.values().next().value;
    if (first !== undefined) processedEvents.delete(first);
  }
  processedEvents.add(eventId);
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Idempotency: skip if this event was already processed
  if (!markEventProcessed(event.id)) {
    console.log("[webhook] Duplicate event, skipping:", event.id);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process sessions for our product
    if (session.metadata?.product !== PRODUCT.slug) {
      console.log("[webhook] Ignoring session for unknown product:", session.id);
      return NextResponse.json({ received: true });
    }

    console.log("[webhook] Payment completed:", session.id);

    // Invalidate cache so getSoldCount fetches fresh data
    invalidateStockCache();

    // Check sold count (Stripe is source of truth)
    const totalSold = await getSoldCount();

    if (totalSold > MAX_STOCK) {
      // Over-sold edge case — refund the excess order
      console.error(
        `[webhook] Oversold (${totalSold}/${MAX_STOCK}), refunding:`,
        session.id
      );

      if (session.payment_intent) {
        await stripe.refunds.create({
          payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent.id,
          reason: "requested_by_customer",
        });
      }

      return NextResponse.json({ received: true, refunded: true });
    }

    // Create Print on Demand order
    await createPodOrder(session);

    console.log(
      `[webhook] Order processed. Sold: ${totalSold}/${MAX_STOCK}`
    );
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Printful POD — Draft order (manual confirmation in Printful dashboard)
// Uses sync_variant_id: Printful already knows the design from the saved product.
// ---------------------------------------------------------------------------

const PRINTFUL_API_URL = "https://api.printful.com/orders";

// Printful sync variant IDs — Cotton Heritage MC1087, Black
const PRINTFUL_VARIANT_IDS: Record<string, number> = {
  S: 5200852325,
  M: 5200852326,
  L: 5200852327,
};

async function createPodOrder(session: Stripe.Checkout.Session) {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    console.warn("[webhook] Printful API key not configured, skipping order");
    return;
  }

  // Retrieve full session — webhook payload may omit shipping_details
  const fullSession = await stripe.checkout.sessions.retrieve(session.id);

  const size = fullSession.metadata?.size || "M";
  const syncVariantId = PRINTFUL_VARIANT_IDS[size] || PRINTFUL_VARIANT_IDS.M;

  const shipping = fullSession.shipping_details;
  const recipientName =
    shipping?.name || fullSession.customer_details?.name || "";

  const orderPayload = {
    external_id: fullSession.id,
    recipient: {
      name: recipientName,
      address1: shipping?.address?.line1 || "",
      address2: shipping?.address?.line2 || "",
      city: shipping?.address?.city || "",
      state_code: shipping?.address?.state || "",
      country_code: shipping?.address?.country || "FR",
      zip: shipping?.address?.postal_code || "",
      email: fullSession.customer_details?.email || "",
    },
    items: [
      {
        sync_variant_id: syncVariantId,
        quantity: 1,
      },
    ],
  };

  try {
    // POST without ?confirm=true → creates a draft order
    const res = await fetch(PRINTFUL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[webhook] Printful order failed (${res.status}):`, errorText);
    } else {
      const data = await res.json();
      console.log("[webhook] Printful draft order created:", data.result?.id);
    }
  } catch (err) {
    console.error("[webhook] Printful API error:", err);
  }
}
