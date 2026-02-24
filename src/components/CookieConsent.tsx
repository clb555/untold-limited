"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_KEY = "untold_consent";

export type ConsentStatus = "accepted" | "refused" | null;

export function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(COOKIE_KEY);
  if (value === "accepted" || value === "refused") return value;
  return null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  function handleChoice(choice: "accepted" | "refused") {
    localStorage.setItem(COOKIE_KEY, choice);
    setVisible(false);
    // Reload so MetaPixel picks up the consent
    if (choice === "accepted") window.location.reload();
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <p className="text-xs text-gray-500 font-body text-center sm:text-left">
          Ce site utilise des cookies pour mesurer l&apos;audience et optimiser
          votre expérience.{" "}
          <Link href="/legal/privacy" className="underline hover:text-black">
            En savoir plus
          </Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => handleChoice("refused")}
            className="text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-black transition-colors font-body px-4 py-2"
          >
            Refuser
          </button>
          <button
            onClick={() => handleChoice("accepted")}
            className="text-xs tracking-[0.15em] uppercase bg-black text-white hover:bg-gray-800 transition-colors font-body px-4 py-2"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
