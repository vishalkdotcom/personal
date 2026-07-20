# Ship Review Gate

Disclosed reference for `/ship`. Load this before commit. Runtime SoT for battery, severity, fix-in-loop, and scope-wall. Shared-chrome **law and loci** live only in [`docs/agents/shared-shell-chrome.md`](../../../docs/agents/shared-shell-chrome.md); this file keeps the pointer and severity mapping.

## Review battery (every ship)

Run all mandatory passes after quality is green and **before** the ship commit. Prefer parallel subagents. The ship diff is still uncommitted — every pass must see that working tree.

| Pass | How (dirty tree) |
| --- | --- |
| **Standards + Spec** | Two-axis review (`/code-review` process) on **`git diff HEAD`** (working tree vs `HEAD`), not `<fixed-point>...HEAD`. Pass the already-loaded Ticket/Spec path into the Spec axis. Treat an empty committed three-dot range as the wrong invocation. |
| **Thermo-nuclear review** | Task `thermo-nuclear-review-subagent` with `Diff: uncommitted changes` (or `natural language` + change description of the ship files) |
| **Thermo-nuclear code-quality** | Task `thermo-nuclear-code-quality-review-subagent` — same Diff contract |
| **Bugbot** | Task `bugbot` (or `/review-bugbot`) with `Diff: uncommitted changes` (or `natural language` for a scoped file list) |

**Security Review** subagent: only when the human asks, or the diff is clearly security-sensitive. Not part of the default battery.

### Prompt shape (thermos / Bugbot)

```text
Full Repository Path: <repo root>
Diff: uncommitted changes
```

When other dirty files must stay out of scope, use `Diff: natural language` and list only the ship paths under `Change Description`.

## Severity

| Class | Meaning | Before commit |
| --- | --- | --- |
| **Hard** | Blocker, incorrect behavior, Spec/AC miss, security issue | **Fix-in-loop** — must clear |
| **Judgement** | Real smell or inconsistency (including a new fork of listed shared chrome) | **Fix-in-loop** — must clear |
| **Nit** | Pure format/lint noise tooling already enforces | May drop |

Treat reviewer labels like “non-blocking”, “defer”, or “later” as **judgement** unless the finding is a true nit. Filing a follow-up Ticket alone does **not** clear a hard or judgement finding.

## Fix-in-loop

Clear hard and judgement findings in this ship session, re-running affected checks as needed, until the battery’s open hard/judgement set is empty.

## Scope wall

When the proper fix is owned by a **different open Ticket or Spec AC**:

1. Stop implementing that fix on your own.
2. Ask the human: expand now, or hold (no commit).
3. Do not silent-defer. Do not commit until they answer and the tree matches that answer.

## Shared chrome

Before changing App Shell chrome, read [`docs/agents/shared-shell-chrome.md`](../../../docs/agents/shared-shell-chrome.md). A new fork of chrome listed there is **judgement** (fix-in-loop), unless a scope wall applies.

## Promote recurring pain

When the same judgement finding recurs across ships, fold the lesson into this gate or the shared-chrome stub (harness upgrade), rather than only narrating it again.
