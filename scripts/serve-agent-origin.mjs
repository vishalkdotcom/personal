#!/usr/bin/env bun
/**
 * Local Pages-like origin: same Functions gateway as production, files from dist/.
 *
 *   bun run build && bun scripts/serve-agent-origin.mjs
 *   bun scripts/verify-agent-readiness.mjs http://127.0.0.1:8788
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";
import { handleAgentRequest } from "../src/agent/negotiate.ts";
import { normalizePathname } from "../src/agent/paths.ts";
import { shellOutputPath } from "../src/meta/stamp-meta-shell.ts";

const DIST = resolve(process.env.DIST_DIR ?? "dist");
const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT ?? "8788", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};

function insideDist(absolute) {
  const rel = relative(DIST, absolute);
  return rel !== "" && !rel.startsWith("..") && !rel.startsWith("/");
}

function candidateFiles(pathname) {
  const path = normalizePathname(pathname);
  const files = [];
  if (path === "/") {
    files.push(join(DIST, "index.html"));
    return files;
  }
  const trimmed = path.slice(1);
  files.push(join(DIST, trimmed));
  files.push(join(DIST, shellOutputPath(path)));
  return files;
}

function resolveDistFile(pathname) {
  for (const candidate of candidateFiles(pathname)) {
    const absolute = resolve(normalize(candidate));
    if (!insideDist(absolute) || !existsSync(absolute)) continue;
    if (!statSync(absolute).isFile()) continue;
    return absolute;
  }
  return undefined;
}

function mimeFor(file) {
  return MIME[extname(file).toLowerCase()] ?? "application/octet-stream";
}

async function serveAsset(pathname) {
  const file = resolveDistFile(pathname);
  if (!file) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const body = readFileSync(file);
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": mimeFor(file) },
  });
}

const server = createServer(async (req, res) => {
  const host = req.headers.host ?? `${HOST}:${PORT}`;
  const url = new URL(req.url ?? "/", `http://${host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(", "));
  }
  const request = new Request(url, { method: req.method, headers });
  try {
    const response = await handleAgentRequest(request, () => serveAsset(url.pathname));
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Internal Server Error\n");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`agent origin http://${HOST}:${PORT} (dist ${DIST})`);
});
