/** Hard-capped at 500 — must never be overridden by env vars. */
export const MAX_STOCK = 500;

/** Display offset — adds fake sold units for FOMO effect. Does not affect real stock logic. */
export const STOCK_DISPLAY_OFFSET = 118;

export const DROP_END_DATE =
  process.env.NEXT_PUBLIC_DROP_END_DATE || "2026-03-19T23:59:59Z";

export const PRODUCT = {
  name: "T-shirt UNTOLD – Limited Edition",
  slug: "tshirt-untold-limited",
  price: 6900, // centimes (69 €)
  priceDisplay: "69 €",
  currency: "eur",
  sizes: ["S", "M", "L"] as const,
  description:
    "Édition limitée à 500 exemplaires. Impression premium sur coton bio 240g. Design exclusif.",
  shippingDelay: "7 à 15 jours ouvrés",
} as const;

export type Size = (typeof PRODUCT.sizes)[number];

export const SITE = {
  name: "UNTOLD",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://untold-limited.com",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "contact@untold-limited.com",
  title: "UNTOLD – Drop Limité",
  description:
    "T-shirt édition limitée. 500 exemplaires. Unmask them.",
  ogImage: "/og-image.png",
} as const;
