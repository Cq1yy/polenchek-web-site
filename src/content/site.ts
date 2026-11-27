// All site content lives here: edit texts, prices, links and artworks in one place.
import type { StaticImageData } from "next/image";
import avatar from "@/assets/avatar.webp";
import headshot1 from "@/assets/art/headshot-1.webp";
import headshot2 from "@/assets/art/headshot-2.webp";
import headshot3 from "@/assets/art/headshot-3.webp";
import headshot4 from "@/assets/art/headshot-4.webp";
import headshot5 from "@/assets/art/headshot-5.webp";
import headshot6 from "@/assets/art/headshot-6.webp";
import halfbody1 from "@/assets/art/halfbody-1.webp";
import halfbody2 from "@/assets/art/halfbody-2.webp";
import halfbody3 from "@/assets/art/halfbody-3.webp";
import halfbody4 from "@/assets/art/halfbody-4.webp";
import halfbody5 from "@/assets/art/halfbody-5.webp";
import halfbody6 from "@/assets/art/halfbody-6.webp";
import fullbody1 from "@/assets/art/fullbody-1.webp";
import fullbody2 from "@/assets/art/fullbody-2.webp";
import fullbody3 from "@/assets/art/fullbody-3.webp";
import fullbody4 from "@/assets/art/fullbody-4.webp";
import fullbody5 from "@/assets/art/fullbody-5.webp";
import fullbody6 from "@/assets/art/fullbody-6.webp";
import fullbody7 from "@/assets/art/fullbody-7.webp";
import fullbody8 from "@/assets/art/fullbody-8.webp";

export const site = {
  name: "Polenchek",
  description: "Commissions open — headshots, halfbody and fullbody illustrations by Polenchek.",
  /** Put an image into src/assets and import it here to replace the pink circle on the home page. */
  avatar: avatar,
  /**
   * Text on the home page glass panel, under the "Polenchek" signature (to the right of the avatar).
   * Leave empty to hide. Use \n\n for a new paragraph.
   */
  intro: "Hi! I’m Polenchek. ╰(*´︶`*)╯\n\nI’m a furry and human artist with years of experience and a love for bringing characters to life.\n\nI’m always happy to explore new ideas, try different approaches, and keep learning along the way. Friendly and open-minded, I enjoy getting to know the characters and stories behind every project.\n\nHave an idea you’re excited about? I’d love to hear it and create something together!\n\nPlease be welcome to message me via Telegram or Discord",
};

