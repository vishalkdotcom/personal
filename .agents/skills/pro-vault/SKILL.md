---
name: pro-vault
description: >-
  Pro vault conventions for Project → Spec → Ticket work in vault pro. Use when
  creating, finding, or organizing notes in the pro vault, or when another skill
  needs this repo's tracker of record before Obsidian CLI (vault=pro).
---

# Pro vault

## Path

| | |
|---|---|
| **Label** | `pro` |
| **Windows** | `E:\vishal\vaults\pro` |
| **CLI** | `obsidian vault=pro …` (this machine: `%USERPROFILE%\bin\obsidian.cmd` → Scoop `Obsidian.com`) |

## Conventions

**Read `{vault}/AGENTS.md` and `{vault}/CONTEXT.md` before adding or moving notes** — layout, types, Bases, CLI.

**Read `docs/agents/issue-tracker.md` for publish/fetch** (`/to-spec`, `/to-tickets`, `/triage`) in this repo.

Default Project: `[[vishalk-com]]`.

## Mechanics

| Skill | Use for |
|---|---|
| `obsidian-cli` | Note CRUD/search/properties — `vault=pro` first |
| `obsidian-markdown` | Wikilinks, properties, Obsidian Markdown |
| `obsidian-bases` | `.base` files under `bases/` |
