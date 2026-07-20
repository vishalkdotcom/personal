---
name: ship
description: "Ship a Spec or Ticket to a committed branch in this portfolio repo."
disable-model-invocation: true
---

Ship the work described by the user in the Spec or Ticket.

## Steps

1. **Resolve the Ticket** — Load it via `docs/agents/issue-tracker.md` and `pro-vault`. Follow `AGENTS.md`.  
   **Done when:** Ticket body, acceptance criteria, parent Spec constraints, and blockers are in hand.

2. **Implement** — Build only what the Ticket asks. Use `/tdd` where seams were pre-agreed.  
   **Done when:** Every acceptance criterion is addressed in the working tree (or explicitly blocked on a scope-wall answer).

3. **Quality green** — Run `bun check`, `bun lint`, and `bun run test` until all exit 0. Re-run single test files during the work as needed.  
   **Done when:** Those three commands are green on the final tree.

4. **Load the Ship Review Gate** — Read [`REVIEW-GATE.md`](REVIEW-GATE.md) in full. Apply it for the rest of this ship.  
   **Done when:** You can state the mandatory battery count, severity classes, fix-in-loop rule, and scope-wall rule from that file without guessing.

5. **Run the review battery** — Execute every mandatory pass listed in `REVIEW-GATE.md` against the **uncommitted** ship diff (`git diff HEAD` / `Diff: uncommitted changes` as that file specifies).  
   **Done when:** Each mandatory pass has returned (findings or an explicit clean result).

6. **Classify and fix-in-loop** — Classify findings per `REVIEW-GATE.md`. Clear every **hard** and **judgement** finding in this session. On a **scope wall**, stop and ask the human; do not commit until they choose.  
   **Done when:** No hard or judgement finding remains open, or the human has answered a scope wall and the tree matches that answer.

7. **Commit** — Commit on the current branch (user’s commit rules).  
   **Done when:** The ship commit exists on the branch.

8. **Close the Ticket** — Check off acceptance criteria; set Ticket `status` to `done`.  
   **Done when:** Vault Ticket shows `done` with ACs checked.
