"use client";

import { useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import type { Artwork, GallerySection } from "@/content/site";
import { m, useReducedMotion } from "motion/react";
import { LiquidButton } from "@/components/liquid-button";
import { galleryPreviewSizes, isPortrait } from "@/lib/gallery-images";

const desktopQuery = "(min-width: 48rem) and (hover: hover) and (pointer: fine)";

function watchDesktop(update: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}

export function useDesktopGallery() {
  return useSyncExternalStore(watchDesktop, () => window.matchMedia(desktopQuery).matches, () => false);
}

type OpenArtwork = (id: string, button: HTMLButtonElement) => void;

export function DesktopMosaic({ section, onOpen, viewedId }: {
  section: GallerySection;
  onOpen: OpenArtwork;
  viewedId: string | null;
}) {
  const landscapes = section.items.filter(({ src }) => !isPortrait(src));
  const portraits = section.items.filter(({ src }) => isPortrait(src));
  const columns = Math.max(1, Math.min(5, portraits.length));

  return (
    <div className="gallery-mosaic" style={{ "--columns": columns } as CSSProperties}>
      {landscapes.length > 0 && <LandscapeSlider items={landscapes} onOpen={onOpen} viewedId={viewedId} />}
      {portraits.length > 0 && (
        <div className="gallery-tiles">
          {portraits.map((art) => <ArtworkButton key={art.id} art={art} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  );
}

function LandscapeSlider({ items, onOpen, viewedId }: {
  items: Artwork[];
  onOpen: OpenArtwork;
  viewedId: string | null;
}) {
  const [position, setPosition] = useState(0);
  const reducedMotion = useReducedMotion();
  const indexAt = (slot: number) => ((slot % items.length) + items.length) % items.length;
  const index = indexAt(position);
  const viewedIndex = items.findIndex((art) => art.id === viewedId);
  // Select the lightbox's landscape behind the dialog and retain it after closing.
  if (viewedIndex >= 0 && index !== viewedIndex) {
    setPosition(position + viewedIndex - index);
  }
  const current = items[index];
  // Adjacent panels are ready on either side, including at the wrap from last to first.
  const slots = items.length === 1 ? [position] : [position - 1, position, position + 1];

  return (
    <div className="gallery-feature" data-gallery-artwork={current.id} style={{ aspectRatio: items[0].src.width / items[0].src.height }}>
      {slots.map((slot) => {
        const art = items[indexAt(slot)];
        const x = `${(slot - position) * 100}%`;
        return (
          <m.div key={slot} aria-hidden="true" className="pointer-events-none absolute inset-0"
            initial={{ x }} animate={{ x }}
            transition={{ duration: reducedMotion || viewedIndex >= 0 ? 0 : 0.38, ease: [0.32, 0, 0.2, 1] }}>
            <Image src={art.src} alt="" fill sizes={galleryPreviewSizes(art.src)}
              placeholder="blur" className="object-cover" />
          </m.div>
        );
      })}
      <button type="button" className="absolute inset-0 cursor-zoom-in focus-visible:-outline-offset-4"
        aria-label={`Open ${current.alt}`} onClick={(event) => onOpen(current.id, event.currentTarget)} />
      {items.length > 1 && (
        <>
          <LiquidButton aria-label="Previous landscape" className="absolute top-1/2 left-3 z-10 size-10 -translate-y-1/2 text-2xl"
            onClick={() => setPosition((value) => value - 1)}>‹</LiquidButton>
          <LiquidButton aria-label="Next landscape" className="absolute top-1/2 right-3 z-10 size-10 -translate-y-1/2 text-2xl"
            onClick={() => setPosition((value) => value + 1)}>›</LiquidButton>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {items.map((art, i) => <span key={art.id} className={`size-2 rounded-full shadow ${i === index ? "bg-white" : "bg-white/50"}`} />)}
          </div>
          <span className="sr-only" aria-live="polite">Landscape {index + 1} of {items.length}</span>
        </>
      )}
    </div>
  );
}

function ArtworkButton({ art, onOpen }: { art: Artwork; onOpen: OpenArtwork }) {
  return (
    <button type="button" className="gallery-tile" data-gallery-artwork={art.id} aria-label={`Open ${art.alt}`}
      onClick={(event) => onOpen(art.id, event.currentTarget)}>
      <Image src={art.src} alt={art.alt} fill sizes={galleryPreviewSizes(art.src)} placeholder="blur" className="object-cover" />
    </button>
  );
}
