/**
 * One-time sharp conversion for Work Case stage media.
 *
 * Emits committed WebP derivatives (~q80) at 800 / 1600 / 2400w next to each
 * wired PNG under `src/images/work/**` and `src/images/projects/aai-*.png`.
 *
 * Usage: `bun run optimize:work-media`
 *
 * Prefer re-running this script over vite-imagetools so the work-case media
 * import graph stays a narrow committed-asset glob.
 */

import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WIDTHS = [800, 1600, 2400];
const WEBP_QUALITY = 80;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesRoot = path.join(__dirname, "../src/images");
const workRoot = path.join(imagesRoot, "work");
const projectsRoot = path.join(imagesRoot, "projects");

/** `home.png` + 800 → `home-800w.webp` */
export function derivativeFileName(pngFileName, width) {
  const { name } = path.parse(pngFileName);
  return `${name}-${width}w.webp`;
}

async function listPngFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listPngFiles(absolute)));
      continue;
    }
    if (entry.isFile() && /\.png$/i.test(entry.name)) {
      files.push(absolute);
    }
  }
  return files;
}

async function collectWiredSources() {
  const workPngs = await listPngFiles(workRoot);
  const projectEntries = existsSync(projectsRoot) ? await readdir(projectsRoot) : [];
  const aaiPngs = projectEntries
    .filter((name) => /^aai-.*\.png$/i.test(name))
    .map((name) => path.join(projectsRoot, name));
  return [...workPngs, ...aaiPngs];
}

async function emitDerivatives(inputPath) {
  const dir = path.dirname(inputPath);
  const fileName = path.basename(inputPath);
  const metadata = await sharp(inputPath).metadata();
  const results = [];

  for (const width of WIDTHS) {
    const outputPath = path.join(dir, derivativeFileName(fileName, width));
    const pipeline = sharp(inputPath).resize({
      width,
      withoutEnlargement: true,
      fastShrinkOnLoad: true,
    });

    await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(outputPath);
    const outputStats = await stat(outputPath);
    results.push({
      width,
      outputPath,
      bytes: outputStats.size,
      sourceWidth: metadata.width ?? null,
    });
  }

  return results;
}

async function main() {
  const sources = await collectWiredSources();
  console.log(
    `Optimizing ${sources.length} wired PNGs → WebP q${WEBP_QUALITY} at ${WIDTHS.join("/")}w`,
  );

  let emitted = 0;
  for (const inputPath of sources) {
    const relative = path.relative(imagesRoot, inputPath);
    const variants = await emitDerivatives(inputPath);
    emitted += variants.length;
    const summary = variants
      .map((variant) => `${variant.width}w=${(variant.bytes / 1024).toFixed(1)}KB`)
      .join(", ");
    console.log(`  ${relative} → ${summary}`);
  }

  console.log(`Done: ${emitted} WebP derivatives under src/images/`);
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
