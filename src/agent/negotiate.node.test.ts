import { describe, expect, it } from "vitest";
import { handleAgentRequest } from "./negotiate";

const ORIGIN = "https://vishalk.com";

async function dispatch(
  path: string,
  init: RequestInit = {},
  next?: () => Promise<Response>,
): Promise<Response> {
  const request = new Request(`${ORIGIN}${path}`, { method: "GET", ...init });
  return handleAgentRequest(
    request,
    next ??
      (async () =>
        new Response("<html><body>upstream</body></html>", {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        })),
  );
}

describe("Agent request handler", () => {
  it("returns HTTP 404 with a markdown body that points at sitemap and llms.txt", async () => {
    const response = await dispatch("/some-path-that-does-not-exist", {
      headers: { Accept: "text/markdown" },
    });
    const body = await response.text();
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toMatch(/text\/markdown/);
    expect(response.headers.get("Vary") ?? "").toMatch(/Accept/i);
    expect(body).toMatch(/sitemap\.xml/);
    expect(body).toMatch(/llms\.txt/);
  });

  it("returns HTTP 404 HTML for unknown paths when Accept prefers HTML", async () => {
    const response = await dispatch("/missing-resource", {
      headers: { Accept: "text/html" },
    });
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toMatch(/text\/html/);
    expect(await response.text()).toMatch(/<h1>/i);
  });

  it("returns HTTP 404 for unknown paths when Accept is omitted (never SPA 200)", async () => {
    const response = await dispatch("/some-path-that-does-not-exist");
    expect(response.status).toBe(404);
    expect(response.headers.get("Vary") ?? "").toMatch(/Accept/i);
    expect(await response.text()).toMatch(/sitemap\.xml/);
  });

  it("returns HTTP 404 HTML when Accept is */*", async () => {
    const response = await dispatch("/missing-resource", {
      headers: { Accept: "*/*" },
    });
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toMatch(/text\/html/);
  });

  it("serves markdown for Accept: text/markdown on a known path", async () => {
    const response = await dispatch("/about", {
      headers: { Accept: "text/markdown" },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/text\/markdown/);
    expect(response.headers.get("Vary") ?? "").toMatch(/Accept/i);
    expect(await response.text()).toMatch(/^# /);
  });

  it("adds Vary: Accept on HTML passthrough for known paths", async () => {
    const response = await dispatch("/", {
      headers: { Accept: "text/html" },
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("upstream");
    expect(response.headers.get("Vary") ?? "").toMatch(/Accept/i);
  });

  it("returns 406 when Accept cannot be satisfied", async () => {
    const response = await dispatch("/about", {
      headers: { Accept: "application/json" },
    });
    expect(response.status).toBe(406);
    expect(response.headers.get("Vary") ?? "").toMatch(/Accept/i);
  });

  it("does not intercept POST /api/contact", async () => {
    const request = new Request(`${ORIGIN}/api/contact`, { method: "POST" });
    const response = await handleAgentRequest(
      request,
      async () => new Response("ok", { status: 201 }),
    );
    expect(response.status).toBe(201);
    expect(await response.text()).toBe("ok");
  });

  it("serves markdown for /.md siblings even when Accept prefers HTML", async () => {
    const response = await dispatch("/about.md", {
      headers: { Accept: "text/html" },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/text\/markdown/);
    expect(await response.text()).toMatch(/^# /);
  });

  it("returns an empty body for HEAD 404s while keeping status and Vary", async () => {
    const response = await dispatch("/missing-resource", {
      method: "HEAD",
      headers: { Accept: "text/markdown" },
    });
    expect(response.status).toBe(404);
    expect(response.headers.get("Vary") ?? "").toMatch(/Accept/i);
    expect(await response.text()).toBe("");
  });
});
