"use client";

import { useEffect, useRef } from "react";

export default function Manifeste() {
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;

    async function animate() {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const lines = [line1Ref.current, line2Ref.current];
        gsap.fromTo(
          lines,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.25,
            ease: "power3.out",
            scrollTrigger: {
              trigger: line1Ref.current,
              start: "top 80%",
            },
          }
        );

        gsap.fromTo(
          dividerRef.current,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: dividerRef.current,
              start: "top 85%",
            },
          }
        );

        gsap.fromTo(
          line3Ref.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: line3Ref.current,
              start: "top 85%",
            },
          }
        );
      });
    }

    animate();
    return () => ctx?.revert();
  }, []);

  return (
    <section id="manifeste" className="py-32 md:py-48 px-6 bg-black">
      <div className="max-w-3xl mx-auto">
        <p
          ref={line1Ref}
          className="font-body text-xl md:text-2xl text-white tracking-widest uppercase opacity-0 leading-relaxed"
        >
          Le pouvoir se dissimule.
        </p>
        <p
          ref={line2Ref}
          className="font-body text-xl md:text-2xl text-white tracking-widest uppercase opacity-0 leading-relaxed mt-2"
        >
          La vérité, non.
        </p>

        <div
          ref={dividerRef}
          className="w-16 h-px bg-white opacity-25 my-12 origin-left opacity-0"
        />

        <p
          ref={line3Ref}
          className="font-accent text-2xl md:text-3xl text-white opacity-0 leading-snug italic"
        >
          Certaines vérités méritent d&apos;être portées.
        </p>
      </div>
    </section>
  );
}
