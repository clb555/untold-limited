import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { isDropActive } from "@/lib/stock";
import { PRODUCT, Size } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de requête invalide" },
        { status: 400 }
      );
    }

    // Reject requests with unexpected fields
    const allowedFields = new Set(["size"]);
    const extraFields = Object.keys(body).filter((k) => !allowedFields.has(k));
    if (extraFields.length > 0) {
      return NextResponse.json(
        { error: "Champs non autorisés" },
        { status: 400 }
      );
    }

    const size = body.size;

    // Validate size is a string and one of the allowed values
    if (typeof size !== "string" || !PRODUCT.sizes.includes(size as Size)) {
      return NextResponse.json(
        { error: "Taille invalide" },
        { status: 400 }
      );
    }

    // Check if drop is still active (stock > 0 AND date not passed)
    const active = await isDropActive();
    if (!active) {
      return NextResponse.json(
        { error: "Le drop est terminé" },
        { status: 410 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: PRODUCT.currency,
            product_data: {
              name: `${PRODUCT.name} – Taille ${size}`,
              description: PRODUCT.description,
              metadata: {
                size,
              },
            },
            unit_amount: PRODUCT.price,
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "MC"],
      },
      metadata: {
        size,
        product: PRODUCT.slug,
      },
      success_url: `${baseUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: baseUrl,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
