export const HTML_TYPE = "text/html";
export const MARKDOWN_TYPE = "text/markdown";

export type ProducedType = typeof HTML_TYPE | typeof MARKDOWN_TYPE;

export type Negotiation = { kind: "match"; type: ProducedType } | { kind: "not-acceptable" };

type MediaRange = {
  type: string;
  subtype: string;
  q: number;
  index: number;
};

function parseQ(params: string[]): number {
  for (const param of params) {
    const trimmed = param.trim();
    if (!trimmed.toLowerCase().startsWith("q=")) continue;
    const raw = Number.parseFloat(trimmed.slice(2));
    if (Number.isNaN(raw)) return 0;
    return Math.min(1, Math.max(0, raw));
  }
  return 1;
}

function parseAccept(header: string): MediaRange[] {
  const parts = header.split(",");
  const ranges: MediaRange[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    const chunk = parts[index]?.trim();
    if (!chunk) continue;
    const [rawType, ...params] = chunk.split(";");
    const media = rawType?.trim().toLowerCase();
    if (!media) continue;
    const slash = media.indexOf("/");
    const type = slash === -1 ? media : media.slice(0, slash);
    const subtype = slash === -1 ? "*" : media.slice(slash + 1);
    if (!type) continue;
    ranges.push({ type, subtype: subtype || "*", q: parseQ(params), index });
  }
  return ranges;
}

function specificity(range: MediaRange): number {
  if (range.type === "*" && range.subtype === "*") return 0;
  if (range.subtype === "*") return 1;
  return 2;
}

function matches(range: MediaRange, candidate: ProducedType): boolean {
  const slash = candidate.indexOf("/");
  const type = candidate.slice(0, slash);
  const subtype = candidate.slice(slash + 1);
  if (range.type === "*" && range.subtype === "*") return true;
  if (range.type === type && range.subtype === "*") return true;
  return range.type === type && range.subtype === subtype;
}

/** Pick HTML vs Markdown from Accept. Highest q wins; client order breaks ties. */
export function negotiateAccept(
  acceptHeader: string | null,
  produced: readonly ProducedType[] = [HTML_TYPE, MARKDOWN_TYPE],
): Negotiation {
  if (!acceptHeader || acceptHeader.trim() === "") {
    return { kind: "match", type: produced[0] ?? HTML_TYPE };
  }

  const ranges = parseAccept(acceptHeader);
  if (ranges.length === 0) {
    return { kind: "match", type: produced[0] ?? HTML_TYPE };
  }

  let best: { candidate: ProducedType; q: number; index: number; spec: number } | undefined;

  for (const candidate of produced) {
    let matched: MediaRange | undefined;
    for (const range of ranges) {
      if (!matches(range, candidate)) continue;
      if (
        !matched ||
        specificity(range) > specificity(matched) ||
        (specificity(range) === specificity(matched) && range.index < matched.index)
      ) {
        matched = range;
      }
    }
    if (!matched || matched.q <= 0) continue;

    const spec = specificity(matched);
    if (
      !best ||
      matched.q > best.q ||
      (matched.q === best.q && matched.index < best.index) ||
      (matched.q === best.q && matched.index === best.index && spec > best.spec)
    ) {
      best = { candidate, q: matched.q, index: matched.index, spec };
    }
  }

  if (!best) return { kind: "not-acceptable" };
  return { kind: "match", type: best.candidate };
}

export function prefersMarkdown(acceptHeader: string | null): boolean {
  const result = negotiateAccept(acceptHeader);
  return result.kind === "match" && result.type === MARKDOWN_TYPE;
}
