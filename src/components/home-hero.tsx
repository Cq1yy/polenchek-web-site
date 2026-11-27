"use client";

import Image from "next/image";
import posthog from "posthog-js";

import socialIcons from "@/assets/decor/social-icons.svg";
import titleImg from "@/assets/decor/title-polenchek.webp";
import { LiquidLink } from "@/components/liquid-button";
import { ScriptTitle } from "@/components/script-title";
import { portfolioLog } from "@/lib/posthog-logs";
import { SECTIONS } from "@/lib/routes";
import { site, socials } from "@/content/site";

const d = (s: number) => ({ ["--d" as string]: `${s}s` }) as React.CSSProperties;

/**
 * Home screen.
 *
 * desk (≥768px wide and ≥500px tall): follows the 1920px Figma frame. Positions are in
 * container-query units (cqw) relative to the 1190px glass panel:
 *   - the signature crosses the panel's top edge, like in the mockup;
 *   - under it (right of the avatar) sits `site.intro`; long text grows the panel downwards
 *     instead of running into the buttons;
 *   - the space above the panel is reserved (pt-[19cqw]) so the signature never reaches the nav.
 * The block is sized by BOTH viewport width and height (≈0.76 × width tall), so on
 * wide-but-short screens it shrinks instead of sliding under the navigation.
 * Phones (incl. landscape): everything stacks vertically.
 */
export function HomeHero() {
  const paragraphs = site.intro.split(/\n{2,}/).filter(Boolean);

  return (
    <section className="flex min-h-dvh items-center justify-center px-4 pt-[calc(var(--nav-h)+28px)] pb-10 desk:pt-[calc(var(--nav-h)+3vh)] desk:pb-[3vh]">
      <div className="@container w-full max-w-[520px] desk:w-[min(1190px,68vw,calc((100dvh-var(--nav-h)-8vh)/0.76))] desk:max-w-none">
        <div className="relative desk:pt-[19cqw]">
          <div className="relative">
            {/* Avatar */}
            <div
              className="anim-avatar relative z-10 mx-auto aspect-square w-[44vw] max-w-[230px] desk:absolute desk:-top-[12.86cqw] desk:-left-[8.66cqw] desk:w-[38.8cqw] desk:max-w-none"
              style={d(0.15)}
            >
              <div className="float relative h-full w-full overflow-hidden rounded-full bg-blush shadow-[0_0_90px_-10px_rgb(233_185_185/0.55)] ring-1 ring-white/30">
                {site.avatar && (
                  <Image src={site.avatar} alt={site.name} fill sizes="(min-width: 768px) 30vw, 44vw" className="object-cover" preload />
                )}
              </div>
            </div>

            {/* Panel — at least the Figma proportions (1190×509), taller if the intro needs it */}
            <div className="relative -mt-[min(12vw,62px)] flex flex-col items-center rounded-[40px] px-5 pt-[min(5vw,26px)] pb-7 desk:mt-0 desk:min-h-[42.8cqw] desk:items-stretch desk:rounded-[6.4cqw] desk:px-0 desk:pt-[11.5cqw] desk:pb-[3.5cqw]">
              <span aria-hidden className="glass-bg anim-panel" style={d(0.05)} />

              <ScriptTitle
                src={titleImg}
                alt={site.name}
                delay={0.15}
                sizes="(min-width: 768px) 64vw, 100vw"
                className="pointer-events-none relative z-20 -mx-4 w-[calc(100%+2rem)] desk:absolute desk:-top-[20.7cqw] desk:left-[11.1cqw] desk:mx-0 desk:w-[95cqw]"
              />

              {/* Intro text (right of the avatar). On desktop it keeps its slot even when empty so the buttons stay put. */}
              <div
                className="anim-rise relative flex flex-col justify-center gap-[0.7em] text-center text-[15px] leading-relaxed text-balance text-white/80 empty:hidden desk:ml-[33cqw] desk:mr-[6cqw] desk:min-h-[20cqw] desk:text-[max(13px,1.75cqw)] mt-3 desk:mt-0 desk:empty:flex"
                style={d(0.25)}
              >
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="relative mt-5 flex w-full flex-col gap-3 sm:flex-row sm:justify-center desk:mt-auto desk:gap-[6cqw] desk:pt-[2cqw]">
                {SECTIONS.map((b, i) => (
                  <div key={b.href} className="anim-pop" style={d(0.22 + i * 0.05)}>
                    <LiquidLink
                      href={b.href}
                      className="h-14 w-full text-lg font-medium tracking-[0.02em] uppercase sm:w-36 desk:h-[max(40px,5.8cqw)] desk:w-[22.45cqw] desk:text-[max(13px,2.3cqw)]"
                    >
                      {b.label}
                    </LiquidLink>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social networks */}
          <div className="mt-8 flex flex-col items-center gap-4 desk:mt-[3cqw] desk:gap-[1.6cqw]">
            <p className="anim-rise text-xl tracking-figma uppercase desk:text-[max(16px,3.2cqw)] desk:leading-none" style={d(0.35)}>
              Social networks
            </p>
            <ul className="flex max-w-56 flex-wrap justify-center gap-2 min-[26rem]:max-w-none sm:gap-3">
              {socials.map((s, i) => {
                const external = /^https?:\/\//.test(s.href);
                return (
                  <li key={s.label} className="anim-pop" style={d(0.4 + i * 0.05)}>
                    <LiquidLink
                      href={s.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      aria-label={s.label}
                      title={s.label}
                      className="size-11 rounded-full transition-colors hover:text-blush focus-visible:text-blush focus-visible:ring-2 focus-visible:ring-blush sm:size-12"
                      onClick={() => {
                        if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
                          posthog.capture("contact_channel_selected", { channel: s.label });
                          portfolioLog.contactChannelSelected(s.label);
                        }
                      }}
                    >
                      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-[22px] fill-current">
                        <use href={`${socialIcons.src}#${s.icon}`} />
                      </svg>
                    </LiquidLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
