# Issue tracker: pro vault

Tracker of record: Obsidian vault **`pro`** (`E:\vishal\vaults\pro`).

Layout, types, Bases, CLI: vault `AGENTS.md` + `CONTEXT.md`. Entry skill: **`pro-vault`**.

## This repo

- Project: `[[vishalk-com]]` → `projects/vishalk-com/vishalk-com.md`
- Specs/Tickets: `belongs_to: "[[vishalk-com]]"`; colocate under `projects/vishalk-com/<spec-slug>/` (or `inbox/` if no Spec)
- Ticket triage `status`: see `triage-labels.md`
- Spec `status`: `draft` \| `active` \| `done` — `/to-spec` sets `active`
- Relationships: `belongs_to`, `part_of` (Ticket→Spec), `blocked_by` (Ticket→Ticket)

## Publish

### `/to-spec`

1. Ensure `[[vishalk-com]]` exists.
2. Create `projects/vishalk-com/<spec-slug>/<spec-slug>.md` with `type: Spec`, `status: active`, `belongs_to: "[[vishalk-com]]"`.
3. Body = `/to-spec` template sections.
4. Specs are not Tickets; do not put triage labels on Specs.

### `/to-tickets`

1. Read the Spec; after approval, publish **one Ticket per ticket**, blockers first, in that Spec's folder.
2. Multi-ticket sets: H1 `# NN — Short title`, filename `NN-kebab-slug.md`; same titles in `blocked_by` / body Blocked by. Triage Tickets may omit the number.
3. Shape:

```yaml
---
type: Ticket
status: ready-for-agent
belongs_to: "[[vishalk-com]]"
part_of: "[[spec-filename]]"
blocked_by:
  - "[[01 — Prior ticket]]"
---

# 02 — Short title

## Parent

[[spec-filename]]

## What to build

…

## Acceptance criteria

- [ ] …

## Blocked by

- [[01 — Prior ticket]]
```

4. Unblocked: omit `blocked_by`; body says "None — can start immediately".
5. No repo-root `tickets.md`; do not close/rewrite the Spec; verify unique `NN —` prefixes.

### `/triage`

Create/update a Ticket with triage `status`, `belongs_to: "[[vishalk-com]]"`. `part_of` only when under an existing Spec; else `inbox/`.

## Fetch

1. `obsidian vault=pro search` / `read`, or filesystem under the vault path.
2. Spec → children via `part_of` (same folder).
3. Blockers via each Ticket's `blocked_by`.

## Out of scope

GitHub Issues and `.scratch/**/issues/` are not the tracker of record. `.scratch/` may still hold wayfinder research/prototypes.
