import { A, useLocation, useNavigate } from "@solidjs/router";
import { For, Show, createSignal, type Component } from "solid-js";
import {
  WORK_FOLDERS,
  workCaseHref,
  workFolderHref,
  type WorkBadge,
  type WorkCase,
  type WorkFolder,
} from "../work/inventory";

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function badgeClass(badge: WorkBadge): string {
  if (badge === "Prototype") {
    return "shrink-0 rounded-full bg-[rgba(232,168,124,0.16)] px-1.5 py-px text-[10px] font-[650] tracking-[0.06em] text-[#e8a87c] uppercase";
  }
  return "shrink-0 rounded-full bg-accent/14 px-1.5 py-px text-[10px] font-[650] tracking-[0.06em] text-accent uppercase";
}

function folderActive(pathname: string, folder: WorkFolder): boolean {
  const base = workFolderHref(folder.slug);
  return pathname === base || pathname.startsWith(`${base}/`);
}

function caseActive(pathname: string, folderSlug: string, caseSlug: string): boolean {
  return pathname === workCaseHref(folderSlug, caseSlug);
}

const folderLinkClass = (active: boolean) =>
  [
    "min-w-0 flex-1 truncate text-left text-[11px] font-[550] tracking-[0.02em]",
    active ? "text-accent" : "text-faint hover:text-fg",
  ].join(" ");

const caseLinkClass = (active: boolean) =>
  [
    "flex items-center justify-between gap-2 rounded-md py-1.5 pr-2.5 pl-7 text-[13px]",
    active ? "bg-bg-active text-fg" : "text-muted hover:bg-bg-hover hover:text-fg",
  ].join(" ");

const WorkCaseLink: Component<{ folderSlug: string; workCase: WorkCase }> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const href = () => workCaseHref(props.folderSlug, props.workCase.slug);

  return (
    <A
      href={href()}
      class={caseLinkClass(caseActive(location.pathname, props.folderSlug, props.workCase.slug))}
      activeClass=""
      inactiveClass=""
      aria-label={`${props.workCase.title} ${props.workCase.badge}`}
      onClick={(event) => {
        if (event.defaultPrevented || isModifiedClick(event)) return;
        event.preventDefault();
        navigate(href());
      }}
    >
      <span class="truncate">{props.workCase.title}</span>
      <span class={badgeClass(props.workCase.badge)}>{props.workCase.badge}</span>
    </A>
  );
};

const WorkFolderGroup: Component<{ folder: WorkFolder }> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = createSignal(false);
  const folderHref = () => workFolderHref(props.folder.slug);

  return (
    <div>
      <div class="flex items-center gap-0.5 px-1.5 py-1">
        <button
          type="button"
          class="grid size-5 shrink-0 place-items-center rounded text-faint hover:bg-bg-hover hover:text-fg"
          aria-expanded={collapsed() ? "false" : "true"}
          aria-label={
            collapsed() ? `Expand ${props.folder.title}` : `Collapse ${props.folder.title}`
          }
          onClick={() => setCollapsed((value) => !value)}
        >
          <span class="text-[10px] leading-none" aria-hidden="true">
            {collapsed() ? "▸" : "▾"}
          </span>
        </button>
        <A
          href={folderHref()}
          class={folderLinkClass(folderActive(location.pathname, props.folder))}
          activeClass=""
          inactiveClass=""
          onClick={(event) => {
            if (event.defaultPrevented || isModifiedClick(event)) return;
            event.preventDefault();
            navigate(folderHref());
          }}
        >
          {props.folder.title}
        </A>
      </div>
      <Show when={!collapsed()}>
        <For each={props.folder.cases}>
          {(workCase) => <WorkCaseLink folderSlug={props.folder.slug} workCase={workCase} />}
        </For>
      </Show>
    </div>
  );
};

/** Left chrome Work tree: Work Folders → Work Cases with Production/Prototype badges. */
export const WorkTree: Component = () => (
  <nav
    class="flex min-h-0 flex-1 flex-col overflow-hidden group-data-[left-collapsed]/shell:hidden"
    aria-label="Work tree"
  >
    <div class="px-2 pt-1 pb-1.5 text-[11px] font-[550] tracking-[0.02em] text-faint">Work</div>
    <div class="flex min-h-0 flex-1 flex-col gap-px overflow-auto">
      <For each={WORK_FOLDERS}>{(folder) => <WorkFolderGroup folder={folder} />}</For>
    </div>
  </nav>
);
