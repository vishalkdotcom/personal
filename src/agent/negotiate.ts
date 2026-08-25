import { MARKDOWN_TYPE, negotiateAccept } from "./accept";
import {
  crawlerHtmlForPath,
  markdownForPath,
  notFoundHtmlDocument,
  notFoundMarkdown,
} from "./copy";
import {
  isBypassedAssetPath,
  isKnownAgentPath,
  normalizePathname,
  pagePathFromMarkdownSibling,
} from "./paths";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";
const HTML_CONTENT_TYPE = "text/html; charset=utf-8";
const PLAIN_CONTENT_TYPE = "text/plain; charset=utf-8";

function appendVaryAccept(headers: Headers): void {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", "Accept, Accept-Encoding");
    return;
  }
  const tokens = existing.split(",").map((token) => token.trim().toLowerCase());
  if (!tokens.includes("accept")) {
    headers.set("Vary", `${existing}, Accept`);
  }
}

function markdownHeaders(): Headers {
  const headers = new Headers({
    "Content-Type": MARKDOWN_CONTENT_TYPE,
    "Cache-Control": "public, max-age=300",
  });
  appendVaryAccept(headers);
  return headers;
}

function maybeHead(request: Request, response: Response): Response {
  if (request.method !== "HEAD") return response;
  return new Response(null, { status: response.status, headers: response.headers });
}

function markdownPagePath(pathname: string): string | undefined {
  const path = normalizePathname(pathname);
  return pagePathFromMarkdownSibling(path) ?? (path.endsWith(".md") ? undefined : path);
}

/**
 * Pages Function / test seam: negotiate markdown, emit real 404s, pass /api/* through.
 */
export async function handleAgentRequest(
  request: Request,
  next: () => Promise<Response>,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return next();
  }

  const url = new URL(request.url);
  const pathname = normalizePathname(url.pathname);

  if (pathname.startsWith("/api/") || isBypassedAssetPath(pathname)) {
    return next();
  }

  const accept = request.headers.get("Accept");
  const negotiation = negotiateAccept(accept);
  const pagePath = markdownPagePath(pathname) ?? pathname;
  const known = isKnownAgentPath(pagePath);
  const markdownBody = known ? markdownForPath(pagePath) : undefined;

  if (negotiation.kind === "not-acceptable") {
    const headers = new Headers({ "Content-Type": PLAIN_CONTENT_TYPE });
    appendVaryAccept(headers);
    return maybeHead(
      request,
      new Response("Not Acceptable\n\nAvailable: text/html, text/markdown\n", {
        status: 406,
        headers,
      }),
    );
  }

  const wantsMarkdown =
    negotiation.type === MARKDOWN_TYPE || pagePathFromMarkdownSibling(pathname) !== undefined;

  if (wantsMarkdown) {
    if (known && markdownBody) {
      return maybeHead(
        request,
        new Response(markdownBody, { status: 200, headers: markdownHeaders() }),
      );
    }
    return maybeHead(
      request,
      new Response(notFoundMarkdown(), { status: 404, headers: markdownHeaders() }),
    );
  }

  if (!known) {
    const headers = new Headers({
      "Content-Type": HTML_CONTENT_TYPE,
      "Cache-Control": "public, max-age=60",
    });
    appendVaryAccept(headers);
    return maybeHead(request, new Response(notFoundHtmlDocument(), { status: 404, headers }));
  }

  const upstream = await next();
  const headers = new Headers(upstream.headers);
  appendVaryAccept(headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", HTML_CONTENT_TYPE);
  }
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

/** @deprecated test helper — crawler HTML for a known path */
export function previewCrawlerHtml(pathname: string): string {
  return crawlerHtmlForPath(pathname);
}
