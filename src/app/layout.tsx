import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { MotionProvider } from "@/components/motion-provider";
import { Nav } from "@/components/nav";
import { Sky } from "@/components/sky";
import { site } from "@/content/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${site.name} — commissions`, template: `%s · ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#05080f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <MotionProvider>
          <Sky />
          <Nav />
          <main className="relative z-10">{children}</main>
        </MotionProvider>
      </body>
    </html>
  );
}
