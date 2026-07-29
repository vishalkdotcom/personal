# Shared shell chrome

Harness rule for agents: **one home per shared App Shell surface — extend it, do not fork a parallel copy.**

This is process law for `/ship` and reviews. It is not product copy and does not change visitor-facing behavior by itself.

## Rule

When you add or change chrome that several Modes or Work Cases share (rail sections, shell CTAs, nav, layout chrome, theme entry, hire/availability surfaces), edit the **existing** locus. Do not introduce a second near-duplicate implementation or divergent copy string “just for this Mode.”

Mode-specific **content beside** shared chrome (facts, case outcomes, form fields) stays mode-local. The shared control or section itself stays singular.

## Current loci

Update this list when a locus moves or consolidates.

| Surface | Where it lives today |
| --- | --- |
| Context Rail (incl. availability / hire CTA slots per Mode) | Shell Context Rail module under `src/shell/` |
| Hire Signal flag, snooze, chip blurb | Hire Signal module + chip under `src/shell/` |
| Availability / elsewhere / quick-link **copy data** | Mode content modules under `src/about/`, `src/resume/`, `src/contact/` (prefer one shared export when copy is identical) |
| Mode list / left IA / identity foot | Mode nav + left chrome under `src/shell/` |
| App Shell layout / mobile shell | App Shell + mobile shell under `src/shell/` |
| Theme preference entry | Theme module under `src/theme/` (wired by the App Shell) |

## Reviewers

Enforce this under the Ship Review Gate (severity and fix-in-loop live there).
