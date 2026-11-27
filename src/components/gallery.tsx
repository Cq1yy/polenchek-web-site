"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, m, useIsPresent, useReducedMotion, type PanInfo } from "motion/react";
import posthog from "posthog-js";

import type { Artwork, GallerySection } from "@/content/site";
import { DesktopMosaic, useDesktopGallery } from "@/components/desktop-gallery";
import { LiquidButton } from "@/components/liquid-button";
import { Segmented } from "@/components/segmented";
import { galleryDesktopPreviewWidth, galleryPreviewSizes, isPortrait } from "@/lib/gallery-images";
import { portfolioLog } from "@/lib/posthog-logs";
import { usePointerPosition } from "@/lib/use-pointer-position";

const ease = [0.22, 1, 0.36, 1] as const;

export function Gallery({ sections }: { sections: GallerySection[] }) {
  const all = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const [openId, setOpenId] = useState<string | null>(null);
  // The card that opened the lightbox — focus goes back to it on close.
  // (Safari does not focus buttons on click, so document.activeElement is not enough.)
  const openerRef = useRef<HTMLElement | null>(null);
  const open = (id: string, el?: HTMLElement | null) => {
    const category = sections.find((section) => section.items.some((art) => art.id === id))?.id;
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("gallery_artwork_opened", { artwork_id: id, category });
      portfolioLog.artworkOpened(id, category);
    }
    openerRef.current = el ?? null;
    setOpenId(id);
  };
  const index = openId ? all.findIndex((a) => a.id === openId) : -1;
  const desktop = useDesktopGallery();

  return (
    <>
      <GallerySections sections={sections} open={open} desktop={desktop} viewedId={openId} />

      <Portal>
        <AnimatePresence>
          {openId && index >= 0 && (
            <Lightbox
              key="lightbox"
              items={all}
              index={index}
              desktop={desktop}
              openerRef={openerRef}
              onClose={() => setOpenId(null)}
              onIndex={(i) => setOpenId(all[(i + all.length) % all.length].id)}
            />
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}

function GallerySections({ sections, open, desktop, viewedId }: {
  desktop: boolean;
  viewedId: string | null;
  sections: GallerySection[];
  open: (id: string, el?: HTMLElement | null) => void;
}) {
  const active = useActiveSection(sections.map((s) => s.id));
  // A direct link from Price may arrive before the desktop layout hydrates.
  useEffect(() => {
    if (!desktop) return;
    const id = window.location.hash.slice(1);
    if (sections.some((section) => section.id === id)) {
      document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [desktop, sections]);

  function jump(id: string) {
    if (desktop && window.location.hash !== `#${id}`) {
      window.history.pushState(null, "", `#${id}`);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ block: "start", behavior: reduce ? "instant" : "smooth" });
  }

  return (
    <>
      {/* Section jumper — sticks under the nav */}
      <div className="gallery-jumper anim-pop sticky top-[calc(var(--nav-h)+8px)] z-30 mb-10 flex justify-center md:mb-[4vw]" style={{ ["--d" as string]: "0.6s" }}>
        <Segmented
          id="gallery-sections"
          kind="buttons"
          label="Gallery sections"
          active={active}
          onSelect={jump}
          items={sections.map((s) => ({ key: s.id, label: s.title }))}
          itemClassName="!py-2 !text-xs sm:!text-[13px]"
        />
      </div>

      <div className="gallery-sections flex flex-col gap-16 md:gap-[6vw]">
        {sections.map((section, si) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`g-${section.id}`}
            className="scroll-mt-36 md:last:min-h-[calc(100dvh-15rem)]"
          >
            <h2
              id={`g-${section.id}`}
              className="reveal mb-6 text-center text-4xl tracking-figma uppercase md:mb-[2.2vw] md:text-[3.33vw] md:leading-none"
            >
              {section.title}
            </h2>
            {desktop ? (
              <DesktopMosaic section={section} onOpen={open} viewedId={viewedId} />
            ) : (
              <Row items={section.items} onOpen={open} eager={si === 0} />
            )}
          </section>
        ))}
      </div>
    </>
  );
}

/** Which section is currently in the middle of the screen. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join("|");
  useEffect(() => {
    const els = key.split("|").map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
}

/** Renders into <body> so the lightbox sits above the fixed nav (main has its own stacking context). */
function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return mounted ? createPortal(children, document.body) : null;
}

