import type { Metadata } from "next";
import type { ReactNode } from "react";

import titleImg from "@/assets/decor/title-tos.webp";
import { LiquidLink } from "@/components/liquid-button";
import { ScriptTitle } from "@/components/script-title";
import { drawing, tos } from "@/content/site";

export const metadata: Metadata = { title: "Terms of Service" };

const d = (s: number) => ({ ["--d" as string]: `${s}s` }) as React.CSSProperties;

export default function TosPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pt-[calc(var(--nav-h)+4px)] pb-20 md:w-[min(1280px,88vw)] md:px-0">
      <ScriptTitle
        src={titleImg}
        alt="Terms of Service"
        delay={0.25}
        sizes="(min-width: 768px) 44vw, 92vw"
        className="pointer-events-none relative z-10 mx-auto -mb-[clamp(28px,6vw,80px)] w-[min(94vw,520px)] md:w-[min(44vw,62vh*2)] md:max-w-[680px]"
      />

      <div className="relative rounded-[36px] px-5 pt-[clamp(40px,8vw,96px)] pb-10 sm:px-8 md:rounded-[48px] md:px-[clamp(32px,4.5vw,72px)] md:pb-[clamp(36px,4vw,64px)]">
        <span aria-hidden className="glass-bg anim-panel" style={d(0.1)} />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-[clamp(40px,5vw,80px)]">
          {tos.map((section, si) => (
            <section key={section.title} aria-labelledby={`tos-${si}`}>
              <h2
                id={`tos-${si}`}
                className="anim-rise mb-5 text-3xl tracking-figma uppercase md:mb-7 md:text-[clamp(30px,2.8vw,44px)] md:leading-none"
                style={d(0.35 + si * 0.1)}
              >
                {section.title}
              </h2>
              <ol className="flex flex-col gap-4 md:gap-5">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="reveal flex gap-3 text-[15px] leading-relaxed text-white/85 md:text-[clamp(15px,1.15vw,18px)]"
                    style={{ ["--i" as string]: Math.min(i, 3) }}
                  >
                    <span aria-hidden className="mt-[0.1em] shrink-0 text-blush">
                      ☆
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <div
          role="group"
          aria-label="Commission subjects"
          className="relative mx-auto mt-12 w-full max-w-[1091px] rounded-[clamp(24px,2.5vw,48px)] border-2 border-white px-4 py-[clamp(22px,3vw,48px)] sm:px-7 md:mt-16 md:w-[min(70vw,1091px)] lg:w-[min(57vw,1091px)]"
        >
          <div className="grid divide-y divide-white md:grid-cols-2 md:divide-x md:divide-y-0">
            <DrawingColumn id="i-draw" title="I DRAW" items={drawing.allowed} />
            <DrawingColumn
              id="i-dont-draw"
              title={<>I DON’T{" "}<br className="hidden md:block" />DRAW</>}
              items={drawing.excluded}
            />
          </div>
        </div>

        <div className="reveal relative mt-12 flex flex-col items-center gap-4 text-center md:mt-16">
          <p className="text-sm tracking-[0.2em] text-white/55 uppercase">Ready to order?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <LiquidLink href="/gallery" className="h-12 px-7 font-medium tracking-wide uppercase">
              Gallery
            </LiquidLink>
            <LiquidLink href="/price" className="h-12 px-7 font-medium tracking-wide uppercase">
              See prices
            </LiquidLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawingColumn({ id, title, items }: { id: string; title: ReactNode; items: string[] }) {
  return (
    <section
      aria-labelledby={id}
      className="min-w-0 first:pb-6 last:pt-6 md:px-[clamp(16px,2.4vw,48px)] md:first:pb-0 md:last:pt-0"
    >
      <h2
        id={id}
        className="mb-5 text-center text-[clamp(24px,2.5vw,48px)] leading-none tracking-figma md:min-h-[2em]"
      >
        {title}
      </h2>
      <ul className="grid gap-3 text-[15px] leading-relaxed text-white/85 md:text-[clamp(15px,1.15vw,18px)]">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden className="shrink-0 text-blush">☆</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
