"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PRODUCT, Size, DROP_END_DATE } from "@/lib/constants";
import SizeSelector from "@/components/ui/SizeSelector";
import Button from "@/components/ui/Button";
import StockCounter from "@/components/StockCounter";
import DropTimer from "@/components/DropTimer";
import TshirtScene from "@/components/TshirtScene";

export default function ProductSection() {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // GSAP scroll-triggered animations
  useEffect(() => {
    let ctx: { revert: () => void } | undefined;

    async function initAnimations() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current) return;

      ctx = gsap.context(() => {
        const elements = sectionRef.current!.querySelectorAll(".reveal");

        elements.forEach((el) => {
          gsap.fromTo(
            el,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      }, sectionRef.current);
    }

    initAnimations();
    return () => { ctx?.revert(); };
  }, []);

  // Check if drop is still active
  useEffect(() => {
    const checkDrop = () => {
      const now = new Date();
      const end = new Date(DROP_END_DATE);
      if (now >= end) setDropActive(false);
    };

    checkDrop();
    const interval = setInterval(checkDrop, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!selectedSize) {
      setError("Choisis une taille");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: selectedSize }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Erreur de connexion. Réessaie.");
    } finally {
      setLoading(false);
    }
  }, [selectedSize]);

  return (
    <section
      ref={sectionRef}
      id="product"
      className="relative min-h-screen py-16 md:py-32 px-4 sm:px-6 bg-white"
    >
      {/* Section divider */}
      <hr className="divider mb-16 md:mb-20" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        {/* Left: Product carousel */}
        <div className="relative reveal lg:sticky lg:top-24">
          <TshirtScene />
        </div>

        {/* Right: Product info */}
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Title */}
          <div className="flex flex-col gap-2 reveal">
            <span className="text-sm md:text-base tracking-[0.4em] uppercase text-gray-400 font-body">
              Drop limité
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-black">
              {PRODUCT.name}
            </h2>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-4 reveal">
            <span className="font-display text-5xl md:text-6xl">
              {PRODUCT.priceDisplay}
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 font-body">
              TTC · Livraison incluse
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-500 font-body text-sm leading-relaxed max-w-md reveal">
            {PRODUCT.description}
          </p>

          <hr className="divider reveal" />

          {/* Stock & Timer */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 reveal">
            <StockCounter />
            <DropTimer />
          </div>

          <hr className="divider reveal" />

          {/* Size selector */}
          <div className="reveal">
            <SizeSelector
              selected={selectedSize}
              onSelect={(size) => {
                setSelectedSize(size);
                setError(null);
              }}
              disabled={!dropActive}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-gray-500 text-xs font-body tracking-wide">
              {error}
            </p>
          )}

          {/* CTA */}
          <div className="reveal">
            {dropActive ? (
              <Button
                size="lg"
                onClick={handleCheckout}
                loading={loading}
                disabled={!selectedSize}
                className="w-full lg:w-auto"
              >
                Commander · {PRODUCT.priceDisplay}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Button size="lg" disabled className="w-full lg:w-auto">
                  Drop terminé
                </Button>
                <p className="text-xs text-gray-400 font-body">
                  Les ventes sont closes. Suis-nous pour le prochain drop.
                </p>
              </div>
            )}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-2 md:mt-4 reveal">
            {[
              "Paiement sécurisé",
              `Livraison ${PRODUCT.shippingDelay}`,
              "Impression premium",
            ].map((label) => (
              <span
                key={label}
                className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-body"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
