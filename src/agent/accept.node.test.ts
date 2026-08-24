import { describe, expect, it } from "vitest";
import { HTML_TYPE, MARKDOWN_TYPE, negotiateAccept } from "./accept";

describe("Accept negotiation", () => {
  it("defaults to HTML when Accept is missing or empty", () => {
    expect(negotiateAccept(null)).toEqual({ kind: "match", type: HTML_TYPE });
    expect(negotiateAccept("")).toEqual({ kind: "match", type: HTML_TYPE });
    expect(negotiateAccept("   ")).toEqual({ kind: "match", type: HTML_TYPE });
  });

  it("selects markdown when it is the client's first matching type", () => {
    expect(negotiateAccept("text/markdown")).toEqual({
      kind: "match",
      type: MARKDOWN_TYPE,
    });
    expect(negotiateAccept("text/markdown, text/html, */*")).toEqual({
      kind: "match",
      type: MARKDOWN_TYPE,
    });
  });

  it("selects HTML for typical browser Accept lists", () => {
    expect(
      negotiateAccept("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
    ).toEqual({ kind: "match", type: HTML_TYPE });
  });

  it("honors q-values over source order", () => {
    expect(negotiateAccept("text/html;q=0.1, text/markdown;q=0.9")).toEqual({
      kind: "match",
      type: MARKDOWN_TYPE,
    });
  });

  it("returns 406 when every produced type is q=0 or unmatched", () => {
    expect(negotiateAccept("application/json")).toEqual({ kind: "not-acceptable" });
    expect(negotiateAccept("text/html;q=0, text/markdown;q=0")).toEqual({
      kind: "not-acceptable",
    });
  });
});
