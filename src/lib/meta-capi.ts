import crypto from "crypto";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendPurchaseEvent({
  email,
  value,
  currency,
  eventId,
  sourceUrl,
}: {
  email: string;
  value: number;
  currency: string;
  eventId: string;
  sourceUrl: string;
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  if (!pixelId || !token) return;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: sourceUrl,
        user_data: {
          em: [sha256(email)],
        },
        custom_data: {
          currency: currency.toUpperCase(),
          value: value / 100,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error("[capi] Meta CAPI error:", err);
    } else {
      console.log("[capi] Purchase event sent to Meta");
    }
  } catch (err) {
    console.error("[capi] Meta CAPI fetch failed:", err);
  }
}
