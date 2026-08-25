import { handleAgentRequest } from "../src/agent/negotiate";

type PagesContext = {
  request: Request;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
};

/**
 * Agent gateway: markdown Accept negotiation, Vary: Accept, and real 404s.
 * /api/* and static assets pass through to the matching Function or asset.
 */
export async function onRequest(context: PagesContext): Promise<Response> {
  return handleAgentRequest(context.request, () => context.next());
}
