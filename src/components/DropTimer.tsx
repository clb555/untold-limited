"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { DROP_END_DATE } from "@/lib/constants";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft | null {
  const diff = new Date(DROP_END_DATE).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isUnderOneHour(t: TimeLeft): boolean {
  return t.days === 0 && t.hours === 0;
}

function TimerDigit({ value, label }: { value: string; label: string }) {
  const digitRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value && digitRef.current) {
      const el = digitRef.current;
      el.style.transform = "translateY(-4px)";
      el.style.opacity = "0.4";
      requestAnimationFrame(() => {
        el.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
        el.style.transform = "translateY(0)";
        el.style.opacity = "1";
        setTimeout(() => {
          el.style.transition = "";
        }, 300);
      });
      prevValue.current = value;
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <span
        ref={digitRef}
        className="font-display text-2xl md:text-3xl leading-none text-black"
      >
        {value}
      </span>
      <span className="text-[10px] tracking-[0.3em] text-gray-400 font-body mt-1">
        {label}
      </span>
    </div>
  );
}

export default function DropTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseCleanup = useRef<(() => void) | null>(null);

  const tick = useCallback(() => {
    setTimeLeft(calculateTimeLeft());
  }, []);

  useEffect(() => {
    setMounted(true);
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Pulse animation when under 1 hour
  useEffect(() => {
    if (!timeLeft || !containerRef.current || !isUnderOneHour(timeLeft)) {
      pulseCleanup.current?.();
      pulseCleanup.current = null;
      return;
    }

    if (pulseCleanup.current) return;

    let cancelled = false;

    async function startPulse() {
      const gsap = (await import("gsap")).default;
      if (cancelled || !containerRef.current) return;

      const tween = gsap.to(containerRef.current, {
        opacity: 0.5,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      pulseCleanup.current = () => {
        tween.kill();
      };
    }

    startPulse();

    return () => {
      cancelled = true;
      pulseCleanup.current?.();
      pulseCleanup.current = null;
    };
  }, [timeLeft]);

  if (!mounted) {
    return (
      <div className="font-body text-xs tracking-[0.2em] uppercase text-gray-600">
        --:--:--:--
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="font-body text-xs tracking-[0.3em] uppercase text-gray-400">
        Drop terminé
      </div>
    );
  }

  const urgent = isUnderOneHour(timeLeft);
  const units = [
    { label: "J", value: pad(timeLeft.days) },
    { label: "H", value: pad(timeLeft.hours) },
    { label: "M", value: pad(timeLeft.minutes) },
    { label: "S", value: pad(timeLeft.seconds) },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span
        className={`text-xs tracking-[0.3em] uppercase font-body ${
          urgent ? "text-gray-700 font-bold" : "text-gray-400"
        }`}
      >
        {urgent ? "Fin imminente" : "Fin du drop dans"}
      </span>
      <div ref={containerRef} className="flex gap-4">
        {units.map(({ label, value }) => (
          <TimerDigit key={label} value={value} label={label} />
        ))}
      </div>
    </div>
  );
}
