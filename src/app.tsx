import type { ParentComponent } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import { Route } from "@solidjs/router";
import { AppShell } from "./shell/app-shell";
import {
  AboutStage,
  ContactStage,
  FeaturedWorkStage,
  ResumeStage,
  WorkCaseStage,
  WorkFolderStage,
} from "./stages/mode-stages";

const ShellRoot: ParentComponent = (props) => (
  <MetaProvider>
    <Title>Vishal Kumar</Title>
    <AppShell>{props.children}</AppShell>
  </MetaProvider>
);

export const AppShellRoutes = {
  root: ShellRoot,
  routes: (
    <>
      <Route path="/" component={FeaturedWorkStage} />
      <Route path="/about" component={AboutStage} />
      <Route path="/resume" component={ResumeStage} />
      <Route path="/contact" component={ContactStage} />
      <Route path="/work/:folderSlug" component={WorkFolderStage} />
      <Route path="/work/:folderSlug/:caseSlug" component={WorkCaseStage} />
    </>
  ),
};
