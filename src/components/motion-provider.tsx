"use client";

import { LazyMotion, MotionConfig } from "motion/react";

// Animation features are code-split and loaded after first paint → smaller initial JS.
const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    // reducedMotion="user": springs/slides become instant for people who ask the OS for less motion
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
