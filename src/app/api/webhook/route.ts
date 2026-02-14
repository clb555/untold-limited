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
// POD Order creation (adapt to your provider: Printful, Gelato, Printify)
// ---------------------------------------------------------------------------

async function createPodOrder(session: Stripe.Checkout.Session) {
  const podApiKey = process.env.POD_API_KEY;
  const podApiUrl = process.env.POD_API_URL;

  if (!podApiKey || !podApiUrl) {
    console.warn("[webhook] POD not configured, skipping order creation");
    return;
  }

  const size = session.metadata?.size || "M";
  const shipping = session.shipping_details;

  const orderPayload = {
    external_id: session.id,
    recipient: {
      name: shipping?.name || session.customer_details?.name || "",
      address1: shipping?.address?.line1 || "",
      address2: shipping?.address?.line2 || "",
      city: shipping?.address?.city || "",
      state_code: shipping?.address?.state || "",
      country_code: shipping?.address?.country || "FR",
      zip: shipping?.address?.postal_code || "",
      email: session.customer_details?.email || "",
    },
    items: [
      {
        variant_id: getPodVariantId(size),
        quantity: 1,
        name: `T-shirt UNTOLD – Taille ${size}`,
      },
    ],
  };

  try {
    const res = await fetch(`${podApiUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${podApiKey}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[webhook] POD order failed (${res.status}):`,
        errorText
      );
    } else {
      console.log("[webhook] POD order created successfully");
    }
  } catch (err) {
    console.error("[webhook] POD API error:", err);
  }
}

/**
 * Map size to POD variant ID.
 * Replace these with your actual variant IDs from your POD provider.
 */
function getPodVariantId(size: string): number {
  const variantMap: Record<string, number> = {
    S: 0, // Replace with actual variant IDs
    M: 0,
    L: 0,
  };
  return variantMap[size] || variantMap["M"];
}
