"use client";

import { useState } from "react";
import Link from "next/link";
import { m, type PanInfo } from "motion/react";
import posthog from "posthog-js";

import { PriceItemName } from "@/components/price-item-name";
import { Segmented } from "@/components/segmented";
import type { PriceSection } from "@/content/site";
import { portfolioLog } from "@/lib/posthog-logs";

/** Phones / tablets: one category at a time — tap a tab or swipe left/right. */
export function PriceTabs({
  sections,
  notes,
  className = "",
}: {
  sections: PriceSection[];
  notes: { important: string[]; payment: string };
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const section = sections[index];

  /** `direction` follows the gesture (swipe left = forward), also when wrapping around the ends. */
  const select = (i: number, direction?: number) => {
    const next = (i + sections.length) % sections.length;
    if (next === index) return;
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("pricing_category_selected", { category: sections[next].title });
      portfolioLog.pricingCategorySelected(sections[next].title);
    }
    setDir(direction ?? (next > index ? 1 : -1));
    setIndex(next);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) select(index + 1, 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) select(index - 1, -1);
  };

  return (
    <div className={`relative flex h-full flex-col px-4 pt-[clamp(22px,5dvh,56px)] pb-[clamp(10px,2dvh,16px)] sm:px-8 ${className}`}>
      <div className="anim-pop flex justify-center" style={{ ["--d" as string]: "0.35s" }}>
        <Segmented
          id="price-tabs"
          kind="tabs"
          label="Price categories"
          active={section.title}
          onSelect={(key) => select(sections.findIndex((s) => s.title === key))}
          items={sections.map((s) => ({ key: s.title, label: s.title }))}
          className="w-full max-w-md"
          itemClassName="!px-1 !py-2 !text-[11px] !tracking-normal min-[400px]:!text-xs sm:!text-sm"
        />
      </div>

      <div className="relative mt-[clamp(10px,2dvh,24px)] min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-price-panel>
        <m.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          dragSnapToOrigin
          onDragEnd={onDragEnd}
          // fills the whole area so the empty space under short lists is swipeable too
          className="min-h-full touch-pan-y"
        >
          <div className="mb-[clamp(6px,1.3dvh,12px)] flex items-baseline justify-between">
            <h2 className="text-[clamp(22px,3.7dvh,32px)] leading-none tracking-figma uppercase">{section.title}</h2>
            {section.gallery && (
              <Link href={`/gallery#${section.gallery}`} onPointerDown={(event) => event.stopPropagation()} className="text-sm text-white/60 underline-offset-4 active:text-blush">
                Examples →
              </Link>
            )}
          </div>
          <m.ul
            key={section.title}
            initial={dir === 0 ? false : { x: dir * 32 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="divide-y divide-white/10 overflow-hidden rounded-[22px] bg-white/[0.04] ring-1 ring-white/10"
          >
            {section.items.map((item) => (
              <li key={item.name} className={`py-[clamp(7px,1.45dvh,13px)] ${item.keepNameVisible ? "px-3 sm:px-4" : "px-4"}`}>
                <div className={`flex items-baseline gap-x-1.5 gap-y-1 text-[clamp(14px,2.15dvh,17px)] ${item.keepNameVisible ? "flex-wrap" : ""}`}>
                  <PriceItemName name={item.name} keepNameVisible={item.keepNameVisible} />
                  <span className="flex flex-auto items-baseline gap-1.5">
                    <span aria-hidden className="price-leader" />
                    <span className="shrink-0 font-semibold whitespace-nowrap tabular-nums">{item.price}</span>
                  </span>
                </div>
                {item.note && (
                  <p className="mt-0.5 text-[clamp(11.5px,1.65dvh,13.5px)] leading-snug text-white/55">{item.note}</p>
                )}
              </li>
            ))}
          </m.ul>
        </m.div>
      </div>

      {/* dots */}
      <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
        {sections.map((s, i) => (
          <span key={s.title} className={`h-1.5 w-4 rounded-full bg-white/70 motion-safe:transition-transform motion-safe:duration-200 ${i === index ? "scale-x-100" : "scale-x-[0.375]"}`} />
        ))}
      </div>

      <footer className="anim-rise mt-[clamp(6px,1.3dvh,12px)] flex flex-col items-center gap-[clamp(4px,1dvh,8px)] text-center" style={{ ["--d" as string]: "0.6s" }}>
        <p className="rounded-2xl border border-blush/40 bg-blush/10 px-4 py-[clamp(4px,0.9dvh,8px)] text-[clamp(11.5px,1.7dvh,14px)] leading-snug">
          <span className="font-medium tracking-wide text-blush uppercase">Important: </span>
          {notes.important.join(" · ")}
        </p>
        <p className="text-[clamp(14px,2.3dvh,18px)] tracking-figma uppercase">
          {notes.payment}
          <Link href="/tos" className="ml-2 text-[0.8em] tracking-normal text-white/55 normal-case active:text-blush">
            · TOS →
          </Link>
        </p>
      </footer>
    </div>
  );
}