function Row({
  items,
  onOpen,
  eager = false,
}: {
  items: Artwork[];
  onOpen: (id: string, el?: HTMLElement | null) => void;
  /** first section on the page: load its images right away (they are the LCP) */
  eager?: boolean;
}) {
  const previews = items.map((art, order) => ({ art, order, portrait: isPortrait(art.src) }));
  const portraits = previews.filter(({ portrait }) => portrait);
  const landscapes = previews.filter(({ portrait }) => !portrait);

  // Flatten the mobile groups into a single scroll container on desktop.
  return (
    <m.div
      layoutScroll
      className="flex flex-col gap-4 md:-mx-4 md:snap-x md:snap-mandatory md:scroll-px-4 md:flex-row md:items-center md:gap-[1.5vw] md:overflow-x-auto md:overscroll-x-contain md:px-4 md:pt-2 md:pb-3"
    >
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] md:contents [&::-webkit-scrollbar]:hidden"
      >
        {portraits.map(({ art, order }, i) => (
          <Card key={art.id} art={art} order={order} onOpen={onOpen} eager={eager} priority={eager && i === 0} />
        ))}
      </div>
      {landscapes.length > 0 && (
        <div className="gallery-landscapes flex flex-col gap-4 md:contents">
          {landscapes.map(({ art, order }, i) => (
            <Card key={art.id} art={art} order={order} onOpen={onOpen} landscape revealIndex={i % 2} />
          ))}
        </div>
      )}
    </m.div>
  );
}

