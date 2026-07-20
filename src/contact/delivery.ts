/**
 * Contact delivery seam: validate JSON, send via Resend `fetch`, map failures
 * to safe client messages. Secrets stay in Pages env only.
 */

import { applyContactAbuseFloor, validateContactPayload, type ContactPayload } from "./schema";

export type ContactEnv = {
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
  TO_EMAIL?: string;
};

export type ContactDeliveryCode =
  | "CONFIG_ERROR"
  | "RESEND_AUTH"
  | "RATE_LIMIT"
  | "DOMAIN_ERROR"
  | "UNKNOWN";

const SAFE_MESSAGES: Record<ContactDeliveryCode, string> = {
  CONFIG_ERROR: "Email service is temporarily unavailable. Please contact me directly.",
  RESEND_AUTH: "Email service authentication failed. Please contact me directly.",
  RATE_LIMIT: "Too many emails sent. Please try again later.",
  DOMAIN_ERROR: "Email service is temporarily unavailable. Please contact me directly.",
  UNKNOWN: "Failed to send email. Please try again or contact me directly.",
};

const RESEND_API_URL = "https://api.resend.com/emails";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sanitizeText(text: string): string {
  return text.replace(/[<>"'&]/g, (match) => {
    switch (match) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#x27;";
      case "&":
        return "&amp;";
      default:
        return match;
    }
  });
}

export function createContactEmailBody(
  contact: ContactPayload,
  fromEmail: string,
  toEmail: string,
) {
  const name = sanitizeText(contact.name);
  const email = contact.email;
  const message = sanitizeText(contact.message);

  return {
    from: fromEmail,
    to: [toEmail],
    subject: `New Contact Form Submission from ${name}`,
    reply_to: email,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p><em>Sent from: vishalk.com contact form</em></p>
    `,
    text: `Name: ${name}
Email: ${email}
Message: ${contact.message}

Sent from: vishalk.com contact form`,
  };
}

function classifyResendFailure(status: number, errorText: string): ContactDeliveryCode {
  const lower = errorText.toLowerCase();
  if (status === 429 || lower.includes("rate limit")) return "RATE_LIMIT";
  if (lower.includes("domain")) return "DOMAIN_ERROR";
  // Auth only on explicit 401 or API-key language — do not treat every 403 as auth.
  if (status === 401 || lower.includes("api key")) return "RESEND_AUTH";
  return "UNKNOWN";
}

function safeErrorResponse(code: ContactDeliveryCode, status = 500): Response {
  return jsonResponse({ error: true, message: SAFE_MESSAGES[code] }, status);
}

export async function handleContactRequest(
  request: Request,
  env: ContactEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: true, message: "Method not allowed" }, 405);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const validated = validateContactPayload(body);
  if (!validated.ok) {
    return jsonResponse(
      { error: true, message: "Invalid form data", issues: validated.issues },
      400,
    );
  }

  const sized = applyContactAbuseFloor(validated.data);
  if (!sized.ok) {
    return jsonResponse({ error: true, message: "Invalid form data", issues: sized.issues }, 400);
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const fromEmail = env.FROM_EMAIL?.trim();
  const toEmail = env.TO_EMAIL?.trim();

  if (!apiKey || !fromEmail || !toEmail) {
    return safeErrorResponse("CONFIG_ERROR");
  }

  const mail = createContactEmailBody(sized.data, fromEmail, toEmail);

  let resendRes: Response;
  try {
    resendRes = await fetchImpl(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mail),
    });
  } catch {
    return safeErrorResponse("UNKNOWN", 502);
  }

  if (!resendRes.ok) {
    const errorText = await resendRes.text().catch(() => "");
    const code = classifyResendFailure(resendRes.status, errorText);
    // Log server-side only — never echo Resend body or secrets to the client.
    console.error("Contact delivery Resend failure:", {
      status: resendRes.status,
      code,
      timestamp: new Date().toISOString(),
    });
    return safeErrorResponse(code);
  }

  return jsonResponse({ success: true, message: "Message sent successfully!" }, 200);
}
