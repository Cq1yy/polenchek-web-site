"use client";

import Link from "next/link";
import { m, type HTMLMotionProps } from "motion/react";

import { LiquidLayers } from "@/components/liquid-glass";

const MLink = m.create(Link);

// Jelly press like iOS: squash on press, overshoot on release.
const press = {
  whileHover: { scale: 1.04 },
  whileTap: { scaleX: 1.08, scaleY: 0.92 },
  transition: { type: "spring", stiffness: 520, damping: 16, mass: 0.7 },
} as const;

/** Base classes; position/display are only added when the caller does not set their own. */
function base(extra: string) {
  const pos = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(extra) ? "" : "relative";
  const disp = /(^|\s)(hidden|flex|grid|block)(\s|$)/.test(extra) ? "" : "inline-flex";
  return `${BASE} ${pos} ${disp} ${extra}`;
}
const BASE =
  "lg-host group isolate select-none items-center justify-center whitespace-nowrap text-white outline-none";

type Common = {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  tint?: string;
  strength?: number;
};

export function LiquidLink({
  href,
  children,
  className = "",
  radius = 999,
  tint,
  strength,
  ...rest
}: Common & { href: string } & Omit<
    React.ComponentProps<typeof MLink>,
    "href" | "children" | "className"
  >) {
  return (
    <MLink href={href} {...press} {...rest} className={base(className)}>
      <LiquidLayers radius={radius} tint={tint} strength={strength} />
      <span className="lg-label relative z-10 inline-flex items-center justify-center">{children}</span>
    </MLink>
  );
}

export function LiquidButton({
  children,
  className = "",
  radius = 999,
  tint,
  strength,
  ...rest
}: Common & Omit<HTMLMotionProps<"button">, "children" | "className">) {
  return (
    <m.button type="button" {...press} {...rest} className={base(className)}>
      <LiquidLayers radius={radius} tint={tint} strength={strength} />
      <span className="lg-label relative z-10 inline-flex items-center justify-center">{children}</span>
    </m.button>
  );
}
