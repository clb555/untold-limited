"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const base =
      "relative inline-flex items-center justify-center font-body uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden group";

    const variants = {
      primary:
        "bg-black text-white hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400",
      secondary:
        "bg-transparent text-black border border-black hover:bg-black hover:text-white disabled:border-gray-300 disabled:text-gray-400",
      ghost:
        "bg-transparent text-gray-500 hover:text-black disabled:text-gray-300",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-8 py-3 text-sm",
      lg: "px-12 py-4 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {/* Hover sweep effect */}
        <span className="absolute inset-0 bg-gray-800 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />

        <span className="relative z-10 flex items-center gap-2">
          {loading && (
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
