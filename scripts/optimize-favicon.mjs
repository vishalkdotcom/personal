/**
 * One-time favicon.ico slim-down: wrap the committed 16/32px PNGs in an ICO
 * container (PNG-payload frames, supported by every browser/OS since Vista).
 * The legacy multi-size ico (~15 kB) carried 48px+ frames that browsers never
 * use — tabs paint from 16/32, everything else uses favicon.svg or the
 * android-chrome PNG set.
 *
 * Usage: `bun run optimize:favicon`
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirname, "../static");
const FRAMES = ["favicon-16x16.png", "favicon-32x32.png"];

/** ICO: 6-byte header + 16-byte directory per frame + PNG payloads. */
function wrapPngsAsIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 2); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4); // count

  let offset = 6 + pngs.length * 16;
  const directories = pngs.map(({ data, width, height }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width === 256 ? 0 : width, 0);
    entry.writeUInt8(height === 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...directories, ...pngs.map((png) => png.data)]);
}

/** PNG IHDR: width/height are big-endian uint32 at bytes 16/20. */
function pngDimensions(data, name) {
  const signature = "89504e470d0a1a0a";
  if (data.subarray(0, 8).toString("hex") !== signature) {
    throw new Error(`${name} is not a PNG`);
  }
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

async function main() {
  const pngs = [];
  for (const name of FRAMES) {
    const data = await readFile(path.join(staticDir, name));
    pngs.push({ data, ...pngDimensions(data, name) });
  }
  const ico = wrapPngsAsIco(pngs);
  await writeFile(path.join(staticDir, "favicon.ico"), ico);
  console.log(
    `  favicon.ico: ${(ico.length / 1024).toFixed(1)} kB (${pngs.map((p) => `${p.width}x${p.height}`).join(" + ")}, PNG-payload frames)`,
  );
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
