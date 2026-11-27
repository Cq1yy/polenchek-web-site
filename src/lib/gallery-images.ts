import type { StaticImageData } from "next/image";

export const galleryTitleSizes = "(min-width: 768px) 60vw, 92vw";

export function isPortrait({ width, height }: StaticImageData) {
  return height >= width;
}

export function galleryDesktopPreviewWidth({ width, height }: StaticImageData) {
  // Use the same width for the card, its image, and the home page preload.
  return `min(76vw, 44rem, calc(clamp(16rem,56vw,22rem) * ${width / height}))`;
}

export function galleryPreviewSizes(image: StaticImageData) {
  const mobile = isPortrait(image) ? "calc(72vw)" : "calc(92vw)";
  const mosaic = isPortrait(image) ? "min(18vw, 23vh)" : "min(90vw, 112vh)";
  return `(min-width: 48rem) and (hover: hover) and (pointer: fine) ${mosaic}, (min-width: 48rem) ${galleryDesktopPreviewWidth(image)}, ${mobile}`;
}
