import { negotiateAgentRequest } from "../src/agent/negotiate";

type MiddlewareContext = {
  request: Request;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
};

/**
 * Negotiate Accept: text/markdown on document routes and return HTTP 404
 * for unknown paths (Cloudflare Pages would otherwise SPA-fallback to index.html).
 */
export async function onRequest(context: MiddlewareContext): Promise<Response> {
  return negotiateAgentRequest(context.request, () => context.next());
}
