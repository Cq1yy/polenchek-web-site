"use client";

import Link from "next/link";

import { LiquidLayers } from "@/components/liquid-glass";

export type SegmentItem = { key: string; label: string; href?: string };

/** Keep one glass track and move a single tinted indicator across its equal-width segments. */
export function Segmented({
  id,
  items,
  active,
  onSelect,
  kind = "links",
  className = "",
  itemClassName = "",
  label,
}: {
  id: string;
  items: SegmentItem[];
  active: string;
  onSelect?: (key: string) => void;
  kind?: "links" | "tabs" | "buttons";
  className?: string;
  itemClassName?: string;
  label: string;
}) {
  const activeIndex = items.findIndex((item) => item.key === active);
  const itemClasses = `relative flex min-w-0 items-center justify-center rounded-full px-3 py-2.5 text-[13px] font-medium tracking-wide text-white uppercase outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-5 sm:text-sm ${itemClassName}`;

  return (
    <div
      id={id}
      role={kind === "tabs" ? "tablist" : "group"}
      aria-label={label}
      className={`lg-host relative isolate max-w-full rounded-full p-1 ${className}`}
    >
      <LiquidLayers tint="rgb(255 255 255 / 0.05)" shine={false} />
      <div className="relative grid auto-cols-fr grid-flow-col">
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 rounded-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out"
            style={{ width: `${100 / items.length}%`, transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="lg-tint rounded-full bg-white/[0.16]" />
            <span className="lg-rim rounded-full" />
          </span>
        )}
        {items.map((item) => {
          const selected = item.key === active;
          const text = <span className="truncate">{item.label}</span>;
          if (kind === "links" && item.href) {
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={itemClasses}
                onClick={() => onSelect?.(item.key)}
              >
                {text}
              </Link>
            );
          }
          return (
            <button
              key={item.key}
              type="button"
              role={kind === "tabs" ? "tab" : undefined}
              aria-selected={kind === "tabs" ? selected : undefined}
              aria-current={kind === "buttons" && selected ? "true" : undefined}
              className={itemClasses}
              onClick={() => onSelect?.(item.key)}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
