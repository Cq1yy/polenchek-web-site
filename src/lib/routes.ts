export const SECTIONS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/price", label: "Price" },
  { href: "/tos", label: "TOS" },
] as const;

export const ROUTES = [{ href: "/", label: "Home" }, ...SECTIONS] as const;
