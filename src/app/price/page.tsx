import type { Metadata } from "next";
import Link from "next/link";

import titleImg from "@/assets/decor/title-price.webp";
import { PriceItemName } from "@/components/price-item-name";
import { PriceTabs } from "@/components/price-tabs";
import { ScriptTitle } from "@/components/script-title";
import { priceNotes, prices, type PriceSection } from "@/content/site";

export const metadata: Metadata = { title: "Price" };

const d = (s: number) => ({ ["--d" as string]: `${s}s` }) as React.CSSProperties;

/**
 * The whole price list fits one screen: the page is exactly 100dvh and the panel is a
 * size container. On desktop every size is expressed in --u (≈1% of the panel height,
 * capped by its width), so the layout scales to any window instead of overflowing.
 * Phones/tablets get swipeable tabs instead.
 */
export default function PricePage() {
  return (
    <div className="flex h-dvh flex-col items-center px-4 pt-[calc(var(--nav-h)+4px)] pb-[max(env(safe-area-inset-bottom),14px)] md:px-[4vw] md:pb-[3vh]">
      <ScriptTitle
        src={titleImg}
        alt="Price"
        delay={0.25}
        sizes="(min-width: 768px) 40vw, 80vw"
        className="relative z-10 -mb-[clamp(16px,3.6vh,52px)] shrink-0"
        imgClassName="h-[clamp(62px,13.5vh,180px)] w-auto"
      />

      <div className="relative min-h-0 w-full max-w-[1280px] flex-1 rounded-[32px] [container-type:size] lg:rounded-[min(6cqh,48px)]">
        <span aria-hidden className="glass-bg anim-panel" style={d(0.1)} />
        <PriceBoard />
        <PriceTabs sections={prices} notes={priceNotes} className="lg:hidden" />
      </div>
    </div>
  );
}

function PriceBoard() {
  const main = prices.filter((s) => s.items.length <= 2);
  const special = prices.filter((s) => s.items.length > 2);
  return (
    <div className="price-board relative hidden h-full flex-col lg:flex">
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))_minmax(min-content,1fr)] gap-[calc(var(--u)*2.2)]">
        {main.map((s, i) => (
          <Card key={s.title} section={s} delay={0.35 + i * 0.08} />
        ))}
      </div>
      {special.map((s) => (
        <Card key={s.title} section={s} delay={0.6} wide />
      ))}
      <footer className="anim-rise mt-auto flex items-center justify-between gap-[calc(var(--u)*3)]" style={d(0.8)}>
        <p className="pb-note flex flex-wrap items-center gap-x-[calc(var(--u)*1.2)] rounded-full border border-blush/40 bg-blush/10 px-[calc(var(--u)*2.2)] py-[calc(var(--u)*0.9)]">
          <span className="font-medium tracking-wide text-blush uppercase">Important</span>
          {priceNotes.important.map((t, i) => (
            <span key={t} className="text-white/90">
              {i > 0 && <span className="mr-[calc(var(--u)*1.2)] text-white/40">·</span>}
              {t}
            </span>
          ))}
        </p>
        <div className="flex flex-col items-end gap-[calc(var(--u)*0.8)]">
          <p className="pb-pay tracking-figma uppercase">{priceNotes.payment}</p>
          <Link href="/tos" className="pb-note text-white/55 transition-colors hover:text-blush">
            Terms of service →
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Card({ section, delay, wide = false }: { section: PriceSection; delay: number; wide?: boolean }) {
  return (
    <article
      className={`price-card anim-rise ${wide ? "mt-[calc(var(--u)*2.6)]" : ""}`}
      style={d(delay)}
    >
      <header className="mb-[calc(var(--u)*1.8)] flex items-baseline justify-between gap-4">
        <h2 className="pb-head tracking-figma uppercase">{section.title}</h2>
        {section.gallery && (
          <Link
            href={`/gallery#${section.gallery}`}
            className="pb-note text-white/55 transition-colors hover:text-blush"
          >
            Examples →
          </Link>
        )}
      </header>
      <ul className={wide ? "grid grid-cols-2 gap-x-[calc(var(--u)*4)] gap-y-[calc(var(--u)*2)]" : "flex flex-col gap-[calc(var(--u)*2)]"}>
        {section.items.map((item) => (
          <li key={item.name} className="group">
            <div className="pb-name flex items-baseline gap-[calc(var(--u)*1)]">
              <PriceItemName name={item.name} keepNameVisible={item.keepNameVisible} />
              <span aria-hidden className="price-leader" />
              <span title={item.price} className={`shrink-0 text-right font-semibold text-white tabular-nums transition-colors duration-300 group-hover:text-blush ${item.keepNameVisible ? "whitespace-nowrap" : "max-w-[65%] truncate"}`}>{item.price}</span>
            </div>
            {item.note && <p className="pb-note mt-[calc(var(--u)*0.3)] text-white/55">{item.note}</p>}
          </li>
        ))}
      </ul>
    </article>
  );
}
