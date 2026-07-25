import { describe, expect, it } from "vitest";
import { ABOUT_PITCH } from "../about/content";
import { WORK_FOLDERS, workCaseHref, workFolderHref, workRootHref } from "../work/inventory";
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
    expect(contact.description).toContain("Contact Vishal Kumar");
    expect(contact.canonical).toBe(`${SITE_ORIGIN}/contact`);

    const resume = pageMetaForPath("/resume");
    expect(resume.title).toBe(`Resume · ${SITE_NAME}`);
    expect(resume.description).toContain("Resume Surface");
    expect(resume.canonical).toBe(`${SITE_ORIGIN}/resume`);

    const engage = pageMetaForPath("/work/labor-solutions/engage-reporting");
    expect(engage.title).toBe(`Engage reporting · ${SITE_NAME}`);
    expect(engage.description).toContain("Auth-walled Engage questionnaire reporting");
    expect(engage.canonical).toBe(`${SITE_ORIGIN}/work/labor-solutions/engage-reporting`);
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
  });

  it("keeps path and canonical honest for unknown deep links", () => {
    const unknown = pageMetaForPath("/work/nope");
    expect(unknown.path).toBe("/work/nope");
    expect(unknown.canonical).toBe(`${SITE_ORIGIN}/work/nope`);
    expect(unknown.title).toBe(SITE_NAME);
    expect(unknown.description).toBe(ABOUT_PITCH);
  });
});
