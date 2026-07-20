import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DEEP_LINK_ROUTES } from "./route-manifest";
import { shellOutputPath, stampMetaShell } from "./stamp-meta-shell";

/**
 * After Vite writes `dist/index.html`, stamp per-path meta shells for the
 * finite deep-link set. Full-body SSR is not required.
 */
export function emitMetaShells(outDir: string): void {
  const templatePath = join(outDir, "index.html");
  const template = readFileSync(templatePath, "utf8");

  for (const route of DEEP_LINK_ROUTES) {
    const relative = shellOutputPath(route.path);
    const absolute = join(outDir, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, stampMetaShell(template, route), "utf8");
  }
}
