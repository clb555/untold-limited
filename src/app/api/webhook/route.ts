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
// Gelato POD — Draft order (manual validation in Gelato dashboard)
// ---------------------------------------------------------------------------

const GELATO_API_URL = "https://order.gelatoapis.com/v4/orders";

// Base product UID — replace `{size}` with s / m / l at runtime
const GELATO_PRODUCT_UID_BASE =
  "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_classic_gsi_{size}_gco_black_gpr_4-4_inlbl_next-level_3600";

function getGelatoProductUid(size: string): string {
  const sizeMap: Record<string, string> = {
    S: "s",
    M: "m",
    L: "l",
  };
  const gelatoSize = sizeMap[size] || "m";
  return GELATO_PRODUCT_UID_BASE.replace("{size}", gelatoSize);
}

async function createPodOrder(session: Stripe.Checkout.Session) {
  const apiKey = process.env.GELATO_API_KEY;

  if (!apiKey) {
    console.warn("[webhook] Gelato API key not configured, skipping order");
    return;
  }

  const size = session.metadata?.size || "M";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://untold-limited.com";
  const shipping = session.shipping_details;
  const nameParts = (shipping?.name || session.customer_details?.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const orderPayload = {
    orderType: "draft",
    orderReferenceId: session.id,
    customerReferenceId: session.customer_details?.email || session.id,
    currency: "EUR",
    items: [
      {
        itemReferenceId: `${session.id}-tshirt`,
        productUid: getGelatoProductUid(size),
        quantity: 1,
        files: [
          {
            type: "default",
            url: `${siteUrl}/tshirt-front.png`,
          },
          {
            type: "back",
            url: `${siteUrl}/tshirt-back.png`,
          },
          {
            type: "neck-inner",
            url: `${siteUrl}/label-neck.png`,
          },
        ],
      },
    ],
    shippingAddress: {
      firstName,
      lastName,
      addressLine1: shipping?.address?.line1 || "",
      addressLine2: shipping?.address?.line2 || "",
      city: shipping?.address?.city || "",
      state: shipping?.address?.state || "",
      postCode: shipping?.address?.postal_code || "",
      country: shipping?.address?.country || "FR",
      email: session.customer_details?.email || "",
    },
    metadata: {
      size,
    },
  };

  try {
    const res = await fetch(GELATO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[webhook] Gelato order failed (${res.status}):`, errorText);
    } else {
      const data = await res.json();
      console.log("[webhook] Gelato draft order created:", data.id);
    }
  } catch (err) {
    console.error("[webhook] Gelato API error:", err);
  }
}
