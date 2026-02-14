"use client";

import { useEffect, useState, useRef } from "react";
import { MAX_STOCK } from "@/lib/constants";

export default function StockCounter() {
  const [stock, setStock] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    async function fetchStock() {
      try {
        const res = await fetch("/api/stock");
        const data = await res.json();
        setStock(data.stock);
      } catch {
        setStock(MAX_STOCK);
      }
    }

    fetchStock();
    const interval = setInterval(fetchStock, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Animate bar and count when stock value loads/changes
  useEffect(() => {
    if (stock === null) return;

    async function animateBar() {
      const gsap = (await import("gsap")).default;
      const percentage = (stock! / MAX_STOCK) * 100;

      if (barRef.current) {
        gsap.fromTo(
          barRef.current,
          { width: "0%" },
          { width: `${percentage}%`, duration: 1.2, ease: "power2.out" }
        );
      }

      if (countRef.current) {
        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: stock!,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            const current = Math.round(proxy.val);
            if (countRef.current) {
              countRef.current.textContent = `${current}/${MAX_STOCK} restants`;
            }
          },
        });
      }
    }

    animateBar();
  }, [stock]);

  if (stock === null) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
        <span className="text-xs tracking-[0.2em] uppercase text-gray-400 font-body">
          Chargement...
        </span>
      </div>
    );
  }

  const isLow = stock <= 30;
  const isSoldOut = stock <= 0;

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isSoldOut
                ? "bg-gray-300"
                : isLow
                ? "bg-gray-600 animate-pulse-subtle"
                : "bg-black"
            }`}
          />
          <span
            ref={countRef}
            className="text-xs tracking-[0.2em] uppercase text-gray-500 font-body"
          >
            {isSoldOut ? "Sold out" : `${stock}/${MAX_STOCK} restants`}
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 relative overflow-hidden">
        <div ref={barRef} className="h-full bg-black" style={{ width: 0 }} />
      </div>
    </div>
  );
}