function tiltCard(el: HTMLElement, x: number, y: number) {
  el.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 9}deg`);
  el.style.setProperty("--gx", `${x * 100}%`);
  el.style.setProperty("--gy", `${y * 100}%`);
}

function resetTilt(el: HTMLElement) {
  for (const prop of ["--rx", "--ry", "--gx", "--gy"]) el.style.removeProperty(prop);
}

function Card({
  art,
  order,
  onOpen,
  landscape = false,
  revealIndex = 0,
  eager = false,
  priority = false,
}: {
  art: Artwork;
  order: number;
  onOpen: (id: string, el?: HTMLElement | null) => void;
  landscape?: boolean;
  revealIndex?: number;
  eager?: boolean;
  priority?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  usePointerPosition(ref, tiltCard, resetTilt);

  return (
    <div
      className={`reveal-art md:shrink-0 md:snap-start md:[order:var(--gallery-order)] md:[width:var(--gallery-width)] ${
        landscape ? "" : "w-[72vw] max-w-[340px] shrink-0 snap-center md:max-w-none"
      }`}
      style={{
        ["--gallery-order" as string]: order,
        ["--gallery-width" as string]: galleryDesktopPreviewWidth(art.src),
        ["--i" as string]: revealIndex,
      }}
    >
      <button
        ref={ref}
        type="button"
        onClick={() => {
          if (ref.current) resetTilt(ref.current);
          onOpen(art.id, ref.current);
        }}
        className="tilt group block w-full cursor-zoom-in rounded-[32px]"
        aria-label={`Open ${art.alt}`}
      >
        <m.div
          layoutId={`art-${art.id}`}
          className={`relative w-full overflow-hidden bg-white/5 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.9)] md:[aspect-ratio:var(--gallery-aspect)] ${
            landscape ? "aspect-[1036/625]" : "aspect-[521/762]"
          }`}
          // radius lives in style so Motion keeps it undistorted during the morph
          style={{
            ["--gallery-aspect" as string]: `${art.src.width} / ${art.src.height}`,
            borderRadius: landscape ? 36 : 32,
          }}
          transition={{ duration: 0.6, ease }}
        >
          <Image
            src={art.src}
            alt={art.alt}
            fill
            placeholder="blur"
            loading={eager ? "eager" : undefined}
            fetchPriority={priority ? "high" : undefined}
            sizes={galleryPreviewSizes(art.src)}
            className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
          />
          {/* glare */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(60% 60% at var(--gx,50%) var(--gy,0%), rgb(255 255 255 / 0.55), transparent 70%)" }}
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/15 ring-inset" />
        </m.div>
      </button>
    </div>
  );
}

function lightboxWidth(art: Artwork) {
  return `min(92vw, calc((100dvh - 150px) * ${art.src.width / art.src.height}))`;
}

const fullPhoto = {
  x: 0, y: 0, scale: 1, opacity: 1,
  clipPath: "inset(0px 0px 0px 0px round 24px)",
};

const returnDuration = 0.32;
const handoffDuration = 0.12;

function findThumbnail(id: string) {
  return document.querySelector<HTMLElement>(`[data-gallery-artwork="${CSS.escape(id)}"]`);
}

function thumbnailPose(frame: HTMLElement, id: string) {
  const full = frame.getBoundingClientRect();
  const tile = findThumbnail(id);
  const box = tile?.getBoundingClientRect();
  if (!tile || !box?.width || !box.height || !full.width || !full.height ||
      box.bottom <= 0 || box.top >= document.documentElement.clientHeight) {
    return null;
  }

  // Match the thumbnail's centered object-cover crop without stretching the artwork.
  const scale = Math.max(box.width / full.width, box.height / full.height);
  // Fixed decimals keep subpixel rounding errors out of Motion's clip-path tokenization.
  const dx = Math.max(0, (full.width - box.width / scale) / 2).toFixed(3);
  const dy = Math.max(0, (full.height - box.height / scale) / 2).toFixed(3);
  const radius = (parseFloat(getComputedStyle(tile).borderTopLeftRadius) / scale).toFixed(3);
  return {
    x: box.left - full.left + (box.width - full.width) / 2,
    y: box.top - full.top + (box.height - full.height) / 2,
    scale, opacity: 1,
    clipPath: `inset(${dy}px ${dx}px ${dy}px ${dx}px round ${radius}px)`,
  };
}

function Lightbox({
  desktop,
  items,
  index,
  onClose,
  onIndex,
  openerRef,
}: {
  items: Artwork[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
  desktop: boolean;
  openerRef: React.RefObject<HTMLElement | null>;
}) {
  const art = items[index];
  const reducedMotion = useReducedMotion();
  const present = useIsPresent();
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const animateDesktop = desktop && !reducedMotion;
  const [dir, setDir] = useState(0);
  const [switched, setSwitched] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    if (!present) return;
    setDir(0);
    onClose();
  }, [onClose, present]);

  const go = useCallback(
    (d: number) => {
      if (!present) return;
      setDir(d);
      setSwitched(true);
      onIndex(index + d);
    },
    [index, onIndex, present],
  );

  // Scroll lock + focus management (focus returns to the card on close).
  useEffect(() => {
    const opener = openerRef.current ?? (document.activeElement as HTMLElement | null);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.style.overflow = prev;
      opener?.focus({ preventScroll: true });
    };
  }, [openerRef]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, close]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 && Math.abs(info.offset.x) < 80) return close();
    if (info.offset.x < -80 || info.velocity.x < -500) go(1);
    else if (info.offset.x > 80 || info.velocity.x > 500) go(-1);
  };

  const ratio = art.src.width / art.src.height;
  const width = lightboxWidth(art);
  const image = (
    <Image src={art.src} alt={art.alt} fill placeholder="blur" sizes={width}
      quality={90} loading="eager" fetchPriority="high" className="pointer-events-none object-cover" />
  );
  const neighbours = [...new Set([items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]])]
    .filter((item) => item.id !== art.id);

  return (
    <m.div role="dialog" aria-modal="true" aria-label={art.alt} className="fixed inset-0 z-[60] flex items-center justify-center" exit={{ opacity: 1 }}>
      <m.div
        className="absolute inset-0 bg-[#03050a]/85 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={animateDesktop
          ? { opacity: 0, transition: { delay: returnDuration / 2, duration: returnDuration / 2 } }
          : { opacity: 0 }}
        transition={{ duration: 0.45 }}
        onClick={close}
      />

      {desktop ? (
        <div ref={setFrame} className="pointer-events-none relative z-10" style={{ width, aspectRatio: ratio }}>
          {frame && (
            <m.div
              key={art.id}
              className="pointer-events-auto absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
              variants={{
                tile: () => thumbnailPose(frame, art.id) ?? { ...fullPhoto, opacity: 0 },
                returnToTile: () => {
                  const tile = thumbnailPose(frame, art.id);
                  if (!tile) return { opacity: 0, transition: { duration: handoffDuration } };
                  // Let the real tile take over only after the crop and position have settled.
                  return {
                    ...tile,
                    opacity: 0,
                    transition: {
                      duration: returnDuration, ease,
                      opacity: { delay: returnDuration, duration: handoffDuration, ease: "linear" },
                    },
                  };
                },
                slide: { ...fullPhoto, x: dir * 140, scale: 0.94 },
                center: fullPhoto,
              }}
              initial={animateDesktop ? (switched ? "slide" : "tile") : false}
              animate="center"
              exit={animateDesktop ? "returnToTile" : { opacity: 0 }}
              transition={{ duration: !animateDesktop ? 0 : present && switched ? 0.24 : 0.45, ease }}
              drag={present}
              dragSnapToOrigin
              dragElastic={0.25}
              onDragEnd={onDragEnd}
            >
              {image}
            </m.div>
          )}
        </div>
      ) : (
        <m.div
          key={art.id}
          custom={dir}
          layoutId={switched ? undefined : `art-${art.id}`}
          variants={{
            enter: (d: number) => ({ x: d * 140, scale: 0.94 }),
            center: { x: 0, scale: 1 },
          }}
          initial={switched ? "enter" : false}
          animate="center"
          exit={switched ? { opacity: 0 } : undefined}
          transition={{ duration: switched ? 0.24 : 0.4, ease }}
          drag
          dragSnapToOrigin
          dragElastic={0.25}
          onDragEnd={onDragEnd}
          className="relative z-10 touch-none cursor-grab overflow-hidden shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/15 active:cursor-grabbing"
          style={{
            borderRadius: 24,
            aspectRatio: `${ratio}`,
            width,
          }}
        >
          {image}
        </m.div>
      )}

      {/* Preload neighbours so swiping is instant */}
      <div aria-hidden className="pointer-events-none absolute size-px overflow-hidden opacity-0">
        {neighbours.map((n) => (
          <Image key={n.id} src={n.src} alt="" width={8} height={8} sizes={lightboxWidth(n)} quality={90} fetchPriority="low" loading="eager" />
        ))}
      </div>

      <m.div
        className="pointer-events-none absolute inset-0 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <LiquidButton
          ref={closeRef}
          onClick={close}
          aria-label="Close"
          className="pointer-events-auto absolute top-[max(env(safe-area-inset-top),16px)] right-4 size-12 text-lg"
        >
          ✕
        </LiquidButton>
        <LiquidButton
          onClick={() => go(-1)}
          aria-label="Previous"
          className="pointer-events-auto absolute top-1/2 left-4 hidden size-14 -translate-y-1/2 text-3xl md:inline-flex"
        >
          <span className="-mt-1">‹</span>
        </LiquidButton>
        <LiquidButton
          onClick={() => go(1)}
          aria-label="Next"
          className="pointer-events-auto absolute top-1/2 right-4 hidden size-14 -translate-y-1/2 text-3xl md:inline-flex"
        >
          <span className="-mt-1">›</span>
        </LiquidButton>
        <p className="absolute inset-x-0 bottom-[max(env(safe-area-inset-bottom),18px)] text-center text-sm tracking-widest text-white/70 tabular-nums">
          {index + 1} / {items.length}
          <span className="ml-3 text-white/45 md:hidden">· swipe ← →</span>
        </p>
      </m.div>
    </m.div>
  );
}
