import type { Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { StubStage } from "./stub-stage";

export const FeaturedWorkStage: Component = () => (
  <StubStage
    label="Work · Featured Public Storefront (stub)"
    detail="SupplyChain+ opens here in a later ticket."
  />
);

export const AboutStage: Component = () => (
  <StubStage label="About Mode (stub)" />
);

export const ResumeStage: Component = () => (
  <StubStage label="Resume Surface (stub)" />
);

export const ContactStage: Component = () => (
  <StubStage label="Contact Mode (stub)" />
);

export const WorkFolderStage: Component = () => {
  const params = useParams<{ folderSlug: string }>();
  return (
    <StubStage
      label={`Work Folder · ${params.folderSlug} (stub)`}
      detail="Dense outcome list ships in a later ticket."
    />
  );
};

export const WorkCaseStage: Component = () => {
  const params = useParams<{ folderSlug: string; caseSlug: string }>();
  return (
    <StubStage
      label={`Work Case · ${params.folderSlug}/${params.caseSlug} (stub)`}
      detail="Proof-first narrative ships in a later ticket."
    />
  );
};
