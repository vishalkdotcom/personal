/* @refresh reload */
import { render } from "@solidjs/web";
import { Router } from "@solidjs/router";
import { AppShellRoutes } from "./app";
import "./styles.css";

const root = document.getElementById("app");
if (!root) {
  throw new Error("Missing #app mount point");
}

render(
  () => (
    <Router root={AppShellRoutes.root}>{AppShellRoutes.routes}</Router>
  ),
  root,
);
