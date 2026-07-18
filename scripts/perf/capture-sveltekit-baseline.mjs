/**
 * Capture production SvelteKit lab-mobile baseline for the locked URL matrix.
 * Artifact: docs/perf/sveltekit-production-baseline.json (+ .md)
 *
 * Usage:
 *   node scripts/perf/capture-sveltekit-baseline.mjs
 *   node scripts/perf/capture-sveltekit-baseline.mjs --runs=5
 *
 * Requires Chromium (Chrome or Edge). Set CHROME_PATH to override discovery.
 * Fallback: set PAGESPEED_API_KEY to use PageSpeed Insights API instead.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractGateMetrics, medianGateMetrics } from './extract-lighthouse-metrics.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '../..');
const outDir = join(repoRoot, 'docs/perf');
const outJson = join(outDir, 'sveltekit-production-baseline.json');
const outMd = join(outDir, 'sveltekit-production-baseline.md');
const scratchDir = join(repoRoot, '.tmp/lighthouse-runs');

const BASE = process.env.PERF_BASE_URL || 'https://vishalk.com';
const RUNS = Number(process.argv.find((a) => a.startsWith('--runs='))?.split('=')[1] || 3);

/** Locked cutover matrix → production SvelteKit measurement targets */
const MATRIX = [
	{
		id: 'home',
		lockedPath: '/',
		surface: 'Featured Public Storefront (`/` — SupplyChain+ on rewrite)',
		measuredUrl: `${BASE}/`,
		standIn: false,
		notes: 'Current SvelteKit home is marketing About+Work+Contact, not SupplyChain+.'
	},
	{
		id: 'internal-dossier',
		lockedPath: '/work/labor-solutions/engage-reporting',
		surface: 'Internal Dossier Work Case (Engage reporting)',
		measuredUrl: `${BASE}/`,
		standIn: true,
		notes:
			'Engage reporting has no dedicated SvelteKit route (404). Work content loads on the home document; first-load metrics match `/`.'
	},
	{
		id: 'resume',
		lockedPath: '/resume',
		surface: 'Resume Surface (PDF embed path)',
		measuredUrl: `${BASE}/`,
		standIn: true,
		notes:
			'No Resume Surface on SvelteKit (`/resume` 404). Recorded home first-load as SPA shell budget stand-in; PDF-specific LCP does not exist yet.'
	},
	{
		id: 'contact',
		lockedPath: '/contact',
		surface: 'Contact Mode (document load only)',
		measuredUrl: `${BASE}/contact`,
		standIn: false,
		notes: 'Document load only — form submit not exercised.'
	}
];

function discoverChromePath() {
	if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
		return process.env.CHROME_PATH;
	}
	const candidates = [
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
		join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
		'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
		'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium',
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
	];
	return candidates.find((p) => p && existsSync(p)) || null;
}

