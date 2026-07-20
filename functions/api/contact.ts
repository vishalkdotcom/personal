import { handleContactRequest, type ContactEnv } from "../../src/contact/delivery";

type PagesContext = {
  request: Request;
  env: ContactEnv;
};

/**
 * Cloudflare Pages Function: POST /api/contact → Resend.
 * Secrets (`RESEND_API_KEY`, `FROM_EMAIL`, `TO_EMAIL`) come from Pages env only.
 */
export async function onRequestPost(context: PagesContext): Promise<Response> {
  return handleContactRequest(context.request, context.env);
}
