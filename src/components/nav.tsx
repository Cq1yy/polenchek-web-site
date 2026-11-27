"use client";

import { usePathname } from "next/navigation";

import { Segmented } from "@/components/segmented";
import { ROUTES } from "@/lib/routes";

const items = ROUTES.map(({ href, label }) => ({ key: href, href, label }));
export function Nav() {
  const pathname = usePathname();

  return (
    <header
      className="anim-drop pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[max(env(safe-area-inset-top),14px)]"
    >
      <nav className="pointer-events-auto">
        <Segmented id="nav" label="Main" active={pathname} items={items} />
      </nav>
    </header>
  );
}
