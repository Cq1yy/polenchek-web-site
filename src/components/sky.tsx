"use client";

import { useEffect } from "react";
import { getImageProps } from "next/image";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

import starsWide from "@/assets/decor/stars-wide.webp";
import starsTall from "@/assets/decor/stars-tall.webp";

// Deterministic pseudo-random so server and client render the same stars.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(7);
const STARS = Array.from({ length: 28 }, () => ({
  x: rand() * 100,
  y: rand() * 100,
  size: rand() < 0.85 ? 1 + rand() * 1.5 : 2.5 + rand() * 1.5,
  delay: rand() * 6,
  duration: 2.5 + rand() * 4,
}));
const SHOOTING = [
  { top: "12%", left: "88%", t: "13s", d: "4s" },
  { top: "34%", left: "102%", t: "19s", d: "11s" },
];

// dark, noisy photo → compresses well at q60; it fades in, so it may load after the page content
const common = { alt: "", sizes: "100vw", quality: 60 };
const {
  props: { srcSet: wideSet },
} = getImageProps({ ...common, src: starsWide });
const {
  props: { srcSet: tallSet, ...tallRest },
} = getImageProps({ ...common, src: starsTall });

/** Fixed night-sky backdrop: slow drift, twinkling + shooting stars, pointer parallax (desktop). */
export function Sky() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 40, damping: 20, mass: 0.8 });
  const bgX = useTransform(sx, (v) => v * -14);
  const bgY = useTransform(sy, (v) => v * -14);
  const starX = useTransform(sx, (v) => v * -30);
  const starY = useTransform(sy, (v) => v * -30);

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-night"
    >
      <m.div className="anim-fade absolute -inset-8" style={{ x: bgX, y: bgY }}>
        <picture>
          <source media="(min-aspect-ratio: 1/1)" srcSet={wideSet} />
          <source media="(max-aspect-ratio: 1/1)" srcSet={tallSet} />
          <img {...tallRest} alt="" className="animate-drift h-full w-full object-cover" fetchPriority="low" decoding="async" />
        </picture>
      </m.div>

      <m.div className="absolute -inset-10" style={{ x: starX, y: starY }}>
        {STARS.map((s, i) => (
          <span
            key={i}
            className="twinkle absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              boxShadow: s.size > 2.4 ? "0 0 8px 2px rgb(200 220 255 / 0.6)" : undefined,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
        {SHOOTING.map((s, i) => (
          <span
            key={i}
            className="shooting-star"
            style={{ top: s.top, left: s.left, ["--t" as string]: s.t, ["--d" as string]: s.d }}
          />
        ))}
      </m.div>

      {/* vignette for legibility */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,transparent_40%,rgb(3_5_10/0.75))]" />
    </div>
  );
}
