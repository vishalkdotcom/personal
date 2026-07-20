/**
 * Gzip static file server with Cloudflare Pages–style pretty URLs
 * (`/path` → `path.html`) for local cutover-gate measurement.
 */

import { createServer } from "node:http";
import { createGzip } from "node:zlib";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json",
};

/**
 * @param {string} rootDir
 * @param {string} urlPath
 * @returns {string | null}
 */
export function resolvePrettyUrl(rootDir, urlPath) {
  const raw = decodeURIComponent((urlPath || "/").split("?")[0].split("#")[0]);
  const cleaned = raw.replace(/\\/g, "/");
  const rel = cleaned === "/" ? "" : cleaned.replace(/^\//, "").replace(/\/$/, "");

  /** @param {string} candidate */
  const safeJoin = (candidate) => {
    const abs = normalize(join(rootDir, candidate));
    const root = normalize(rootDir + sep);
    if (abs !== normalize(rootDir) && !abs.startsWith(root)) return null;
    return abs;
  };

  const candidates = [];
  if (!rel) {
    candidates.push("index.html");
  } else {
    candidates.push(rel);
    candidates.push(`${rel}.html`);
    candidates.push(join(rel, "index.html"));
  }

  for (const c of candidates) {
    const abs = safeJoin(c);
    if (!abs) continue;
    if (existsSync(abs) && statSync(abs).isFile()) return abs;
  }
  return null;
}

/**
 * @param {string} rootDir
 * @param {{ host?: string, port?: number }} [opts]
 * @returns {Promise<{ baseUrl: string, close: () => Promise<void> }>}
 */
export function startGzipStaticServer(rootDir, opts = {}) {
  const host = opts.host || "127.0.0.1";
  const port = opts.port ?? 0;

  const server = createServer((req, res) => {
    const filePath = resolvePrettyUrl(rootDir, req.url || "/");
    if (!filePath) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
    const accept = String(req.headers["accept-encoding"] || "");
    const useGzip = /\bgzip\b/.test(accept);

    if (useGzip) {
      res.writeHead(200, {
        "Content-Type": type,
        "Content-Encoding": "gzip",
        Vary: "Accept-Encoding",
        "Cache-Control": "no-store",
      });
      createReadStream(filePath).pipe(createGzip()).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store",
    });
    createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      const boundPort = typeof address === "object" && address ? address.port : port;
      resolve({
        baseUrl: `http://${host}:${boundPort}`,
        close: () =>
          new Promise((resClose, rejClose) => {
            server.close((err) => (err ? rejClose(err) : resClose()));
          }),
      });
    });
  });
}
