/** Hard-capped at 200 — must never be overridden by env vars. */
export const MAX_STOCK = 200;

export const DROP_END_DATE =
  process.env.NEXT_PUBLIC_DROP_END_DATE || "2026-03-15T23:59:59Z";

export const PRODUCT = {
  name: "T-shirt UNTOLD – Limited Edition",
  slug: "tshirt-untold-limited",
  price: 5900, // centimes (59 €)
  priceDisplay: "59 €",
  currency: "eur",
  sizes: ["S", "M", "L"] as const,
  description:
    "Édition limitée à 200 exemplaires. Impression premium sur coton bio 240g. Design exclusif.",
  shippingDelay: "7 à 15 jours ouvrés",
} as const;

export type Size = (typeof PRODUCT.sizes)[number];

export const SITE = {
  name: "UNTOLD",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://untold-limited.com",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "contact@untold-limited.com",
  title: "UNTOLD – Drop Limité",
  description:
    "T-shirt édition limitée. 200 exemplaires. Unmask them.",
  ogImage: "/og-image.png",
} as const;
