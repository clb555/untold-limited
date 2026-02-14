import { NextResponse } from "next/server";
import { getStock, isDropActive } from "@/lib/stock";
import { MAX_STOCK } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stock = await getStock();
    const active = await isDropActive();

    return NextResponse.json(
      { stock, maxStock: MAX_STOCK, active },
      {
        headers: {
          "Cache-Control": "public, max-age=10, stale-while-revalidate=5",
        },
      }
    );
  } catch (err) {
    console.error("[stock] Error:", err);
    return NextResponse.json(
      { stock: 0, maxStock: MAX_STOCK, active: false },
      { status: 500 }
    );
  }
}
