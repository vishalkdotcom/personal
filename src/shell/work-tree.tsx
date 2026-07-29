import { A, useLocation, useNavigate } from "@solidjs/router";
import { For, type Component } from "solid-js";
import { WORK_FOLDERS, workCaseHref, type WorkCase, type WorkFolder } from "../work/inventory";

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

/** Active-child section tint — true when a Work Case under this folder is open. */
function folderSectionActive(pathname: string, folder: WorkFolder): boolean {
  return pathname.startsWith(`/work/${folder.slug}/`);
}

function caseActive(pathname: string, folderSlug: string, caseSlug: string): boolean {
  return pathname === workCaseHref(folderSlug, caseSlug);
}

const folderLabelClass = (active: boolean) =>
  [
    "min-w-0 flex-1 truncate text-left text-[11px] font-[550] tracking-[0.02em]",
    active ? "text-accent" : "text-faint",
  ].join(" ");

const caseLinkClass = (active: boolean) =>
  [
    "flex items-center gap-2 rounded-md py-1.5 pr-2.5 pl-7 text-[13px]",
    active ? "bg-bg-active text-fg" : "text-muted hover:bg-bg-hover hover:text-fg",
  ].join(" ");

const FolderIcon: Component = () => (
  <svg
    class="size-3 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path d="M3 7h6l2 2h10v10H3z" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
);

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
      aria-label={props.workCase.title}
      onClick={(event) => {
        if (event.defaultPrevented || isModifiedClick(event)) return;
        event.preventDefault();
        navigate(href());
      }}
    >
      <span class="truncate">{props.workCase.title}</span>
    </A>
  );
};

const WorkFolderGroup: Component<{ folder: WorkFolder }> = (props) => {
  const location = useLocation();
  const active = () => folderSectionActive(location.pathname, props.folder);

  return (
    <div>
      <div class="flex items-center gap-1.5 px-1.5 py-1">
        <span class={active() ? "text-accent" : "text-faint"}>
          <FolderIcon />
        </span>
        <span class={folderLabelClass(active())}>{props.folder.title}</span>
      </div>
      <For each={props.folder.cases}>
        {(workCase) => <WorkCaseLink folderSlug={props.folder.slug} workCase={workCase} />}
      </For>
    </div>
  );
};

/** Left chrome Work tree: always-expanded Work Folders → Work Cases (quiet rows). */
export const WorkTree: Component = () => (
  <nav
    class="flex min-h-0 flex-1 flex-col overflow-hidden group-data-[left-collapsed]/shell:hidden"
    aria-label="Work tree"
  >
    <div class="px-2 pt-1 pb-1.5 text-[11px] font-[550] tracking-[0.02em] text-faint">Work</div>
    <div class="vk-scroll flex min-h-0 flex-1 flex-col gap-px overflow-auto">
      <For each={WORK_FOLDERS}>{(folder) => <WorkFolderGroup folder={folder} />}</For>
    </div>
  </nav>
);
