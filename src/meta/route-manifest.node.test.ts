import { describe, expect, it } from "vitest";
import { ABOUT_PITCH } from "../about/content";
import {
  getWorkCase,
  WORK_FOLDERS,
  workCaseHref,
  workFolderHref,
  workRootHref,
} from "../work/inventory";
import { DEEP_LINK_ROUTES, deepLinkPaths, pageMetaForPath } from "./route-manifest";
import { SITE_NAME, SITE_ORIGIN } from "./site";

describe("Deep-link route manifest (build + App Shell meta seam)", () => {
  it("covers Modes + Work root + locked Work Folder indexes + Work Cases", () => {
    const paths = deepLinkPaths();

    expect(paths).toContain("/");
    expect(paths).toContain("/about");
    expect(paths).toContain("/resume");
    expect(paths).toContain("/contact");
    expect(paths).toContain(workRootHref());

    for (const folder of WORK_FOLDERS) {
      expect(paths).toContain(workFolderHref(folder.slug));
      for (const workCase of folder.cases) {
        expect(paths).toContain(workCaseHref(folder.slug, workCase.slug));
      }
    }

    // Finite set: no duplicates.
    expect(new Set(paths).size).toBe(paths.length);
    expect(DEEP_LINK_ROUTES.length).toBe(paths.length);
  });

  it("stamps About / Contact / Resume / Work Case meta with independent literals", () => {
    const about = pageMetaForPath("/about");
    expect(about.title).toBe(`About · ${SITE_NAME}`);
    expect(about.description).toBe(ABOUT_PITCH);
    expect(about.canonical).toBe(`${SITE_ORIGIN}/about`);

    const contact = pageMetaForPath("/contact");
    expect(contact.title).toBe(`Contact · ${SITE_NAME}`);
    expect(contact.description).toBe(
      "Contact Vishal Kumar — send a message, or reach out by email or LinkedIn.",
    );
    expect(contact.description).not.toMatch(/Contact Mode|form/i);
    expect(contact.canonical).toBe(`${SITE_ORIGIN}/contact`);

    const resume = pageMetaForPath("/resume");
    expect(resume.title).toBe(`Resume · ${SITE_NAME}`);
    expect(resume.description).toBe(
      "PDF resume for Vishal Kumar — Senior Frontend Engineer · React / Next.js · Complex product UI (reporting, forms, platform).",
    );
    expect(resume.description).not.toMatch(/Resume Surface/i);
    expect(resume.canonical).toBe(`${SITE_ORIGIN}/resume`);

    const work = pageMetaForPath(workRootHref());
    expect(work.title).toBe(`Work · ${SITE_NAME}`);
    expect(work.description).toBe("Selected work — what shipped and what it changed.");
    expect(work.description).not.toMatch(/Work Folder|Work Case/i);

    const folder = pageMetaForPath(workFolderHref("labor-solutions"));
    expect(folder.description).toBe("Labor Solutions — selected work and outcomes.");
    expect(folder.description).not.toMatch(/Work Folder/i);

    const engageCase = getWorkCase("labor-solutions", "engage-reporting");
    expect(engageCase?.lede).toBeTruthy();
    const engage = pageMetaForPath("/work/labor-solutions/engage-reporting");
    expect(engage.title).toBe(`Engage reporting · ${SITE_NAME}`);
    expect(engage.description).toBe(engageCase!.lede);
    expect(engage.canonical).toBe(`${SITE_ORIGIN}/work/labor-solutions/engage-reporting`);

    const supplyCase = getWorkCase("prototypes", "supplychain-plus");
    expect(supplyCase?.lede).toBeTruthy();
    const supplyChain = pageMetaForPath("/work/prototypes/supplychain-plus");
    expect(supplyChain.description).toBe(supplyCase!.lede);
  });

  it("stamps `/` as About meta, distinct from the SupplyChain+ Work Case", () => {
    const home = pageMetaForPath("/");
    const about = pageMetaForPath("/about");
    const supplyChain = pageMetaForPath("/work/prototypes/supplychain-plus");

    expect(home.title).toBe(`About · ${SITE_NAME}`);
    expect(home.description).toBe(ABOUT_PITCH);
    expect(home.canonical).toBe(`${SITE_ORIGIN}/`);
    expect(about.title).toBe(home.title);
    expect(about.description).toBe(home.description);
    expect(about.canonical).toBe(`${SITE_ORIGIN}/about`);
    expect(supplyChain.title).toBe(`SupplyChain+ · ${SITE_NAME}`);
    expect(supplyChain.canonical).toBe(`${SITE_ORIGIN}/work/prototypes/supplychain-plus`);
    expect(home.description).not.toBe(supplyChain.description);
    expect(home.description).not.toMatch(/SupplyChain|featured case|Work Case/i);
  });

  it("keeps path and canonical honest for unknown deep links", () => {
    const unknown = pageMetaForPath("/work/nope");
    expect(unknown.path).toBe("/work/nope");
    expect(unknown.canonical).toBe(`${SITE_ORIGIN}/work/nope`);
    expect(unknown.title).toBe(SITE_NAME);
    expect(unknown.description).toBe(ABOUT_PITCH);
  });
});
