/** Contact form field rules — equivalent to the prior Zod contactSchema. */

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type ContactFieldErrors = Partial<Record<keyof ContactPayload, string>>;

export type ContactValidationResult =
  | { ok: true; data: ContactPayload }
  | { ok: false; issues: ContactFieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Soft abuse floor for the Pages Function only (Spec: size limit is a Function detail).
 * Not part of the Zod-equivalent client field rules.
 */
export const CONTACT_MESSAGE_MAX_CHARS = 10_000;

/** Client + server field rules: name/email/message required; email shape. */
export function validateContactPayload(input: unknown): ContactValidationResult {
  if (input === null || typeof input !== "object") {
    return {
      ok: false,
      issues: {
        name: "Name is required",
        email: "Invalid email address",
        message: "Message is required",
      },
    };
  }

  const record = input as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const message = typeof record.message === "string" ? record.message.trim() : "";

  const issues: ContactFieldErrors = {};
  if (!name) issues.name = "Name is required";
  if (!email || !EMAIL_PATTERN.test(email)) issues.email = "Invalid email address";
  if (!message) issues.message = "Message is required";

  if (Object.keys(issues).length > 0) return { ok: false, issues };
  return { ok: true, data: { name, email, message } };
}

/** Server-only size floor after Zod-equivalent field validation. */
export function applyContactAbuseFloor(data: ContactPayload): ContactValidationResult {
  if (data.message.length > CONTACT_MESSAGE_MAX_CHARS) {
    return { ok: false, issues: { message: "Message is too long" } };
  }
  return { ok: true, data };
}
