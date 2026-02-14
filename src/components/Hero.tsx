"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const ChromeMaskScene = dynamic(() => import("@/components/MaskScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-white" />,
});

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;

    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Staggered letter reveal for title
        if (titleRef.current) {
          const text = titleRef.current.textContent || "";
          titleRef.current.textContent = "";
          titleRef.current.style.opacity = "1";

          const letters = text.split("").map((char) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.display = "inline-block";
            span.style.opacity = "0";
            titleRef.current!.appendChild(span);
            return span;
          });

          gsap.fromTo(
            letters,
            { y: 80, opacity: 0, rotateX: -90 },
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 0.8,
              stagger: 0.06,
              ease: "power4.out",
            }
          );
        }

        // Subtitle fade in
        if (subtitleRef.current) {
          gsap.fromTo(
            subtitleRef.current,
            { y: 20, opacity: 0, letterSpacing: "0.8em" },
            {
              y: 0,
              opacity: 1,
              letterSpacing: "0.5em",
              duration: 1.2,
              delay: 0.7,
              ease: "power3.out",
            }
          );
        }

        // CTA bounce in
        if (ctaRef.current) {
          gsap.fromTo(
            ctaRef.current,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: 1.2,
              ease: "back.out(1.7)",
            }
          );

          // Continuous subtle bounce
          gsap.to(ctaRef.current, {
            y: -6,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 2.2,
          });
        }

        // Parallax: push content up as user scrolls
        if (sectionRef.current) {
          gsap.to(sectionRef.current.querySelector(".hero-content"), {
            yPercent: -30,
            opacity: 0.3,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
    }

    animate();

    return () => {
      ctx?.revert();
    };
  }, []);

  const scrollToProduct = () => {
    document
      .getElementById("product")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* 3D Chrome mask behind the title */}
      <ChromeMaskScene />

      {/* Content - sits on top of the 3D scene */}
      <div className="hero-content relative z-10 text-center flex flex-col items-center pointer-events-none h-full justify-center">
        <h1
          ref={titleRef}
          className="font-display text-[20vw] md:text-[16vw] lg:text-[13vw] leading-[0.85] tracking-[0.01em] text-black mix-blend-multiply opacity-0"
        >
          UNTOLD.
        </h1>

        {/* Bottom group: subtitle + scroll indicator */}
        <div className="absolute bottom-12 md:bottom-16 flex flex-col items-center gap-6">
          <p
            ref={subtitleRef}
            className="font-body text-sm md:text-lg lg:text-xl tracking-[0.5em] uppercase text-gray-500 font-bold opacity-0"
          >
            Limited Edition
          </p>

          <button
            ref={ctaRef}
            onClick={scrollToProduct}
            className="flex flex-col items-center gap-2 group cursor-pointer pointer-events-auto opacity-0"
            aria-label="Voir le produit"
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-body group-hover:text-black transition-colors duration-300">
              Découvrir
            </span>
            <svg
              className="w-4 h-8 text-gray-400 group-hover:text-black transition-colors duration-300"
              viewBox="0 0 16 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <line x1="8" y1="0" x2="8" y2="28" />
              <polyline points="2,22 8,28 14,22" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
