import { stripe } from "./stripe";
import { MAX_STOCK, DROP_END_DATE, PRODUCT } from "./constants";

/**
 * Stock management via Stripe — counts completed checkout sessions.
 * No Redis, no external DB. Stripe is the single source of truth.
 */

let cachedStock: { value: number; timestamp: number } | null = null;
const CACHE_TTL = 10_000; // 10s cache to avoid hammering Stripe API

/**
 * Count completed checkout sessions for our product and return the total sold.
 */
async function countSold(): Promise<number> {
  let totalSold = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const params: Record<string, unknown> = {
      limit: 100,
      status: "complete",
    };
    if (startingAfter) params.starting_after = startingAfter;

    const sessions = await stripe.checkout.sessions.list(
      params as Parameters<typeof stripe.checkout.sessions.list>[0]
    );

    // Only count sessions that belong to our product
    for (const session of sessions.data) {
      if (session.metadata?.product === PRODUCT.slug) {
        totalSold += 1;
      }
    }

    hasMore = sessions.has_more;

    if (sessions.data.length > 0) {
      startingAfter = sessions.data[sessions.data.length - 1].id;
    }
  }

  return totalSold;
}

/**
 * Invalidate the stock cache. Called after webhook processes a completed session.
 */
export function invalidateStockCache(): void {
  cachedStock = null;
}

/**
 * Get remaining stock. Returns 0 when sold out.
 */
export async function getStock(): Promise<number> {
  // Return cache if fresh
  if (cachedStock && Date.now() - cachedStock.timestamp < CACHE_TTL) {
    return cachedStock.value;
  }

  try {
    const totalSold = await countSold();
    const remaining = Math.max(0, MAX_STOCK - totalSold);
    cachedStock = { value: remaining, timestamp: Date.now() };
    return remaining;
  } catch (err) {
    console.error("[stock] Error fetching from Stripe:", err);
    return cachedStock?.value ?? MAX_STOCK;
  }
}

/**
 * Get the raw number of completed sessions (not clamped).
 * Used by webhook to detect oversell precisely. Bypasses cache.
 */
export async function getSoldCount(): Promise<number> {
  try {
    return await countSold();
  } catch (err) {
    console.error("[stock] Error fetching sold count:", err);
    return MAX_STOCK; // Fail safe: assume sold out
  }
}

/**
 * Check if the drop is still active (stock > 0 AND date not passed).
 */
export async function isDropActive(): Promise<boolean> {
  const stock = await getStock();
  const now = new Date();
  const end = new Date(DROP_END_DATE);
  return stock > 0 && now < end;
}
