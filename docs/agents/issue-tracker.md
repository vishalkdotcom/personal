# Issue tracker: Tolaria vault

Issues for this repo live in the Tolaria vault `pro` (`E:\vishal\vaults\pro`), accessed via the Tolaria MCP.

## Conventions

- Each issue is a markdown note with `type: Issue` (create that Type note if missing)
- Kebab-case filename, first H1 as title
- Frontmatter includes at least `status` (triage role string from `triage-labels.md`) and a `related_to` / `belongs_to` wikilink to a Project note for this portfolio when one exists
- Prefer types and relationships over folders for organization

## When a skill says "publish to the issue tracker"

Create a note with `create_note`. Use `open_note` when the user should see it. Call `refresh_vault` if the note list may be stale.

## When a skill says "fetch the relevant ticket"

Find with `search_notes`, then read with `get_note`. Edit with `update_note` (prefer `expectedMtime` from `get_note`) or `append_to_note` for logs/comments.

## Out of scope

Do not use GitHub Issues or `.scratch/**/issues/` as the tracker of record.
