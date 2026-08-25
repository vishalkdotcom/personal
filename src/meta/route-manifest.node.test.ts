import { describe, expect, it } from "vitest";
import { ABOUT_META, ABOUT_NAME, ABOUT_PITCH, HOME_DESCRIPTION } from "../about/content";
import { getWorkCase, WORK_FOLDERS, workCaseHref, workRootHref } from "../work/inventory";
import { DEEP_LINK_ROUTES, deepLinkPaths, pageMetaForPath } from "./route-manifest";
import { HOME_TITLE, SITE_ORIGIN } from "./site";

describe("Deep-link route manifest (build + App Shell meta seam)", () => {
  it("covers Modes + Work root + Work Cases, without Work Folder index paths", () => {
    const paths = deepLinkPaths();

    expect(paths).toContain("/");
    expect(paths).toContain("/about");
    expect(paths).toContain("/privacy");
    expect(paths).toContain("/resume");
    expect(paths).toContain("/contact");
    expect(paths).toContain(workRootHref());

    for (const folder of WORK_FOLDERS) {
      expect(paths).not.toContain(`/work/${folder.slug}`);
      for (const workCase of folder.cases) {
        expect(paths).toContain(workCaseHref(folder.slug, workCase.slug));
      }
    }

    // Finite set: no duplicates.
    expect(new Set(paths).size).toBe(paths.length);
    expect(DEEP_LINK_ROUTES.length).toBe(paths.length);
  });

  it("stamps About / Contact / Resume / Work Case meta with independent literals", () => {
    const home = pageMetaForPath("/");
    expect(home.title).toBe(HOME_TITLE);
    expect(home.description).toBe(HOME_DESCRIPTION);
    expect(home.description).toMatch(/Vishal Kumar of vishalk\.com/i);
    expect(home.description).toContain(ABOUT_PITCH);
    expect(home.canonical).toBe(`${SITE_ORIGIN}/`);

    const about = pageMetaForPath("/about");
    expect(about.title).toBe(`About · ${HOME_TITLE}`);
    expect(about.description).toBe(HOME_DESCRIPTION);
    expect(about.canonical).toBe(`${SITE_ORIGIN}/about`);

    const contact = pageMetaForPath("/contact");
    expect(contact.title).toBe(`Contact · ${HOME_TITLE}`);
    expect(contact.description).toBe(
      "Contact Vishal Kumar of vishalk.com — send a message, or reach out by email or LinkedIn.",
    );
    expect(contact.description).not.toMatch(/Contact Mode|form/i);
    expect(contact.canonical).toBe(`${SITE_ORIGIN}/contact`);

    const resume = pageMetaForPath("/resume");
    expect(resume.title).toBe(`Resume · ${HOME_TITLE}`);
    expect(resume.description).toBe(`PDF resume for ${ABOUT_NAME} — ${ABOUT_META}.`);
    expect(ABOUT_META).toBe(
      "Senior Frontend Engineer · React / Next.js · Product UI (reporting, forms, platform)",
    );
    expect(resume.description).not.toMatch(/Resume Surface|Complex product UI|Complex Product UI/i);
    expect(resume.canonical).toBe(`${SITE_ORIGIN}/resume`);

    const work = pageMetaForPath(workRootHref());
    expect(work.title).toBe(`Work · ${HOME_TITLE}`);
    expect(work.description).toBe("Selected work — what shipped and what it changed.");
    expect(work.description).not.toMatch(/Work Folder|Work Case/i);

    const folderOnly = pageMetaForPath("/work/labor-solutions");
    expect(folderOnly.path).toBe("/work/labor-solutions");
    expect(folderOnly.canonical).toBe(`${SITE_ORIGIN}/work/labor-solutions`);
    expect(folderOnly.title).toBe(HOME_TITLE);
    expect(folderOnly.description).toBe(ABOUT_PITCH);
    expect(folderOnly.description).not.toBe("Labor Solutions — selected work and outcomes.");

    const engageCase = getWorkCase("labor-solutions", "engage-reporting");
    expect(engageCase?.lede).toBeTruthy();
    const engage = pageMetaForPath("/work/labor-solutions/engage-reporting");
    expect(engage.title).toBe(`Engage reporting · ${HOME_TITLE}`);
    expect(engage.description).toBe(engageCase!.lede);
    expect(engage.canonical).toBe(`${SITE_ORIGIN}/work/labor-solutions/engage-reporting`);

    const supplyCase = getWorkCase("prototypes", "supplychain-plus");
    expect(supplyCase?.lede).toBeTruthy();
    const supplyChain = pageMetaForPath("/work/prototypes/supplychain-plus");
    expect(supplyChain.description).toBe(supplyCase!.lede);
  });

  it("inherits PromptSurvey case meta from the renamed inventory entry", () => {
    const promptSurvey = getWorkCase("prototypes", "promptsurvey");
    expect(promptSurvey?.title).toBe("PromptSurvey");
    expect(promptSurvey?.slug).toBe("promptsurvey");
    const promptSurveyPath = workCaseHref("prototypes", "promptsurvey");
    expect(promptSurveyPath).toBe("/work/prototypes/promptsurvey");
    const promptSurveyMeta = pageMetaForPath(promptSurveyPath);
    expect(promptSurveyMeta.title).toBe(`PromptSurvey · ${HOME_TITLE}`);
    expect(promptSurveyMeta.description).toBe(promptSurvey!.lede);
    expect(promptSurveyMeta.canonical).toBe(`${SITE_ORIGIN}/work/prototypes/promptsurvey`);
    expect(deepLinkPaths()).not.toContain("/work/prototypes/qgenai");
    expect(pageMetaForPath("/work/prototypes/qgenai").title).toBe(HOME_TITLE);
  });

  it("stamps `/` as About meta, distinct from the SupplyChain+ Work Case", () => {
    const home = pageMetaForPath("/");
    const supplyChain = pageMetaForPath("/work/prototypes/supplychain-plus");

    expect(home.title).toBe(HOME_TITLE);
    expect(home.description).toBe(HOME_DESCRIPTION);
    expect(home.canonical).toBe(`${SITE_ORIGIN}/`);
    expect(pageMetaForPath("/about").title).toBe(`About · ${HOME_TITLE}`);
    expect(deepLinkPaths()).toContain("/about");
<<<<<<< HEAD
    expect(pageMetaForPath("/privacy").title).toBe(SITE_NAME);
    expect(deepLinkPaths()).not.toContain("/privacy");
    expect(supplyChain.title).toBe(`SupplyChain+ · ${SITE_NAME}`);
=======
    expect(pageMetaForPath("/privacy").title).toBe(`Privacy · ${HOME_TITLE}`);
    expect(deepLinkPaths()).toContain("/privacy");
    expect(supplyChain.title).toBe(`SupplyChain+ · ${HOME_TITLE}`);
>>>>>>> 60b267d (Put vishalk.com in trust-page and Mode document titles.)
    expect(supplyChain.canonical).toBe(`${SITE_ORIGIN}/work/prototypes/supplychain-plus`);
    expect(home.description).not.toBe(supplyChain.description);
    expect(home.description).not.toMatch(/SupplyChain|featured case|Work Case/i);
  });

  it("keeps path and canonical honest for unknown deep links", () => {
    const unknown = pageMetaForPath("/work/nope");
    expect(unknown.path).toBe("/work/nope");
    expect(unknown.canonical).toBe(`${SITE_ORIGIN}/work/nope`);
    expect(unknown.title).toBe(HOME_TITLE);
    expect(unknown.description).toBe(ABOUT_PITCH);
  });
});
