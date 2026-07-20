import { getActiveWorkCaseFromPath, getFeaturedWorkFolder, getWorkFolder } from "../work/inventory";
import { modeTitleForPath } from "./modes";

export type ShellCrumb = {
  /** Primary wayfinding line, e.g. `Prototypes / SupplyChain+`. */
  trail: string;
  /** Active Mode label under the trail (when it adds information). */
  modeLabel: string;
};

function folderForWorkCasePath(pathname: string) {
  if (pathname === "/" || pathname === "") return getFeaturedWorkFolder();
  const match = pathname.match(/^\/work\/([^/]+)\//);
  return match ? getWorkFolder(match[1]) : undefined;
}

/** Header crumb for mobile wayfinding. */
export function shellCrumbForPath(pathname: string): ShellCrumb {
  const modeLabel = modeTitleForPath(pathname);
  const workCase = getActiveWorkCaseFromPath(pathname);

  if (workCase) {
    const folder = folderForWorkCasePath(pathname);
    if (folder) {
      return { trail: `${folder.title} / ${workCase.title}`, modeLabel };
    }
  }

  const folderOnly = pathname.match(/^\/work\/([^/]+)\/?$/);
  if (folderOnly) {
    const folder = getWorkFolder(folderOnly[1]);
    if (folder) return { trail: folder.title, modeLabel };
  }

  if (pathname === "/work" || pathname === "/work/") {
    return { trail: "All work", modeLabel };
  }

  return { trail: modeLabel, modeLabel };
}
