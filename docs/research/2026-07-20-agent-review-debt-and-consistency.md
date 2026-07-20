# Agent review debt, inconsistency, and cross-cutting consistency (2024–2026)

**Date:** 2026-07-20  
**Question:** How do serious practitioners and AI-native teams address coding-agent inconsistency, review-debt (findings labeled “judgement / non-blocking / defer” and never owned), and agents that ship ticket-scoped work while ignoring shared UI/copy seams?

**Method:** Prefer first-party blogs, official docs, named practitioner posts, and org engineering write-ups. Follow claims to the owning source. SEO listicles used only as pointers, not as evidence.

---

## Problem framing

Ticket-scoped coding agents are good at closing a single Spec/Ticket, but they systematically under-invest in three things humans used to absorb for free: (1) shared chrome and copy that live outside the ticket boundary, (2) converting multi-pass review findings into owned work, and (3) closing the loop so Standards/Spec/security/Bugbot/thermos-style audits become fixes or tickets rather than unread comment piles. Industry evidence from 2025–2026 converges on the same diagnosis: **writing got cheap; understanding, consistency, and ownership did not** ([Simon Willison](https://simonwillison.net/guides/agentic-engineering-patterns/code-is-cheap/); [Addy Osmani](https://addyosmani.com/blog/agentic-code-review/); [OpenAI harness engineering](https://openai.com/index/harness-engineering/)).

---

## Findings by tactic

### 1. Spec / plan / ticket design that forces shared seams

**What serious teams do:** Treat research and plans (not only the final diff) as the primary human-reviewed artifacts. HumanLayer’s Dex Horthy describes a Research → Plan → Implement workflow where humans spend attention on research and plans because “a bad line of a plan could lead to hundreds of bad lines of code,” and “a bad line of research… thousands” ([Advanced Context Engineering for Coding Agents](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). Specs/plans become the durable “source” Sean Grove’s “Specs are the new code” framing argues for (cited in that same essay).

OpenAI’s agent-first product team version-controls **execution plans**, **product specs**, **design docs**, and a **tech-debt tracker** inside the repo so agents can see cross-cutting work without tribal Slack knowledge ([Harness engineering](https://openai.com/index/harness-engineering/)). Factory’s AGENTS.md guidance similarly tells agents to run Explore → Plan → Code → Verify and require proof signals before merge ([Factory AGENTS.md docs](https://docs.factory.ai/cli/configuration/agents-md)).

**On shared UI/copy specifically:** Primary sources rarely use the phrase “cross-cutting chrome AC.” The closest operational patterns are:

- Put shared conventions in **repo-local, versioned docs** the agent must load (OpenAI’s `FRONTEND.md`, design-system reference files, `QUALITY_SCORE.md`) rather than hoping ticket text mentions them ([OpenAI](https://openai.com/index/harness-engineering/)).
- Encode **mechanical invariants** (layer boundaries, naming, file-size limits) as custom linters/structural tests whose error messages inject remediation into agent context ([OpenAI](https://openai.com/index/harness-engineering/); Thoughtworks [feedback sensors](https://www.thoughtworks.com/radar/techniques/feedback-sensors-for-coding-agents)).
- Make **scope discipline** an explicit non-negotiable (“touch only what you’re asked to touch”) *and* separately maintain shared modules so the correct behavior is reuse, not copy ([Addy Osmani, Agent Skills](https://addyosmani.com/blog/agent-skills/)).

**Thin evidence note:** There is little published first-party material that says “every feature ticket must include AC for Triptych Dock / shared copy.” The strong pattern is **make shared seams legible and enforceable in-repo**, then reference them from tickets—not hope agents invent consistency.

---

### 2. Context engineering / AGENTS.md / CLAUDE.md that reduce duplication and drift

**Consensus pattern (strong evidence):** Short map + progressive disclosure, not one giant instruction dump.

| Source | Claim |
| --- | --- |
| [OpenAI harness engineering](https://openai.com/index/harness-engineering/) | One big `AGENTS.md` failed: crowded context, everything “important,” instant rot. They keep ~100-line `AGENTS.md` as a **table of contents** into `docs/`. |
| [Anthropic Claude Code best practices](https://code.claude.com/docs/en/best-practices) | Keep `CLAUDE.md` concise; only what the agent cannot infer; bloated files cause ignored rules. Domain workflows → skills (on-demand). |
| [Thoughtworks — AGENTS.md](https://www.thoughtworks.com/radar/techniques/agents-md) (Trial, Nov 2025) | Common format as agent starting point (build/test/commit practices). |
| [Thoughtworks — agent instruction bloat](https://www.thoughtworks.com/radar/techniques/agent-instruction-bloat) (Caution, Apr 2026) | Long/conflicting instruction files; mid-context neglect; hand-written often beats LLM-generated. |
| [Thoughtworks — progressive context disclosure](https://www.thoughtworks.com/radar/techniques/progressive-context-disclosure) (Trial, Apr 2026) | Load detailed guidance only when relevant (skills, RAG-style discovery). |
| [agents.md](https://agents.md/) / [Factory](https://factory.ai/news/agents-md) | Vendor-neutral convention (Codex, Cursor, Amp, Jules, Factory, …); nest per package. |
| [Dex Horthy / HumanLayer](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md) | “Frequent intentional compaction”; keep context utilization ~40–60%; subagents for search/summarize so parent stays in smart zone. |

**Implication for duplication:** Agents duplicate shared UI/copy when (a) the shared module is not discoverable in the short map, (b) ticket AC doesn’t point at it, and (c) there is no mechanical check that fails on duplicated strings/components. Docs alone are advisory; **hooks/linters** are deterministic ([Anthropic](https://code.claude.com/docs/en/best-practices); [Thoughtworks feedback sensors](https://www.thoughtworks.com/radar/techniques/feedback-sensors-for-coding-agents)).

---

### 3. Human-in-the-loop patterns: plan-then-build, grill-then-ship, Ralph loops

**Plan-then-build / research-plan-implement**

- Anthropic: Explore → Plan → Implement → Commit; plan mode for multi-file/uncertain work ([best practices](https://code.claude.com/docs/en/best-practices)).
- HumanLayer: Research / Plan / Implement with human review concentrated on research+plan ([ace-fca](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). Pragmatic Engineer interview with Dex also describes “slow loops” (nightly quality agents open PRs; humans still read before merge) ([Pragmatic Engineer / Dex Horthy](https://newsletter.pragmaticengineer.com/p/context-engineering-with-dex-horthy)).

**Ralph loops (Geoffrey Huntley)**

- Core idea: state on disk (plan file, git, tests), fresh context each iteration, one task per loop, backpressure from tests/lints ([ghuntley.com/loop](https://ghuntley.com/loop/); original Ralph framing referenced as [ghuntley.com/ralph](https://ghuntley.com/ralph/)).
- OpenAI explicitly runs a Ralph-style loop: agent self-reviews, requests more agent reviews, responds to feedback until reviewers are satisfied ([Harness engineering](https://openai.com/index/harness-engineering/)).
- GitHub’s awesome-copilot cookbook restates: disk as shared state; backpressure essential; `AGENTS.md` brief ([ralph-loop.md](https://github.com/github/awesome-copilot/blob/8d91380b/cookbook/copilot-sdk/python/ralph-loop.md)).

**Anti-rationalization / make senior steps non-optional**

- Osmani’s Agent Skills: workflows with exit criteria; **anti-rationalization tables** that pre-rebut “too simple for a spec,” “tests later,” “tests pass, ship it” ([Agent Skills](https://addyosmani.com/blog/agent-skills/)). This is the closest primary source to “forbid silent defer of review findings,” framed as process, not hope.

**Verification as the stop condition**

- Anthropic: give Claude a check it can run; Stop hooks / `/goal`; evidence over assertion ([best practices](https://code.claude.com/docs/en/best-practices)).
- Willison: “good code” includes *knowing* it works—tests, docs, error handling—not just typed output ([code is cheap](https://simonwillison.net/guides/agentic-engineering-patterns/code-is-cheap/)).
- Thoughtworks: feedback sensors during the coding session, before commit ([feedback sensors](https://www.thoughtworks.com/radar/techniques/feedback-sensors-for-coding-agents)).

---

### 4. Multi-agent / multi-pass review pipelines and how findings are triaged

**Fresh-context adversarial review (strong pattern)**

Anthropic’s official guidance: before treating work as done, have a **subagent review the diff in a fresh context**; implementing session receives gaps and can fix + re-review. Warns that reviewers asked to “find gaps” will invent some—constrain to correctness/requirements or you over-engineer ([best practices — adversarial review](https://code.claude.com/docs/en/best-practices)). Writer/Reviewer dual sessions make the same point: review without implementer bias.

**Managed multi-agent PR review (Anthropic Code Review)**

- Team of agents on PRs; verify to filter false positives; rank by severity; **does not approve/block**—human still owns merge ([Claude blog](https://claude.com/blog/code-review); [docs](https://code.claude.com/docs/en/code-review)).
- Internal: substantive review comments 16% → 54%; &lt;1% findings marked incorrect; large PRs often dense with findings ([blog](https://claude.com/blog/code-review)).
- Tunable via `CLAUDE.md` / `REVIEW.md` ([docs](https://code.claude.com/docs/en/code-review)).

**Cursor Bugbot**

- Comments on PR diffs; Fix in Cursor / Fix in Web; Autofix can spawn a Cloud Agent to push fixes ([Bugbot docs](https://cursor.com/docs/bugbot)).
- **Important ownership gap:** findings default to GitHub check conclusion `neutral`; requiring the check alone does **not** block merge. Optional org setting: fail-on-unresolved-issues → `failure` ([Bugbot docs](https://cursor.com/docs/bugbot)).
- Known limitation: not all issues surface first pass; re-trigger with `cursor review` / `bugbot run` ([Cursor forum](https://forum.cursor.com/t/bugbot-doesnt-catch-all-issues-on-first-pass-multiple-review-cycles-needed/151367)).

**GitHub Copilot coding agent + review ownership**

- Agent opens draft PRs; **requester cannot be sole approver**; human approval required; Actions may need approval before running ([GitHub blog — coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/); [assigning issues](https://github.blog/ai-and-ml/github-copilot/assigning-and-completing-issues-with-coding-agent-in-github-copilot/)).
- Product stance: “developers will always own the merge button”; AI is first-pass, not judgment replacement ([Code review in the age of AI](https://github.blog/ai-and-ml/generative-ai/code-review-in-the-age-of-ai-why-developers-will-always-own-the-merge-button/)).
- `@copilot` mention required to act on comments—so notes don’t silently become work, but **explicit commands** do ([changelog](https://github.blog/changelog/2025-08-05-copilot-coding-agent-improved-pull-request-review-experience/)).

**Heterogeneous reviewers**

Osmani reports (citing an engineer’s experiment across CodeRabbit / Greptile / Seer / Bugbot) that ~93% of distinct findings were unique to one tool—argument for **heterogeneous** multi-pass review, not four copies of one model ([Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)). Treat each as a **sensor**, not a verdict.

**OpenAI: agent-to-agent review as the default path**

Their agent-first team pushed most review effort to agent-to-agent loops; humans prioritize work, write acceptance criteria, validate outcomes, and when agents struggle, encode missing capability into the repo ([Harness engineering](https://openai.com/index/harness-engineering/)). Separately, OpenAI Cookbook’s agent improvement loop turns traces + human feedback into evals and a `codex_handoff.md` so comments become **harness changes**, not orphan notes ([cookbook](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)).

---

### 5. Review → ticket / fix-or-file gates (closing the loop)

**What the evidence supports well**

1. **Fix-in-loop before “done”** — Anthropic adversarial review returns gaps to the implementer for fix + re-review ([best practices](https://code.claude.com/docs/en/best-practices)). OpenAI Ralph-style: iterate until agent reviewers satisfied ([harness engineering](https://openai.com/index/harness-engineering/)).
2. **Deterministic gates that cannot be talked out of** — CI, custom linters, structural tests, Stop hooks ([OpenAI](https://openai.com/index/harness-engineering/); [Anthropic](https://code.claude.com/docs/en/best-practices); [Thoughtworks](https://www.thoughtworks.com/radar/techniques/feedback-sensors-for-coding-agents)). Osmani: agents will weaken CI to go green; treat CI as immovable ([Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)).
3. **Evidence required before human review** — statement of intent, small diff, test output ([Osmani](https://addyosmani.com/blog/agentic-code-review/); [proof over vibes](https://addyosmani.com/blog/code-review-ai)).
4. **Optional hard block on unresolved bot findings** — Bugbot fail-on-unresolved ([docs](https://cursor.com/docs/bugbot)); Anthropic Code Review deliberately does *not* block ([blog](https://claude.com/blog/code-review)).
5. **Promote recurring pain into harness** — OpenAI: review comments / bugs → docs or tooling; doc-gardening agent opens fix PRs; tech-debt tracker in-repo ([harness engineering](https://openai.com/index/harness-engineering/)). Cookbook: feedback → evals → Codex handoff ([cookbook](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)).
6. **Anti-rationalization for deferrals** — Osmani skills explicitly rebut “ship it / later” ([Agent Skills](https://addyosmani.com/blog/agent-skills/)).

**What is thin / missing as a published standard**

- Few primary sources document a literal **“every review finding must be Fixed or Filed as Ticket X before merge”** policy with ticket IDs.
- Product bots often leave severity labels (`nit`, `optional`, `judgement`) **without ownership**—Anthropic Code Review and Bugbot both default to advisory unless you add process/gates.
- HumanLayer’s Blake Smith framing: code review’s job is **mental alignment**, not only defect lists ([ace-fca citing Blake Smith](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). That reframes “defer” as a knowledge problem: if nobody owns the follow-up, alignment decays (related: Storey’s **cognitive debt**, amplified by Willison ([cognitive debt linkpost](https://simonwillison.net/2026/Feb/15/cognitive-debt/))).

**Practical synthesis used by serious teams:**  
**Blocking findings → must fix in this PR.**  
**Non-blocking but real → must land as owned debt (ticket/plan/tech-debt tracker) in the same ship ritual.**  
**True nits → may drop, but only after an explicit severity policy—not silent agent “judgement.”**

---

### 6. What doesn’t work (primary sources agree)

| Anti-pattern | Evidence |
| --- | --- |
| Pure prompting / magic prompt | HumanLayer: “no perfect prompt”; engagement required; research can be wrong and must be thrown out ([ace-fca](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). |
| Giant AGENTS.md / CLAUDE.md | OpenAI failed experiment; Anthropic prune guidance; Thoughtworks “instruction bloat” Caution ([links above](#2-context-engineering--agentsmd--claudemd-that-reduce-duplication-and-drift)). |
| More review bots without ownership/gates | Faros-scale data via Osmani: review duration ↑441%, zero-review merges ↑31%—volume overwhelms humans; bots that only comment accelerate the pile ([Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)). Bugbot `neutral` by default ([docs](https://cursor.com/docs/bugbot)). |
| Closed model-only review loops | Osmani: correlated blind spots; human must stay “on the loop” for accountability and unspecified requirements ([Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)). GitHub: human owns merge ([blog](https://github.blog/ai-and-ml/generative-ai/code-review-in-the-age-of-ai-why-developers-will-always-own-the-merge-button/)). |
| Trust green tests blindly | Agents rewrite assertions to match broken behavior ([Osmani](https://addyosmani.com/blog/agentic-code-review/)). |
| Multi-agent orchestration for its own sake | Huntley: multiplexed non-deterministic agents ≈ microservices mess; prefer monolithic Ralph loop ([loop](https://ghuntley.com/loop/)). Horthy: subagents for **context control**, not role-play theater ([ace-fca](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md)). |
| Skipping verification because solo / no users | Osmani: permission to *defer* review depth ≠ permission to skip verification ([Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)). |

---

## What the evidence does NOT support

1. **That more subagent review passes alone close review-debt.** Without fix-or-file ownership, severity taxonomy, and preferably a mechanical gate, findings become unread sensors (Bugbot/Anthropic advisory defaults; Faros volume crisis).
2. **A single industry-standard “fix or file” protocol with ticket IDs.** Closest are: in-loop fix until satisfied (OpenAI/Anthropic), tech-debt trackers + doc-gardening (OpenAI), anti-rationalization skills (Osmani), optional fail-on-unresolved (Bugbot).
3. **That AGENTS.md alone prevents UI/copy duplication.** It helps discovery; consistency needs shared modules + AC pointers + mechanical sensors.
4. **That agent-to-agent review removes human accountability.** Even OpenAI’s extreme agent-first setup keeps humans on prioritization, AC, and outcome validation ([harness engineering](https://openai.com/index/harness-engineering/)).
5. **Vendor F1 / false-positive marketing as transferable.** Measure on *your* codebase; Osmani stresses heterogeneity and local measurement ([Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)). CodeRabbit/Faros numbers are useful but vendor-adjacent—treat effect sizes as directional.
6. **Cognition/Devin first-party process deep-dives** comparable to OpenAI/Anthropic/HumanLayer were not found as primary process essays for this note; Factory’s primary contribution here is AGENTS.md standardization ([Factory news](https://factory.ai/news/agents-md)), not a published review-debt playbook.

---

## Implications for this solo portfolio repo

**Current stack (as of this research):** vault Project → Spec → Ticket (`pro-vault`), `/ship` (resolve ticket → TDD seams → green `bun check`/`lint`/`test` → `/code-review` → commit), two-axis `/code-review` (Standards + Spec in parallel subagents). Intent to add thermos-style audits + Bugbot via subagents.

### What already matches serious practice

- Ticket + Spec as durable intent (HumanLayer / Sean Grove / OpenAI plans-as-artifacts).
- Ship ritual with deterministic checks before review (Thoughtworks feedback sensors; Anthropic verification).
- Two-axis parallel subagent review (Anthropic fresh-context / Writer-Reviewer; Osmani multi-axis).
- Short `AGENTS.md` pointing at `docs/agents/*` (OpenAI TOC pattern; Thoughtworks progressive disclosure).

### Gaps the evidence says will hurt when you add more reviewers

1. **No fix-or-file gate after `/code-review`.** Your Standards axis already labels baseline smells as “always a judgement call.” That is honest—but without a ship-step rule, judgement/non-blocking/defer **is** how review-debt forms. Steal Osmani’s anti-rationalization: *defer without a vault Ticket ID is forbidden*.
2. **More reviewers without triage taxonomy will increase noise.** Anthropic warns unconstrained “find gaps” over-engineers; Bugbot defaults to non-blocking. Before thermos + Bugbot, define severity → action:
   - **Block merge / must fix now:** correctness, Spec miss, security, duplicated shared chrome introduced by this diff.
   - **File ticket before commit:** real Standards/thermos debt outside ticket scope (shared copy, design-system drift).
   - **Drop:** style already covered by oxlint/oxfmt; speculative nits.
3. **Cross-cutting UI/copy needs Spec AC + mechanical seams.** Ticket text for Work/About/Resume/Contact should reference shared Triptych/Dock/copy sources of truth; consider a tiny structural check or Standards rule that flags duplicated chrome strings/components. Docs in `CONTEXT.md` / design docs are necessary but not sufficient.
4. **Wire Bugbot/thermos into `/ship`, not as optional garnish.** Pattern from Anthropic: reviewer returns to implementer → fix → re-review. Pattern from OpenAI: loop until satisfied *or* escalate. Pattern from Bugbot: enable fail-on-unresolved if you use PR checks; for local subagents, require the ship skill to either apply fixes or create vault tickets with IDs in the ship summary.
5. **Keep AGENTS.md thin; put thermos/Bugbot prompts in skills.** Matches Anthropic + Thoughtworks + OpenAI. Do not append full audit rubrics to `AGENTS.md`.
6. **Solo blast-radius dial (Osmani):** you can run lighter human line-reading, but **not** lighter verification. Your green `bun` suite + Spec axis are the load-bearing net; thermos/Bugbot are additional sensors. Prefer **one owned backlog** (vault tech-debt / tickets) over comment archaeology.
7. **Promote recurring findings into harness.** When thermos repeatedly flags the same class (e.g. duplicated dock labels), encode a linter, skill rule, or Spec template checkbox—OpenAI’s “missing capability → put it in the repo” move.

### Suggested minimal ritual addition (research recommendation only — not implemented)

After `/code-review` (+ future thermos/Bugbot):

```text
For each finding: FIX | FILE(<vault ticket>) | DROP(<reason>).
No FIX/FILE → ship skill fails.
Shared UI/copy findings default to FIX if introduced by this diff, else FILE.
```

That single ownership rule is the highest-leverage closing of the loop the primary sources collectively point at, and it fits a vault-ticket solo repo better than enterprise branch-protection theater.

---

## Key sources (primary)

- Dex Horthy / HumanLayer — [Advanced Context Engineering (ace-fca.md)](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md); [12-factor agents](https://github.com/humanlayer/12-factor-agents); [Pragmatic Engineer interview](https://newsletter.pragmaticengineer.com/p/context-engineering-with-dex-horthy)
- Geoffrey Huntley — [everything is a ralph loop](https://ghuntley.com/loop/)
- OpenAI — [Harness engineering](https://openai.com/index/harness-engineering/); [Agent improvement loop cookbook](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)
- Anthropic — [Claude Code best practices](https://code.claude.com/docs/en/best-practices); [Code Review product blog](https://claude.com/blog/code-review); [Code Review docs](https://code.claude.com/docs/en/code-review)
- Cursor — [Bugbot docs](https://cursor.com/docs/bugbot)
- GitHub — [Copilot coding agent](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/); [Own the merge button](https://github.blog/ai-and-ml/generative-ai/code-review-in-the-age-of-ai-why-developers-will-always-own-the-merge-button/)
- Addy Osmani — [Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/); [Agent Skills](https://addyosmani.com/blog/agent-skills/); [Proof over vibes](https://addyosmani.com/blog/code-review-ai)
- Simon Willison — [Writing code is cheap now](https://simonwillison.net/guides/agentic-engineering-patterns/code-is-cheap/); [Cognitive debt](https://simonwillison.net/2026/Feb/15/cognitive-debt/)
- Thoughtworks Technology Radar — [AGENTS.md](https://www.thoughtworks.com/radar/techniques/agents-md); [agent instruction bloat](https://www.thoughtworks.com/radar/techniques/agent-instruction-bloat); [progressive context disclosure](https://www.thoughtworks.com/radar/techniques/progressive-context-disclosure); [feedback sensors](https://www.thoughtworks.com/radar/techniques/feedback-sensors-for-coding-agents); [curated shared instructions](https://www.thoughtworks.com/radar/techniques/curated-shared-instructions-for-software-teams)
- AGENTS.md standard — [agents.md](https://agents.md/); [Factory announcement](https://factory.ai/news/agents-md)
