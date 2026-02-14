"use client";

import { PRODUCT, Size } from "@/lib/constants";

interface SizeSelectorProps {
  selected: Size | null;
  onSelect: (size: Size) => void;
  disabled?: boolean;
}

export default function SizeSelector({
  selected,
  onSelect,
  disabled = false,
}: SizeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-[0.3em] text-gray-400 font-body">
        Taille
      </span>
      <div className="flex gap-3">
        {PRODUCT.sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            disabled={disabled}
            className={`
              w-14 h-14 flex items-center justify-center
              border text-sm font-body uppercase tracking-widest
              transition-all duration-300
              ${
                selected === size
                  ? "border-black bg-black text-white scale-105"
                  : "border-gray-200 text-gray-400 hover:border-black hover:text-black hover:scale-105"
              }
              ${disabled ? "opacity-30 cursor-not-allowed hover:scale-100" : "cursor-pointer"}
            `}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
