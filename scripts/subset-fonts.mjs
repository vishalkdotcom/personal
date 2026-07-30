/**
 * One-time font subsetting for self-hosted stage fonts (replaces Google Fonts).
 *
 * Downloads pinned `google/fonts` sources, subsets to the Google Fonts `latin`
 * unicode-range, and emits committed woff2 under `static/fonts/`:
 *
 *   dm-sans-latin.woff2            variable, opsz 9..40 + wght 400..700 kept
 *   ibm-plex-mono-regular-latin.woff2  static 400
 *
 * DM Sans italic is intentionally absent (the app only renders `not-italic`),
 * and wght is clamped to 400..700 (only 400/500/600 are used; 700 = headroom
 * matching the old css2 contract). Prefer re-running this script over editing
 * the woff2 outputs.
 *
 * Usage: `bun run optimize:fonts`
 */

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import subsetFont from "subset-font";

/** Pinned google/fonts commit (ofl/dmsans HEAD as of 2026-07-30). */
const GOOGLE_FONTS_COMMIT = "5b35b7208dd4100571326fdf37f030b32a524232";

/** Google Fonts `latin` subset unicode-range (what css2 serves to browsers). */
const LATIN_RANGES = [
  [0x0000, 0x00ff],
  [0x0131, 0x0131],
  [0x0152, 0x0153],
  [0x02bb, 0x02bc],
  [0x02c6, 0x02c6],
  [0x02da, 0x02da],
  [0x02dc, 0x02dc],
  [0x0304, 0x0304],
  [0x0308, 0x0308],
  [0x0329, 0x0329],
  [0x2000, 0x206f],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
  [0x2191, 0x2191],
  [0x2193, 0x2193],
  [0x2212, 0x2212],
  [0x2215, 0x2215],
  [0xfeff, 0xfeff],
  [0xfffd, 0xfffd],
];

const LATIN_TEXT = LATIN_RANGES.map(([from, to]) =>
  String.fromCodePoint(...Array.from({ length: to - from + 1 }, (_, i) => from + i)),
).join("");

const FONTS = [
  {
    source: "ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf",
    output: "dm-sans-latin.woff2",
    licenseSource: "ofl/dmsans/OFL.txt",
    licenseOutput: "OFL-dm-sans.txt",
    variationAxes: { wght: { min: 400, max: 700 } },
    expectAxes: { opsz: [9, 40], wght: [400, 700] },
  },
  {
    source: "ofl/ibmplexmono/IBMPlexMono-Regular.ttf",
    output: "ibm-plex-mono-regular-latin.woff2",
    licenseSource: "ofl/ibmplexmono/OFL.txt",
    licenseOutput: "OFL-ibm-plex-mono.txt",
    variationAxes: undefined,
    expectAxes: undefined,
  },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsOutDir = path.join(__dirname, "../static/fonts");

async function download(relative) {
  const url = `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/${relative}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${relative}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  await mkdir(fontsOutDir, { recursive: true });

  for (const font of FONTS) {
    const source = await download(font.source);
    const subset = await subsetFont(source, LATIN_TEXT, {
      targetFormat: "woff2",
      // OFL: keep copyright + license notices in the name table.
      preserveNameIds: [0, 3, 4, 13, 14],
      variationAxes: font.variationAxes,
    });

    const parsed = fontkit.create(subset);
    if (font.expectAxes) {
      for (const [axis, [min, max]] of Object.entries(font.expectAxes)) {
        const actual = parsed.variationAxes?.[axis];
        if (!actual || actual.min !== min || actual.max !== max) {
          throw new Error(
            `${font.output}: expected ${axis} ${min}..${max}, got ${JSON.stringify(actual)}`,
          );
        }
      }
    }

    const outputPath = path.join(fontsOutDir, font.output);
    await writeFile(outputPath, subset);
    const license = await download(font.licenseSource);
    await writeFile(path.join(fontsOutDir, font.licenseOutput), license);

    const axes = Object.entries(parsed.variationAxes ?? {})
      .map(([tag, a]) => `${tag} ${a.min}..${a.max}`)
      .join(", ");
    console.log(
      `  ${font.output}: ${((await stat(outputPath)).size / 1024).toFixed(1)} kB ` +
        `(${source.length / 1024 > 1024 ? `${(source.length / 1024 / 1024).toFixed(1)} MB` : `${(source.length / 1024).toFixed(1)} kB`} source, ` +
        `${parsed.numGlyphs} glyphs${axes ? `, axes: ${axes}` : ""})`,
    );
  }

  console.log(`Done: ${FONTS.length} subset woff2 fonts under static/fonts/`);
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
