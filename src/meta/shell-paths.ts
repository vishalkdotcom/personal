/** Dist-relative output paths for Cloudflare Pages pretty URLs. */

export function shellOutputPath(path: string): string {
  if (path === "/" || path === "") return "index.html";
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${trimmed}.html`;
}

export function markdownOutputPath(path: string): string {
  if (path === "/" || path === "") return "index.md";
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return `${trimmed}.md`;
}
