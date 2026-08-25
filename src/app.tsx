import type { ParentComponent } from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import { Route } from "@solidjs/router";
import { DocumentHead } from "./meta/document-head";
import { GoogleAnalytics } from "./meta/google-analytics-root";
import { AppShell } from "./shell/app-shell";
import {
  AboutStage,
  ContactStage,
  ResumeStage,
  WorkCaseStage,
  WorkRootStage,
} from "./stages/mode-stages";

const ShellRoot: ParentComponent = (props) => (
  <MetaProvider>
    <DocumentHead />
    <GoogleAnalytics />
    <AppShell>{props.children}</AppShell>
  </MetaProvider>
);

export const AppShellRoutes = {
  root: ShellRoot,
  routes: (
    <>
      <Route path="/" component={AboutStage} />
      <Route path="/about" component={AboutStage} />
      <Route path="/resume" component={ResumeStage} />
      <Route path="/contact" component={ContactStage} />
      <Route path="/work" component={WorkRootStage} />
      <Route path="/work/:folderSlug/:caseSlug" component={WorkCaseStage} />
    </>
  ),
};