function runLighthouseCli(url, chromePath) {
	mkdirSync(scratchDir, { recursive: true });
	const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const outputPath = join(scratchDir, `${stamp}.json`);
	const userDataDir = join(scratchDir, `chrome-${stamp}`);
	mkdirSync(userDataDir, { recursive: true });

	const chromeFlags = [
		'--headless',
		'--no-sandbox',
		'--disable-gpu',
		`--user-data-dir=${userDataDir}`
	].join(' ');

	const args = [
		'--yes',
		'lighthouse',
		url,
		'--only-categories=performance',
		'--form-factor=mobile',
		'--screenEmulation.mobile=true',
		'--output=json',
		`--output-path=${outputPath}`,
		'--quiet',
		`--chrome-flags=${JSON.stringify(chromeFlags)}`
	];
	const env = {
		...process.env,
		CHROME_PATH: chromePath,
		TEMP: scratchDir,
		TMP: scratchDir
	};
	const result = spawnSync('npx', args, {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		env,
		shell: true
	});

	// chrome-launcher often exits non-zero on Windows sandboxes when destroying tmp
	// after a successful run — accept a valid LHR file as success.
	if (!existsSync(outputPath)) {
		throw new Error(
			`lighthouse failed for ${url} (exit ${result.status}): ${result.stderr || result.stdout}`
		);
	}
	try {
		const lhr = JSON.parse(readFileSync(outputPath, 'utf8'));
		if (!lhr?.audits?.['largest-contentful-paint']) {
			throw new Error('LHR missing LCP audit');
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

async function runPsi(url, apiKey) {
	const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
	endpoint.searchParams.set('url', url);
	endpoint.searchParams.set('strategy', 'mobile');
	endpoint.searchParams.set('category', 'performance');
	endpoint.searchParams.set('key', apiKey);
	const res = await fetch(endpoint);
	if (!res.ok) {
		throw new Error(`PSI API ${res.status} for ${url}: ${await res.text()}`);
	}
	const body = await res.json();
	return body.lighthouseResult;
}

async function measureUrl(url, { chromePath, psiKey, runs }) {
	const runMetrics = [];
	for (let i = 0; i < runs; i++) {
		process.stderr.write(`  run ${i + 1}/${runs} ${url}\n`);
		const lhr = psiKey
			? await runPsi(url, psiKey)
			: runLighthouseCli(url, chromePath);
		runMetrics.push(extractGateMetrics(lhr));
	}
	return { runs: runMetrics, median: medianGateMetrics(runMetrics) };
}

function formatBytes(n) {
	if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
	if (n >= 1024) return `${(n / 1024).toFixed(1)} KiB`;
	return `${n} B`;
}

function toMarkdown(baseline) {
	const rows = baseline.matrix
		.map((entry) => {
			const m = entry.median;
			return `| \`${entry.lockedPath}\` | ${entry.standIn ? 'stand-in' : 'direct'} | \`${entry.measuredUrl}\` | ${Math.round(m.lcpMs)} | ${m.cls.toFixed(3)} | ${formatBytes(m.compressedJsBytes)} (${m.compressedJsBytes}) |`;
		})
		.join('\n');

	return `# SvelteKit production performance baseline

Captured for [[18 — Run performance cutover gate vs baseline]] comparison.
Do not re-measure production SvelteKit for cutover — compare rewrite numbers to this artifact.

| Field | Value |
| --- | --- |
| Captured at (UTC) | ${baseline.capturedAt} |
| Site | ${baseline.baseUrl} |
| Tooling | ${baseline.tooling} |
| Form factor | mobile (lab) |
| Aggregation | median of ${baseline.runsPerUrl} runs |
| Theme | ${baseline.theme} |

## Gate metrics (median)

| Locked path | Kind | Measured URL | LCP (ms) | CLS | Compressed first-load JS |
| --- | --- | --- | --- | --- | --- |
${rows}

## Notes

${baseline.matrix.map((e) => `- **${e.id}** (\`${e.lockedPath}\`): ${e.notes}`).join('\n')}

## Machine-readable

See \`docs/perf/sveltekit-production-baseline.json\`.
`;
}

async function main() {
	const chromePath = discoverChromePath();
	const psiKey = process.env.PAGESPEED_API_KEY || process.env.PSI_API_KEY || '';
	let tooling;
	if (chromePath) {
		tooling = `lighthouse CLI (Chrome/Edge path: ${chromePath})`;
		process.stderr.write(`Using browser: ${chromePath}\n`);
	} else if (psiKey) {
		tooling = 'PageSpeed Insights API (mobile strategy)';
		process.stderr.write('No local Chrome/Edge; using PSI API fallback\n');
	} else {
		throw new Error(
			'No Chrome/Edge found and no PAGESPEED_API_KEY. Install Chromium or set CHROME_PATH / PAGESPEED_API_KEY.'
		);
	}

	/** Unique measured URLs so stand-ins sharing a document are not re-run */
	const cache = new Map();
	const matrixResults = [];

	for (const entry of MATRIX) {
		process.stderr.write(`Measuring ${entry.id} → ${entry.measuredUrl}\n`);
		let measured = cache.get(entry.measuredUrl);
		if (!measured) {
			measured = await measureUrl(entry.measuredUrl, {
				chromePath,
				psiKey: chromePath ? '' : psiKey,
				runs: RUNS
			});
			cache.set(entry.measuredUrl, measured);
		} else {
			process.stderr.write(`  (reusing runs for ${entry.measuredUrl})\n`);
		}
		matrixResults.push({
			...entry,
			runs: measured.runs,
			median: measured.median
		});
	}

	const baseline = {
		schemaVersion: 1,
		kind: 'sveltekit-production-baseline',
		forTicket: '18 — Run performance cutover gate vs baseline',
		fromTicket: '01 — Capture SvelteKit production performance baseline',
		capturedAt: new Date().toISOString(),
		baseUrl: BASE,
		tooling,
		formFactor: 'mobile',
		runsPerUrl: RUNS,
		aggregation: 'median',
		theme: 'default System→resolved (production default; measured once, no dual light/dark gate)',
		metrics: ['lcpMs', 'cls', 'compressedJsBytes'],
		matrix: matrixResults
	};

	mkdirSync(outDir, { recursive: true });
	writeFileSync(outJson, JSON.stringify(baseline, null, 2) + '\n', 'utf8');
	writeFileSync(outMd, toMarkdown(baseline), 'utf8');
	process.stderr.write(`Wrote ${outJson}\nWrote ${outMd}\n`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});