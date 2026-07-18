export type ModeId = "work" | "about" | "resume" | "contact";

export type ModeDef = {
  id: ModeId;
  label: string;
  href: string;
  matches: (pathname: string) => boolean;
};

/** v1 Modes only — Notes omitted. */
export const MODES: ModeDef[] = [
  {
    id: "work",
    label: "Work",
    href: "/",
    matches: (pathname) => pathname === "/" || pathname.startsWith("/work"),
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    matches: (pathname) => pathname.startsWith("/about"),
  },
  {
    id: "resume",
    label: "Resume",
    href: "/resume",
    matches: (pathname) => pathname.startsWith("/resume"),
  },
  {
    id: "contact",
    label: "Contact",
    href: "/contact",
    matches: (pathname) => pathname.startsWith("/contact"),
  },
];

export function modeTitleForPath(pathname: string): string {
  const mode = MODES.find((entry) => entry.matches(pathname));
  return mode?.label ?? "Work";
}
