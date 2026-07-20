import type { Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { getWorkCase, getWorkFolder } from "../work/inventory";
import { StubStage } from "./stub-stage";

export const FeaturedWorkStage: Component = () => (
  <StubStage
    label="Work · Featured Public Storefront (stub)"
    detail="SupplyChain+ opens here in a later ticket."
  />
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
  const workCase = () => getWorkCase(params.folderSlug, params.caseSlug);
  const title = () => workCase()?.title ?? `${params.folderSlug}/${params.caseSlug}`;
  return (
    <StubStage
      label={`Work Case · ${title()} (stub)`}
      detail="Proof-first narrative ships in a later ticket."
    />
  );
};
