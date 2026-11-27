import { LiquidLink } from "@/components/liquid-button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="anim-rise text-7xl tracking-figma">404</p>
      <p className="anim-rise text-white/70" style={{ ["--d" as string]: "0.1s" }}>
        This page drifted off into space.
      </p>
      <div className="anim-pop" style={{ ["--d" as string]: "0.25s" }}>
        <LiquidLink href="/" className="h-12 px-7 font-medium tracking-wide uppercase">
          Back home
        </LiquidLink>
      </div>
    </div>
  );
}
