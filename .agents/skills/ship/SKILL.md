---
name: ship
description: "Ship a Spec or Issue to a committed branch in this portfolio repo."
disable-model-invocation: true
---

Ship the work described by the user in the Spec or Issue.

Resolve the ticket per `docs/agents/issue-tracker.md`. Follow `AGENTS.md`.

Use /tdd where possible, at pre-agreed seams.

Run `bun check` regularly and single test files regularly. Before review, `bun check`, `bun lint`, and `bun run test` are all green.

Once done, use /code-review to review the work.

Commit your work to the current branch.
