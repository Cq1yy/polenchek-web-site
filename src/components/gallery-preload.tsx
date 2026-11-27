"use client";

import { useEffect } from "react";

type ResponsiveImage = { src: string; srcSet?: string; sizes?: string };

export function GalleryPreload({ images }: { images: ResponsiveImage[] }) {
  useEffect(() => {
    let cancelPreload: (() => void) | undefined;

    function preloadImages() {
      for (const { src, srcSet, sizes } of images) {
        const image = new window.Image();
        image.fetchPriority = "low";
        if (sizes) image.sizes = sizes;
        if (srcSet) image.srcset = srcSet;
        image.src = src;
      }
    }

    function schedulePreload() {
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(preloadImages, { timeout: 2000 });
        cancelPreload = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(preloadImages, 200);
        cancelPreload = () => window.clearTimeout(id);
      }
    }

    if (document.readyState === "complete") {
      schedulePreload();
    } else {
      window.addEventListener("load", schedulePreload, { once: true });
    }

    return () => {
      window.removeEventListener("load", schedulePreload);
      cancelPreload?.();
    };
  }, [images]);

  return null;
}
