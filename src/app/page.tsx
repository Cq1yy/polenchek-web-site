import { getImageProps, type StaticImageData } from "next/image";

import galleryTitle from "@/assets/decor/title-gallery.webp";
import { GalleryPreload } from "@/components/gallery-preload";
import { HomeHero } from "@/components/home-hero";
import { gallery } from "@/content/site";
import { galleryPreviewSizes, galleryTitleSizes } from "@/lib/gallery-images";

function responsiveSource(src: StaticImageData, sizes: string) {
  const { props } = getImageProps({ src, alt: "", sizes });
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
}

const galleryPreviews = [
  responsiveSource(galleryTitle, galleryTitleSizes),
  ...gallery.flatMap(({ items }) =>
    items.map(({ src }) => responsiveSource(src, galleryPreviewSizes(src))),
  ),
];

export default function Home() {
  return (
    <>
      <HomeHero />
      <GalleryPreload images={galleryPreviews} />
    </>
  );
}
