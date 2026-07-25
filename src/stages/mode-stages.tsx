import type { Component } from "solid-js";
import { Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { getWorkCase, getWorkFolder } from "../work/inventory";
import { StubStage } from "./stub-stage";
import { WorkCaseNarrative } from "./work-case-narrative";
import { WorkFolderIndex, WorkRootIndex } from "./work-outcome-index";

export { AboutStage } from "./about-stage";
export { ContactStage } from "./contact-stage";
export { ResumeStage } from "./resume-stage";

export const WorkRootStage: Component = () => <WorkRootIndex />;

export const WorkFolderStage: Component = () => {
  const params = useParams<{ folderSlug: string }>();
  const folder = () => getWorkFolder(params.folderSlug);

  return (
    <Show
      when={folder()}
      fallback={
        <StubStage label={`Work Folder · ${params.folderSlug}`} detail="Unknown Work Folder." />
      }
    >
      {(active) => <WorkFolderIndex folder={active()} />}
    </Show>
  );
};

export const WorkCaseStage: Component = () => {
  const params = useParams<{ folderSlug: string; caseSlug: string }>();
  const folder = () => getWorkFolder(params.folderSlug);
  const workCase = () => getWorkCase(params.folderSlug, params.caseSlug);
  const title = () => workCase()?.title ?? `${params.folderSlug}/${params.caseSlug}`;
  const narrative = () => {
    const activeFolder = folder();
    const activeCase = workCase();
    return activeFolder && activeCase?.lede
      ? { folder: activeFolder, workCase: activeCase }
      : undefined;
  };

  return (
    <Show
      when={narrative()}
      fallback={
        <StubStage
          label={`Work Case · ${title()} (stub)`}
          detail="Proof-first narrative ships in a later ticket."
        />
      }
    >
      {(entry) => <WorkCaseNarrative folder={entry().folder} workCase={entry().workCase} />}
    </Show>
  );
};
