"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/tshirt-front.png", alt: "T-shirt UNTOLD – Face avant", label: "Face" },
  { src: "/tshirt-back.png", alt: "T-shirt UNTOLD – Face arrière", label: "Dos" },
] as const;

export default function TshirtScene() {
  const [active, setActive] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setActive(index);
    setIsZoomed(false);
  }, []);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES.length);
    setIsZoomed(false);
  }, []);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setIsZoomed(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setIsZoomed(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  // Mouse zoom tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current || !isZoomed) return;
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPos({ x, y });
    },
    [isZoomed]
  );

  // Touch swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const diff = e.changedTouches[0].clientX - dragStart;
      if (Math.abs(diff) > 50) {
        if (diff < 0) next();
        else prev();
      }
      setIsDragging(false);
    },
    [isDragging, dragStart, next, prev]
  );

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {/* Main image area */}
      <div
        ref={imageRef}
        className="relative w-full aspect-[16/9] bg-gray-50 overflow-hidden cursor-crosshair select-none"
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images stack — crossfade */}
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              unoptimized
              className="object-contain transition-transform duration-500 ease-out"
              style={{
                transform:
                  isZoomed && i === active
                    ? `scale(3.5)`
                    : "scale(1)",
                transformOrigin:
                  isZoomed && i === active
                    ? `${zoomPos.x}% ${zoomPos.y}%`
                    : "center center",
              }}
              priority={i === 0}
              draggable={false}
            />
          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300 group"
          aria-label="Image précédente"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="15,4 7,12 15,20" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300 group"
          aria-label="Image suivante"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="9,4 17,12 9,20" />
          </svg>
        </button>

        {/* Slide counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === active
                  ? "bg-black w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Voir ${SLIDES[i].label}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 justify-center">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => goTo(i)}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 overflow-hidden transition-all duration-300 ${
              i === active
                ? "ring-1 ring-black ring-offset-2"
                : "ring-1 ring-transparent hover:ring-gray-200 ring-offset-2 opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.label}
              fill
              className="object-contain p-1"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Label */}
      <p className="text-center text-[10px] tracking-[0.3em] uppercase text-gray-400 font-body">
        {SLIDES[active].label}
        <span className="mx-2 text-gray-200">·</span>
        Cliquer pour zoomer
      </p>
    </div>
  );
}
