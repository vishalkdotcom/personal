/** RFC 9110 Accept parsing for HTML vs Markdown content negotiation. */

export const HTML_TYPE = "text/html";
export const MARKDOWN_TYPE = "text/markdown";
export const PRODUCES = [HTML_TYPE, MARKDOWN_TYPE] as const;

export type ProducedType = (typeof PRODUCES)[number];

type AcceptEntry = { type: string; q: number; specificity: number };

function parseAccept(header: string): AcceptEntry[] {
  return header
    .split(",")
    .map((raw) => {
      const parts = raw
        .trim()
        .split(";")
        .map((token) => token.trim());
      const type = parts[0]?.toLowerCase();
      if (!type) return null;
      let q = 1;
      for (const param of parts.slice(1)) {
        const [name, value] = param.split("=").map((token) => token.trim());
        if (name === "q") {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
        }
      }
      const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
      return { type, q, specificity };
    })
    .filter((entry): entry is AcceptEntry => entry !== null);
}

function matches(entry: AcceptEntry, candidate: string): boolean {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) return candidate.startsWith(entry.type.slice(0, -1));
  return entry.type === candidate;
}

/**
 * Pick the produced type the client prefers.
 * Missing/empty Accept defaults to HTML (browser-like).
 * Returns null when every produced type is explicitly rejected or unmatched.
 */
export function preferredProducedType(header: string | null): ProducedType | null {
  if (!header || header.trim() === "") return HTML_TYPE;
  const entries = parseAccept(header);
  if (entries.length === 0) return HTML_TYPE;

  let bestType: ProducedType | null = null;
  let bestQ = -1;
  let bestPosition = Infinity;

  for (const candidate of PRODUCES) {
    let matched: AcceptEntry | null = null;
    let matchedPosition = Infinity;
    for (let idx = 0; idx < entries.length; idx++) {
      const entry = entries[idx];
      if (!entry || !matches(entry, candidate)) continue;
      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && idx < matchedPosition)
      ) {
        matched = entry;
        matchedPosition = idx;
      }
    }
    if (matched === null) continue;
    if (matched.q <= 0) continue;
    if (matched.q > bestQ || (matched.q === bestQ && matchedPosition < bestPosition)) {
      bestQ = matched.q;
      bestPosition = matchedPosition;
      bestType = candidate;
    }
  }

  return bestType;
}

/** Ensure `Accept` is listed on Vary (keep Accept-Encoding when already present). */
export function appendVaryAccept(headers: Headers): void {
  const existing = headers.get("vary");
  if (!existing) {
    headers.set("Vary", "Accept, Accept-Encoding");
    return;
  }
  const tokens = existing.split(",").map((token) => token.trim().toLowerCase());
  let vary = existing;
  if (!tokens.includes("accept")) vary = `${vary}, Accept`;
  const withAccept = vary.split(",").map((token) => token.trim().toLowerCase());
  if (!withAccept.includes("accept-encoding")) vary = `${vary}, Accept-Encoding`;
  headers.set("Vary", vary);
}
