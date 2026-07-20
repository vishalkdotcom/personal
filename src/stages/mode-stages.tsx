import type { Component } from "solid-js";
import { Show } from "solid-js";
import { useParams } from "@solidjs/router";
import {
  getFeaturedWorkCase,
  getFeaturedWorkFolder,
  getWorkCase,
  getWorkFolder,
} from "../work/inventory";
import { StubStage } from "./stub-stage";
import { WorkCaseNarrative } from "./work-case-narrative";

export const FeaturedWorkStage: Component = () => (
  <WorkCaseNarrative folder={getFeaturedWorkFolder()} workCase={getFeaturedWorkCase()} />
);

export const AboutStage: Component = () => <StubStage label="About Mode (stub)" />;

export const ResumeStage: Component = () => <StubStage label="Resume Surface (stub)" />;

export const ContactStage: Component = () => <StubStage label="Contact Mode (stub)" />;

export const WorkFolderStage: Component = () => {
  const params = useParams<{ folderSlug: string }>();
  const folder = () => getWorkFolder(params.folderSlug);
  const title = () => folder()?.title ?? params.folderSlug;
  return (
    <StubStage
      label={`Work Folder · ${title()} (stub)`}
      detail="Dense outcome list ships in a later ticket."
    />
  );
};

export const WorkCaseStage: Component = () => {
  const params = useParams<{ folderSlug: string; caseSlug: string }>();
  const folder = () => getWorkFolder(params.folderSlug);
  const workCase = () => getWorkCase(params.folderSlug, params.caseSlug);
  const title = () => workCase()?.title ?? `${params.folderSlug}/${params.caseSlug}`;
  const shipped = () => {
    const activeFolder = folder();
    const activeCase = workCase();
    return activeFolder && activeCase?.lede && activeCase.surface === "public-storefront"
      ? { folder: activeFolder, workCase: activeCase }
      : undefined;
  };

  return (
    <Show
      when={shipped()}
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
