import type { Metadata } from "next";

import titleImg from "@/assets/decor/title-gallery.webp";
import { Gallery } from "@/components/gallery";
import { ScriptTitle } from "@/components/script-title";
import { gallery } from "@/content/site";
import { galleryTitleSizes } from "@/lib/gallery-images";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <div className="gallery-page mx-auto w-full max-w-[1600px] px-4 pt-[calc(var(--nav-h)+12px)] pb-24 md:w-[82vw] md:px-0">
      <ScriptTitle
        src={titleImg}
        alt="Gallery"
        sizes={galleryTitleSizes}
        className="gallery-title mx-auto mb-2 w-full max-w-[600px] md:w-[min(46vw,95vh)] md:max-w-[1000px]"
      />
      <Gallery sections={gallery} />
    </div>
  );
}
