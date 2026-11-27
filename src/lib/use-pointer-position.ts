"use client";

import { useEffect, type RefObject } from "react";

type PositionEffect = (element: HTMLElement, x: number, y: number) => void;

/** Read the hovered control's bounds at most once per frame, even on high-rate mice. */
export function usePointerPosition(
  ref: RefObject<HTMLElement | null>,
  update: PositionEffect,
  reset: (element: HTMLElement) => void,
  options: { enabled?: boolean; trackParent?: boolean } = {},
) {
  const { enabled = true, trackParent = false } = options;
  useEffect(() => {
    const layer = ref.current;
    const host = trackParent ? layer?.parentElement : layer;
    if (!layer || !host || !enabled) return;

    const media = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame: number | undefined;
    let clientX = 0;
    let clientY = 0;
    const draw = () => {
      frame = undefined;
      const rect = host.getBoundingClientRect();
      if (rect.width && rect.height) update(layer, (clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !media.matches) return;
      clientX = event.clientX;
      clientY = event.clientY;
      frame ??= requestAnimationFrame(draw);
    };
    const clear = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      reset(layer);
    };

    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", clear);
    media.addEventListener("change", clear);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", clear);
      media.removeEventListener("change", clear);
      clear();
    };
  }, [ref, update, reset, enabled, trackParent]);
}
