"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import circle from "@/assets/glass/pill-1.png";
import shortPill from "@/assets/glass/pill-2.png";
import longPill from "@/assets/glass/pill-4.png";
import bar from "@/assets/glass/pill-8.png";
import { usePointerPosition } from "@/lib/use-pointer-position";

const maps = [circle, shortPill, longPill, bar];
const fine = "(pointer: fine)";
const opaque = "(prefers-reduced-transparency: reduce)";

function supportsRefraction() {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
  return !!brands?.some((b) => b.brand === "Chromium") && matchMedia(fine).matches && !matchMedia(opaque).matches;
}

function subscribe(onChange: () => void) {
  const media = [matchMedia(fine), matchMedia(opaque)];
  media.forEach((m) => m.addEventListener("change", onChange));
  return () => media.forEach((m) => m.removeEventListener("change", onChange));
}

function shineAt(layer: HTMLElement, x: number, y: number) {
  layer.style.setProperty("--lg-x", `${x * 100}%`);
  layer.style.setProperty("--lg-y", `${y * 100}%`);
}

function resetShine(layer: HTMLElement) {
  layer.style.removeProperty("--lg-x");
  layer.style.removeProperty("--lg-y");
}

export function LiquidLayers({
  radius = 999,
  strength = 1,
  tint = "rgb(255 255 255 / 0.06)",
  shine = true,
}: {
  radius?: number;
  strength?: number;
  tint?: string;
  shine?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const refract = useSyncExternalStore(subscribe, supportsRefraction, () => false);
  const id = `lg${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [size, setSize] = useState({ w: 0, h: 0 });
  usePointerPosition(ref, shineAt, resetShine, { enabled: shine, trackParent: true });

  useEffect(() => {
    if (!refract || !ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [refract]);

  const { w, h } = size;
  const pill = radius >= Math.min(w, h) / 2;
  const map = refract && w > 0 && h > 0 && pill
    ? maps[Math.max(0, Math.min(maps.length - 1, Math.round(Math.log2(w / h))))]
    : null;
  const rounded = { borderRadius: radius };
  return (
    <span ref={ref} aria-hidden className="lg-layers" style={rounded}>
      <span className="lg-backdrop" style={map ? { backdropFilter: `url(#${id}) blur(0.6px) saturate(1.8) brightness(1.08)` } : undefined} />
      <span className="lg-tint" style={{ background: tint }} />
      {shine && <span className="lg-shine" />}
      <span className="lg-rim" />
      {map && (
        <svg width="0" height="0" className="absolute" focusable="false">
          <filter id={id} x="0" y="0" width={w} height={h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feImage href={map.src} width={w} height={h} preserveAspectRatio="none" result="lens" />
            <feDisplacementMap in="SourceGraphic" in2="lens" scale={Math.min(h, 60) * 0.9 * strength} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
    </span>
  );
}
