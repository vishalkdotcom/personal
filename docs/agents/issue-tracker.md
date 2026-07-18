# Issue tracker: Tolaria vault

Issues, Specs, and Projects for this repo live in the Tolaria vault `pro` (`E:\vishal\vaults\pro`), accessed via the Tolaria MCP.

Vault-side conventions (types, views, examples) also live in that vault's `AGENTS.md`. Prefer types and relationships over folders.

## Model

```
Project  →  Spec  →  Issue(s)
```

| Type | Who creates it | Purpose |
|------|----------------|---------|
| **Project** | Once per product | Long-lived home (this repo → `[[vishalk-com]]`) |
| **Spec** | `/to-spec` | Product contract / PRD for one feature or effort |
| **Issue** | `/to-tickets`, `/triage` | Implementable tracer-bullet ticket |

Relationships (frontmatter wikilinks):

- Spec / Issue → Project: `belongs_to: "[[vishalk-com]]"`
- Issue → Spec: `part_of: "[[spec-filename]]"`
- Issue → Issue: `blocked_by: ["[[other-issue]]"]` (YAML list; omit when unblocked)

## Status vocabulary

**Specs** use Spec status (not triage labels):

- `draft` — still forming
- `active` — ready for `/to-tickets` (this is what `/to-spec` should set)
- `done` — effort complete or superseded

**Issues** use triage strings from `triage-labels.md` in the `status` field:

- `needs-triage` | `needs-info` | `ready-for-agent` | `ready-for-human` | `wontfix`

**Projects** use: `Active` | `Paused` | `Done`.

## Default Project for this repo

- Note: `vishalk-com.md` → wikilink `[[vishalk-com]]`
- Title: vishalk.com
- All Specs and Issues for this portfolio must `belongs_to: "[[vishalk-com]]"`

If the Project note is missing, create it before publishing Specs or Issues.

## MCP operations

| Intent | Tools |
|--------|--------|
| Find | `search_notes`, then `get_note` |
| Create | `create_note` (full markdown: YAML frontmatter + H1 + body) |
| Edit | `get_note` → `update_note` with `expectedMtime`, or `append_to_note` for logs |
| Show user | `open_note` |
| Stale list | `refresh_vault` |

Filenames: kebab-case matching the H1 slug. One note per file.

## When a skill says "publish to the issue tracker"

### `/to-spec`

1. Ensure Project `[[vishalk-com]]` exists.
2. `create_note` with `type: Spec`, `status: active`, `belongs_to: "[[vishalk-com]]"`.
3. Body = `/to-spec` template sections (Problem Statement, Solution, User Stories, …).
4. Do **not** use Issue triage labels on Specs. Do **not** create an Issue for the Spec itself.
5. `open_note` on the new Spec.

### `/to-tickets`

1. Fetch the Spec with `get_note` (user may pass path/title).
2. After the user approves the breakdown, publish **one Issue note per ticket**, blockers first.
3. **Number every ticket in the H1** (required for multi-ticket sets from one Spec): zero-padded `01`–`NN`, em dash, then the short title — e.g. `# 03 — Ship desktop Triptych Dock with left Option A`. Use the same numbered titles in `blocked_by` wikilinks and the body **Blocked by** section so the set stays scannable in search and the note list. Single standalone Issues from `/triage` do not need a number.
4. Prefer filenames that sort with the set: `03-ship-desktop-triptych-dock-left-chrome.md` (number prefix + kebab slug).
5. Each Issue:

```yaml
---
type: Issue
status: ready-for-agent
belongs_to: "[[vishalk-com]]"
part_of: "[[spec-filename]]"
blocked_by:
  - "[[01 — Capture SvelteKit production performance baseline]]"
---

# 02 — Scaffold Solid 2 App Shell with Mode routes and FOUC-safe theme

## Parent

[[spec-filename]]

## What to build

…

## Acceptance criteria

- [ ] …

## Blocked by

- [[01 — Capture SvelteKit production performance baseline]]
```

6. Unblocked tickets: omit `blocked_by` or leave it empty; body says "None — can start immediately".
7. Do **not** write a repo-root `tickets.md`. Do **not** close or rewrite the Spec.
8. Before finishing, verify every Issue in the set has a unique `NN —` H1 prefix matching the approved order; fix any unnumbered titles in the same pass.
9. `open_note` on the first unblocked Issue (optional: refresh views).

### `/triage` (incoming / unsolicited work)

1. Create or update an Issue (not a Spec) with the appropriate triage `status`.
2. Set `belongs_to: "[[vishalk-com]]"`. Add `part_of` only if it clearly belongs under an existing Spec.

## When a skill says "fetch the relevant ticket"

1. Resolve the reference (path, title, or search hit) via `search_notes` / `get_note`.
2. If the user pointed at a Spec, read the Spec; child Issues are notes with `part_of` pointing at it.
3. Blocking edges: read each Issue's `blocked_by` list (and the matching body section).

## Saved views (vault)

Under `views/` in the Tolaria vault:

- Active Projects
- Active Specs
- Needs Triage
- Ready for Agent
- vishalk.com Work (`belongs_to` contains `[[vishalk-com]]`)

## Out of scope

Do not use GitHub Issues or `.scratch/**/issues/` as the tracker of record for this repo's engineering work. `.scratch/` may still hold wayfinder research/prototypes; Specs and implementation Issues belong in Tolaria.
