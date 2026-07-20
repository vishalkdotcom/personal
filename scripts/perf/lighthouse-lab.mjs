/**
 * Shared lab-mobile Lighthouse runner for baseline capture and cutover gate.
 *
 * Prefer Playwright Chromium + lighthouse programmatic API (avoids Windows
 * chrome-launcher EPERM / hang on localhost). Falls back to lighthouse CLI / PSI.
 */

import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { extractGateMetrics, medianGateMetrics } from "./extract-lighthouse-metrics.mjs";

const require = createRequire(import.meta.url);

/**
 * @returns {Promise<number>}
 */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on("error", reject);
  });
}

function isLoopbackUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

export function discoverChromePath() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return candidates.find((p) => p && existsSync(p)) || null;
}

/**
 * @param {string} url
 */
export async function runLighthousePlaywright(url) {
  const { chromium } = await import("playwright");
  const lighthouseMod = await import("lighthouse");
  const lighthouse = lighthouseMod.default || lighthouseMod;

  const port = await getFreePort();
  const userDataDir = join(
    tmpdir(),
    `lh-pw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  mkdirSync(userDataDir, { recursive: true });

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    args: [`--remote-debugging-port=${port}`, "--no-sandbox", "--disable-gpu"],
  });

  try {
    const result = await lighthouse(url, {
      port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance"],
      formFactor: "mobile",
      screenEmulation: {
        mobile: true,
        width: 412,
        height: 823,
        deviceScaleFactor: 1.75,
        disabled: false,
      },
    });
    const lhr = result?.lhr;
    if (!lhr?.audits?.["largest-contentful-paint"]) {
      throw new Error("LHR missing LCP audit (playwright runner)");
    }
    if (lhr.runtimeError) {
      throw new Error(
        `Lighthouse runtimeError: ${lhr.runtimeError.message || lhr.runtimeError.code}`,
      );
    }
    return lhr;
  } finally {
    await context.close().catch(() => {});
    try {
      rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      /* ignore Windows EPERM on temp cleanup */
    }
  }
}

/**
 * @param {string} url
 * @param {string} chromePath
 * @param {string} scratchDir
 */
export function runLighthouseCli(url, chromePath, scratchDir) {
  mkdirSync(scratchDir, { recursive: true });
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const outputPath = join(scratchDir, `${stamp}.json`);
  const userDataDir = join(scratchDir, `chrome-${stamp}`);
  mkdirSync(userDataDir, { recursive: true });

  const chromeFlags = [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    `--user-data-dir=${userDataDir}`,
  ].join(" ");

  let lighthouseBin;
  try {
    lighthouseBin = require.resolve("lighthouse/cli/index.js");
  } catch {
    lighthouseBin = null;
  }

  /** @type {string[]} */
  let args;
  /** @type {string} */
  let command;
  if (lighthouseBin) {
    command = process.execPath;
    args = [
      lighthouseBin,
      url,
      "--only-categories=performance",
      "--form-factor=mobile",
      "--screenEmulation.mobile=true",
      "--output=json",
      `--output-path=${outputPath}`,
      "--quiet",
      `--chrome-flags=${chromeFlags}`,
    ];
  } else {
    command = "npx";
    args = [
      "--yes",
      "lighthouse",
      url,
      "--only-categories=performance",
      "--form-factor=mobile",
      "--screenEmulation.mobile=true",
      "--output=json",
      `--output-path=${outputPath}`,
      "--quiet",
      `--chrome-flags=${JSON.stringify(chromeFlags)}`,
    ];
  }

  const env = {
    ...process.env,
    CHROME_PATH: chromePath,
    TEMP: scratchDir,
    TMP: scratchDir,
  };
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env,
    shell: command === "npx",
  });

  if (!existsSync(outputPath)) {
    throw new Error(
      `lighthouse failed for ${url} (exit ${result.status}): ${result.stderr || result.stdout}`,
    );
  }
  try {
    const lhr = JSON.parse(readFileSync(outputPath, "utf8"));
    if (!lhr?.audits?.["largest-contentful-paint"]) {
      throw new Error("LHR missing LCP audit");
    }
    return lhr;
  } finally {
    try {
      rmSync(outputPath, { force: true });
    } catch {
      /* ignore */
    }
    try {
      rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

/**
 * @param {string} url
 * @param {string} apiKey
 */
export async function runPsi(url, apiKey) {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("category", "performance");
  endpoint.searchParams.set("key", apiKey);
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`PSI API ${res.status} for ${url}: ${await res.text()}`);
  }
  const body = await res.json();
  return body.lighthouseResult;
}

/**
 * @param {"playwright" | "cli" | "psi"} mode
 * @param {string} url
 * @param {{ chromePath: string | null, psiKey: string, scratchDir: string }} opts
 */
async function runOnce(mode, url, { chromePath, psiKey, scratchDir }) {
  if (mode === "psi") {
    if (!psiKey) throw new Error("PSI mode requires PAGESPEED_API_KEY");
    return runPsi(url, psiKey);
  }
  if (mode === "cli") {
    if (!chromePath) throw new Error("CLI mode requires Chrome/Edge");
    return runLighthouseCli(url, chromePath, scratchDir);
  }
  return runLighthousePlaywright(url);
}

/**
 * @param {string} url
 * @param {{ chromePath: string | null, psiKey: string, runs: number, scratchDir: string, mode: "playwright" | "cli" | "psi" }} opts
 */
export async function measureUrl(url, { chromePath, psiKey, runs, scratchDir, mode }) {
  const runMetrics = [];
  for (let i = 0; i < runs; i++) {
    process.stderr.write(`  run ${i + 1}/${runs} ${url} [${mode}]\n`);
    const lhr = await runOnce(mode, url, { chromePath, psiKey, scratchDir });
    runMetrics.push(extractGateMetrics(lhr));
  }
  return { runs: runMetrics, median: medianGateMetrics(runMetrics) };
}

/**
 * Choose lab tooling for a measurement URL.
 *
 * @param {string} [sampleUrl]
 * @param {{ prefer?: "playwright" | "cli" }} [opts]
 * @returns {{ chromePath: string | null, psiKey: string, tooling: string, mode: "playwright" | "cli" | "psi" }}
 */
export function resolveLabTooling(sampleUrl = "", opts = {}) {
  const prefer = opts.prefer || "playwright";
  const psiKey = process.env.PAGESPEED_API_KEY || process.env.PSI_API_KEY || "";
  const requested = (process.env.PERF_LAB_TOOLING || "").toLowerCase();
  const chromePath = discoverChromePath();
  const loopback = sampleUrl ? isLoopbackUrl(sampleUrl) : false;

  if (loopback && (requested === "psi" || (!requested && prefer === "psi"))) {
    throw new Error(
      "PSI cannot measure loopback URLs; use Playwright/CLI or a public PERF_BASE_URL",
    );
  }

  if (requested === "psi") {
    if (!psiKey) throw new Error("PERF_LAB_TOOLING=psi requires PAGESPEED_API_KEY");
    return {
      chromePath,
      psiKey,
      mode: "psi",
      tooling: "PageSpeed Insights API (mobile strategy)",
    };
  }

  if (requested === "cli" || process.env.PERF_LIGHTHOUSE_CLI === "1") {
    if (!chromePath) {
      throw new Error("PERF_LAB_TOOLING=cli requires Chrome/Edge (or CHROME_PATH)");
    }
    return {
      chromePath,
      psiKey: "",
      mode: "cli",
      tooling: `lighthouse CLI (Chrome/Edge path: ${chromePath})`,
    };
  }

  if (requested === "playwright" || prefer === "playwright") {
    return {
      chromePath,
      psiKey: "",
      mode: "playwright",
      tooling: "lighthouse programmatic + Playwright Chromium (lab mobile)",
    };
  }

  // prefer === "cli" (baseline historical path): local Chrome, else PSI.
  if (chromePath) {
    return {
      chromePath,
      psiKey: "",
      mode: "cli",
      tooling: `lighthouse CLI (Chrome/Edge path: ${chromePath})`,
    };
  }
  if (psiKey) {
    return {
      chromePath: null,
      psiKey,
      mode: "psi",
      tooling: "PageSpeed Insights API (mobile strategy)",
    };
  }
  return {
    chromePath: null,
    psiKey: "",
    mode: "playwright",
    tooling: "lighthouse programmatic + Playwright Chromium (lab mobile)",
  };
}
