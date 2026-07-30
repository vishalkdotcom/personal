export type ModeId = "work" | "about" | "resume" | "contact";

export type ModeDef = {
  id: ModeId;
  label: string;
  href: string;
  /** Path belongs to this Mode (titles, Context Rail routing). */
  matches: (pathname: string) => boolean;
  /**
   * Mode nav highlight. Defaults to `matches` when omitted.
   * Work uses exact `/work` so Work Case routes leave the Mode row quiet
   * (Work tree owns folder/case location).
   */
  navActive?: (pathname: string) => boolean;
};

/** v1 Modes only — Notes omitted. Nav order: About · Work · Resume · Contact. */
export const MODES: ModeDef[] = [
  {
    id: "about",
    label: "About",
    href: "/",
    matches: (pathname) => pathname === "/" || pathname === "",
  },
  {
    id: "work",
    label: "Work",
    href: "/work",
    matches: (pathname) => pathname === "/work" || pathname.startsWith("/work/"),
    navActive: (pathname) => pathname === "/work",
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

export function modeNavActive(mode: ModeDef, pathname: string): boolean {
  return (mode.navActive ?? mode.matches)(pathname);
}

export function modeForPath(pathname: string): ModeDef | undefined {
  return MODES.find((entry) => entry.matches(pathname));
}

export function modeTitleForPath(pathname: string): string {
  return modeForPath(pathname)?.label ?? "Work";
}
