import { appendVaryAccept, MARKDOWN_TYPE, preferredProducedType } from "./accept";
import { isKnownDocumentPath, markdownForPath, normalizePathname } from "./content";
import { NOT_FOUND_MARKDOWN, notFoundHtml } from "./not-found";

const STATIC_EXT =
  /\.(?:css|js|mjs|map|png|jpe?g|webp|gif|svg|avif|ico|woff2?|ttf|otf|eot|xml|txt|json|pdf|mp4|webm|mp3|wav|ogg|zip|webmanifest|md)$/i;

export type AssetFetcher = (request: Request) => Promise<Response>;

function passthroughPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || STATIC_EXT.test(pathname);
}

function markdownHeaders(): Headers {
  const headers = new Headers();
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  headers.set("X-Content-Type-Options", "nosniff");
  appendVaryAccept(headers);
  return headers;
}

function htmlHeaders(base?: Headers): Headers {
  const headers = base ? new Headers(base) : new Headers();
  if (!headers.has("Content-Type")) headers.set("Content-Type", "text/html; charset=utf-8");
  appendVaryAccept(headers);
  return headers;
}

function notAcceptable(): Response {
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  appendVaryAccept(headers);
  return new Response("Not Acceptable\n\nAvailable: text/html, text/markdown\n", {
    status: 406,
    headers,
  });
}

function markdownNotFound(): Response {
  return new Response(NOT_FOUND_MARKDOWN, { status: 404, headers: markdownHeaders() });
}

function htmlNotFound(): Response {
  return new Response(notFoundHtml(), { status: 404, headers: htmlHeaders() });
}

/**
 * Pages Function negotiation: markdown vs HTML, real 404s for unknown document paths.
 * Static assets and /api/* pass through unchanged.
 */
export async function negotiateAgentRequest(
  request: Request,
  fetchAsset: AssetFetcher,
): Promise<Response> {
  const url = new URL(request.url);
  const pathname = normalizePathname(url.pathname);

  if (request.method !== "GET" && request.method !== "HEAD") {
    return fetchAsset(request);
  }

  if (passthroughPath(url.pathname)) {
    return fetchAsset(request);
  }

  const accept = request.headers.get("accept");
  const chosen = preferredProducedType(accept);

  if (chosen === null && accept) {
    return notAcceptable();
  }

  const known = isKnownDocumentPath(pathname);

  if (chosen === MARKDOWN_TYPE) {
    if (!known) return markdownNotFound();
    const markdown = markdownForPath(pathname);
    if (!markdown) return markdownNotFound();
    return new Response(markdown, { status: 200, headers: markdownHeaders() });
  }

  if (!known) {
    return htmlNotFound();
  }

  const asset = await fetchAsset(request);
  const headers = htmlHeaders(asset.headers);
  headers.set(
    "Link",
    `<${markdownAlternatePath(pathname)}>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"`,
  );
  return new Response(asset.body, { status: asset.status, headers });
}

function markdownAlternatePath(pathname: string): string {
  if (pathname === "/") return "/index.md";
  return `${pathname}.md`;
}
