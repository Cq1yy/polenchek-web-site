import Image, { type StaticImageData } from "next/image";

/**
 * Calligraphic titles from the mockup (raster artwork).
 * Server component: the "hand-written" reveal and the periodic glint are pure CSS,
 * so the title animates from the very first paint with zero JavaScript.
 */
export function ScriptTitle({
  src,
  alt,
  className = "",
  imgClassName = "h-auto w-full",
  sizes = "(min-width: 768px) 60vw, 92vw",
  delay = 0.2,
  as: Tag = "h1",
}: {
  src: StaticImageData;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  delay?: number;
  as?: "h1" | "h2" | "div";
}) {
  return (
    <Tag className={className} style={{ ["--d" as string]: `${delay}s` }}>
      <span className="anim-write relative block select-none">
        <Image src={src} alt={alt} sizes={sizes} preload draggable={false} className={`opacity-90 ${imgClassName}`} />
        <Image
          src={src}
          alt=""
          aria-hidden
          sizes={sizes}
          loading="eager"
          draggable={false}
          className={`glint pointer-events-none absolute inset-0 ${imgClassName}`}
        />
      </span>
    </Tag>
  );
}
