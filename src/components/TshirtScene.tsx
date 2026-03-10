"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

export default function TshirtScene() {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col gap-4 w-full mx-auto">
      {/* Main image */}
      <div
        ref={imageRef}
        className="relative w-full aspect-[16/9] bg-gray-50 overflow-hidden cursor-crosshair select-none"
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src="/tshirt-front.png"
          alt="T-shirt UNTOLD – Face avant"
          fill
          unoptimized
          className="object-contain transition-transform duration-500 ease-out"
          style={{
            transform: isZoomed ? "scale(3.5)" : "scale(1)",
            transformOrigin: isZoomed
              ? `${zoomPos.x}% ${zoomPos.y}%`
              : "center center",
          }}
          priority
          draggable={false}
        />
      </div>

      {/* Label */}
      <p className="text-center text-[10px] tracking-[0.3em] uppercase text-gray-400 font-body">
        Face avant
        <span className="mx-2 text-gray-200">·</span>
        Cliquer pour zoomer
      </p>
    </div>
  );
}
