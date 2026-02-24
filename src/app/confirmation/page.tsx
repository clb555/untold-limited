"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PRODUCT, SITE } from "@/lib/constants";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface OrderInfo {
  email: string;
  size: string;
  amount: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    if (sessionId) {
      setOrder({
        email: "",
        size: "",
        amount: PRODUCT.priceDisplay,
      });

      // Meta Pixel — track purchase conversion
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Purchase", {
          value: PRODUCT.price / 100,
          currency: "EUR",
        });
      }
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-white">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4 text-black">Erreur</h1>
          <p className="text-gray-400 font-body text-sm mb-8">
            Aucune commande trouvée.
          </p>
          <Link
            href="/"
            className="text-xs tracking-[0.3em] uppercase text-gray-400 hover:text-black transition-colors font-body"
          >
            ← Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 page-enter bg-white">
      <div className="max-w-lg w-full text-center flex flex-col items-center gap-8">
        {/* Checkmark */}
        <div className="w-16 h-16 border border-black rounded-full flex items-center justify-center animate-fade-in">
          <svg
            className="w-8 h-8 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-5xl md:text-6xl tracking-wide text-black">
            Merci.
          </h1>
          <p className="text-gray-400 font-body text-sm">
            Ta commande a bien été enregistrée.
          </p>
        </div>

        <hr className="divider w-full" />

        {/* Order details */}
        <div className="w-full flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs tracking-[0.2em] uppercase text-gray-400 font-body">
              Produit
            </span>
            <span className="text-sm font-body text-black">{PRODUCT.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs tracking-[0.2em] uppercase text-gray-400 font-body">
              Montant
            </span>
            <span className="text-sm font-body text-black">{PRODUCT.priceDisplay}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs tracking-[0.2em] uppercase text-gray-400 font-body">
              Livraison estimée
            </span>
            <span className="text-sm font-body text-black">
              {PRODUCT.shippingDelay}
            </span>
          </div>
        </div>

        <hr className="divider w-full" />

        {/* Info */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400 font-body leading-relaxed">
            Un email de confirmation va t&apos;être envoyé. Ton t-shirt sera
            imprimé et expédié sous {PRODUCT.shippingDelay}.
          </p>
          <p className="text-xs text-gray-400 font-body">
            Une question ?{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-black hover:text-gray-600 transition-colors underline"
            >
              {SITE.email}
            </a>
          </p>
        </div>

        {/* Back */}
        <Link
          href="/"
          className="mt-4 text-xs tracking-[0.3em] uppercase text-gray-400 hover:text-black transition-colors font-body"
        >
          ← Retour au site
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
