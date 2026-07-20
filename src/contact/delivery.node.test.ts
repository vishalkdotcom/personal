import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTACT_EMAIL } from "./content";
import { handleContactRequest, type ContactEnv } from "./delivery";
import { CONTACT_MESSAGE_MAX_CHARS } from "./schema";

const validBody = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello from Analytical Engine.",
};

const configuredEnv: ContactEnv = {
  RESEND_API_KEY: "re_test_secret_key_do_not_leak",
  FROM_EMAIL: CONTACT_EMAIL,
  TO_EMAIL: CONTACT_EMAIL,
};

function postJson(body: unknown): Request {
  return new Request("https://vishalk.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function postRaw(body: BodyInit | null, contentType = "application/json"): Request {
  return new Request("https://vishalk.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

describe("Contact delivery contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("succeeds against mocked Resend fetch for a valid POST", async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
      async () => new Response(JSON.stringify({ id: "email_1" }), { status: 200 }),
    );

    const response = await handleContactRequest(postJson(validBody), configuredEnv, fetchMock);
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true, message: "Message sent successfully!" });
    expect(fetchMock).toHaveBeenCalledOnce();

    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    const [url, init] = call!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer re_test_secret_key_do_not_leak");

    const sent = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(sent.from).toBe(CONTACT_EMAIL);
    expect(sent.to).toEqual([CONTACT_EMAIL]);
    expect(sent.reply_to).toBe("ada@example.com");
    expect(String(sent.subject)).toContain("Ada Lovelace");
  });

  it("rejects invalid JSON bodies with field issues", async () => {
    const fetchMock = vi.fn();
    const response = await handleContactRequest(
      postJson({ name: "", email: "not-an-email", message: "" }),
      configuredEnv,
      fetchMock,
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe(true);
    expect(json.message).toBe("Invalid form data");
    expect(json.issues).toEqual({
      name: "Name is required",
      email: "Invalid email address",
      message: "Message is required",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed non-JSON bodies with field issues", async () => {
    const fetchMock = vi.fn();
    const response = await handleContactRequest(
      postRaw("not-json{{", "application/json"),
      configuredEnv,
      fetchMock,
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe(true);
    expect(json.message).toBe("Invalid form data");
    expect(json.issues).toEqual({
      name: "Name is required",
      email: "Invalid email address",
      message: "Message is required",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects oversized messages via the Function abuse floor", async () => {
    const fetchMock = vi.fn();
    const response = await handleContactRequest(
      postJson({
        ...validBody,
        message: "x".repeat(CONTACT_MESSAGE_MAX_CHARS + 1),
      }),
      configuredEnv,
      fetchMock,
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json).toEqual({
      error: true,
      message: "Invalid form data",
      issues: { message: "Message is too long" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps missing secrets to a safe config error without leaking env names as stack", async () => {
    const fetchMock = vi.fn();
    const response = await handleContactRequest(postJson(validBody), {}, fetchMock);
    const text = await response.text();
    const json = JSON.parse(text) as Record<string, unknown>;

    expect(response.status).toBe(500);
    expect(json).toEqual({
      error: true,
      message: "Email service is temporarily unavailable. Please contact me directly.",
    });
    expect(text).not.toContain("RESEND_API_KEY");
    expect(text).not.toContain("FROM_EMAIL");
    expect(text).not.toContain("TO_EMAIL");
    expect(text).not.toContain("stack");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps missing FROM_EMAIL or TO_EMAIL to the same safe config error", async () => {
    const fetchMock = vi.fn();
    const response = await handleContactRequest(
      postJson(validBody),
      { RESEND_API_KEY: "re_test_secret_key_do_not_leak" },
      fetchMock,
    );
    const json = await readJson(response);

    expect(response.status).toBe(500);
    expect(json).toEqual({
      error: true,
      message: "Email service is temporarily unavailable. Please contact me directly.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps Resend auth failures to a safe client message", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ message: "Invalid API key" }), { status: 401 }),
    );

    const response = await handleContactRequest(postJson(validBody), configuredEnv, fetchMock);
    const text = await response.text();
    const json = JSON.parse(text) as Record<string, unknown>;

    expect(response.status).toBe(500);
    expect(json).toEqual({
      error: true,
      message: "Email service authentication failed. Please contact me directly.",
    });
    expect(text).not.toContain("re_test_secret_key_do_not_leak");
    expect(text).not.toContain("Invalid API key");
  });

  it("maps Resend rate-limit failures to a safe client message", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "Too many requests — rate limit" }), {
          status: 429,
        }),
    );

    const response = await handleContactRequest(postJson(validBody), configuredEnv, fetchMock);
    const json = await readJson(response);

    expect(json).toEqual({
      error: true,
      message: "Too many emails sent. Please try again later.",
    });
  });

  it("maps Resend domain failures to a safe client message", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "domain is not verified" }), { status: 403 }),
    );

    const response = await handleContactRequest(postJson(validBody), configuredEnv, fetchMock);
    const text = await response.text();
    const json = JSON.parse(text) as Record<string, unknown>;

    expect(json).toEqual({
      error: true,
      message: "Email service is temporarily unavailable. Please contact me directly.",
    });
    expect(text).not.toContain("domain is not verified");
    expect(text).not.toContain("re_test_secret_key_do_not_leak");
  });

  it("maps non-auth 403 without domain language to the unknown safe message", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ message: "forbidden" }), { status: 403 }),
    );

    const response = await handleContactRequest(postJson(validBody), configuredEnv, fetchMock);
    const json = await readJson(response);

    expect(json).toEqual({
      error: true,
      message: "Failed to send email. Please try again or contact me directly.",
    });
  });

  it("never returns the API key or stack traces on unknown Resend failures", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "internal boom", stack: "Error: boom\n at send" }), {
          status: 500,
        }),
    );

    const response = await handleContactRequest(postJson(validBody), configuredEnv, fetchMock);
    const text = await response.text();
    const json = JSON.parse(text) as Record<string, unknown>;

    expect(json).toEqual({
      error: true,
      message: "Failed to send email. Please try again or contact me directly.",
    });
    expect(text).not.toContain("re_test_secret_key_do_not_leak");
    expect(text).not.toContain("internal boom");
    expect(text).not.toContain("at send");
  });
});