/** Replace "#" with real profile links. */
export const socials: { icon: string; label: string; href: string }[] = [
  { icon: "bluesky", label: "Bluesky", href: "https://bsky.app/profile/polenchek.bsky.social" },
  { icon: "telegram", label: "Telegram", href: "https://t.me/polenchekk" },
  { icon: "x", label: "Twitter / X", href: "https://x.com/PolenchekART" },
  { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/polenchekart/" },
  { icon: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@polenchek_art" },
  { icon: "furaffinity", label: "Fur Affinity", href: "https://www.furaffinity.net/user/polenchek" },
  { icon: "discord", label: "Discord", href: "https://discord.com/users/569918698098262020" },
];

export type Artwork = { id: string; src: StaticImageData; alt: string };
export type GallerySection = { id: string; title: string; items: Artwork[] };

export const gallery: GallerySection[] = [
  {
    id: "headshot",
    title: "Headshot",
    items: [
      { id: "headshot-1", src: headshot1, alt: "Headshot commission" },
      { id: "headshot-2", src: headshot2, alt: "Headshot commission" },
      { id: "headshot-3", src: headshot3, alt: "Headshot commission" },
      { id: "headshot-4", src: headshot4, alt: "Headshot commission" },
      { id: "headshot-5", src: headshot5, alt: "Headshot commission" },
      { id: "headshot-6", src: headshot6, alt: "Headshot commission" },
    ],
  },
  {
    id: "halfbody",
    title: "Halfbody",
    items: [
      { id: "halfbody-1", src: halfbody1, alt: "Halfbody commission" },
      { id: "halfbody-2", src: halfbody2, alt: "Halfbody commission" },
      { id: "halfbody-3", src: halfbody3, alt: "Halfbody commission" },
      { id: "halfbody-4", src: halfbody4, alt: "Halfbody commission" },
      { id: "halfbody-5", src: halfbody5, alt: "Halfbody commission" },
      { id: "halfbody-6", src: halfbody6, alt: "Halfbody commission" },
    ],
  },
  {
    id: "fullbody",
    title: "Fullbody",
    items: [
      { id: "fullbody-1", src: fullbody1, alt: "Fullbody commission" },
      { id: "fullbody-2", src: fullbody2, alt: "Fullbody commission" },
      { id: "fullbody-3", src: fullbody3, alt: "Fullbody commission" },
      { id: "fullbody-4", src: fullbody4, alt: "Fullbody commission" },
      { id: "fullbody-5", src: fullbody5, alt: "Fullbody commission" },
      { id: "fullbody-6", src: fullbody6, alt: "Fullbody commission" },
      { id: "fullbody-7", src: fullbody7, alt: "Fullbody commission" },
      { id: "fullbody-8", src: fullbody8, alt: "Fullbody commission" },
    ],
  },
];

export type PriceItem = { name: string; price: string; note?: string; keepNameVisible?: boolean };
/** `gallery` links the price block to the matching gallery section. */
export type PriceSection = { title: string; gallery?: string; items: PriceItem[] };

export const prices: PriceSection[] = [
  {
    title: "Headshot",
    gallery: "headshot",
    items: [
      { name: "Headshot sketch ver", price: "$30", note: "sketch ver — b/g or flat colored ver. with simple shading" },
      { name: "Headshot full render ver.", price: "$50", note: "full render ver — fullcolor full shading ver" },
    ],
  },
  {
    title: "Halfbody",
    gallery: "halfbody",
    items: [
      { name: "Halfbody sketch ver", price: "$45", note: "sketch ver — b/g or flat colored ver. with simple shading" },
      { name: "Halfbody full render ver.", price: "$70", note: "full render ver — fullcolor full shading ver" },
    ],
  },
  {
    title: "Fullbody",
    gallery: "fullbody",
    items: [
      { name: "Fullbody sketch ver", price: "$65", note: "sketch ver — b/g or flat colored ver. with simple shading" },
      {
        name: "Fullbody full render ver.",
        price: "From $110",
        note: "full render ver — fullcolor full shading ver",
        keepNameVisible: true,
      },
    ],
  },
  {
    title: "Special",
    items: [
      { name: "Complex background", price: "$25–60", note: "landscape, architecture, details (open to discussion)" },
      { name: "NSFW", price: "YES", note: "(open to discussion)" },
      { name: "Chibi", price: "$30", note: "sketch ver — b/g or flat colored ver. with simple shading" },
      {
        name: "Commercial law",
        price: "+100%",
        note: "The artist’s watermark is retained, but the rights to monetize the illustration are obtained",
      },
    ],
  },
];

export const priceNotes = {
  important: ["Prices are for one character", "+100% for a second character"],
  payment: "Full prepayment via PayPal",
};


export type TosSection = { title: string; items: string[] };

export const tos: TosSection[] = [
  {
    title: "TOS",
    items: [
      "Full prepayment via PayPal.",
      "I will only start the commission once payment is sent.",
      "Feel free to tell me about any necessary corrections while it's still a sketch. Only minor changes will be accepted after that, however drastic changes may cost extra.",
      "I will not accept refunds.",
      "NO DEADLINES: I provide weekly progress updates on the current stage of your commission. If you need your commission by a specific deadline, an additional 50% of the commission price will be charged.",
    ],
  },
  {
    title: "Important",
    items: [
      "English is not my native language, so if I made a mistake, I'm sorry. Be prepared for questions if there is any misunderstanding between us.",
      "Commissions work on a first come first served basis.",
      "I can provide versions in PSD file or each in PNG if the commissioner wishes. But only versions, the main layers will be merged.",
      "The commissioner owns personal usage rights to the illustration, so they can use it as an icon / print it etc., but the commissioner CAN NOT use the illustration for profit, commercial products (monetized videos, merchandise, prints, books, etc).",
      "I have the right to use the completed illustrations for non-commercial purposes, exhibit them in my galleries, use them as examples in price lists (except for private commissions).",
      "The commissioner has no right to change my illustrations in any way, all edits to the illustrations are made only by me and only in the course of the work.",
    ],
  },
];

export const drawing = {
  allowed: [
    "NSFW.",
    "Furry.",
    "Futanari",
    "Femboys.",
    "Human (or any other race with a human-like body).",
    "Any gender and bodytype.",
    "Any fetishes(but you'd better clarify this with me).",
    "Sticker packs.",
    "Fanart / Game or show characters.",
    "Comics.",
  ],
  excluded: [
    "Gore.",
    "Pedo(loli, shota etc.).",
    "Violence.",
    "Feral.",
  ],
};
