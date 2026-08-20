# Merge & Improvement Plan — one monorepo, delegated coding

Goal: `sainzs/bit-machine` becomes the single personal monorepo. The standalone
`pi-mini-agent` repo is absorbed as the canonical `packages/pi-mini-agent`.
Fable (the orchestrator) writes **no code directly** — it specifies, delegates,
and verifies. Implementation is done by worker models: Terra, Sol, Luna,
Opus 5, Grok 4.5 (Cursor), and other capable free models.

## Phase 0 — Preconditions (fable, no code)
- Personal identity only: `sainzs` GitHub, personal git email; never the Adobe
  account. Verify `git config user.email` in every repo touched before any commit.
- Confirm working trees clean in `~/Code/bit-machine`, `~/Code/pi-mini-agent`,
  `~/Code/lab/pi-mini-agent` (both clones identical at f855a0e).

## Phase 1 — Reconcile the drift (delegate: one worker, e.g. Sol)
The vendored copy at `packages/pi-mini-agent` has drifted from standalone
f855a0e in 5 files (envelope 4, prompt 6, tools 8, verify 11, runner 17
changed lines — mostly formatting + small logic).
1. Worker produces a per-file diff report classifying each hunk:
   formatting-only vs behavioral.
2. Fable decides direction per behavioral hunk (default: keep the monorepo's
   fixes, since it passed the pre-commit tsgo gate).
3. Worker applies the reconciled version to `packages/pi-mini-agent`,
   runs typecheck + tests. Acceptance: `diff -rq` against the chosen canonical
   tree is empty except intended changes; build green.

## Phase 2 — Import history, then retire the standalone (delegate: Luna or Terra)
1. `git subtree add` (or `git merge --allow-unrelated-histories` after
   `git filter-repo --to-subdirectory-filter packages/pi-mini-agent`) so the
   standalone's history (smoke-test commits etc.) lands in the monorepo.
   Alternative if history isn't valued: keep the vendored copy and skip this.
2. Point `packages/pi-mini-agent` package.json/workspace wiring at the
   monorepo's vendored pi engine; remove duplicate peer-dep pins.
3. Archive `sainzs/pi-mini-agent` on GitHub with a README pointer to the
   monorepo path. Delete `~/Code/lab/pi-mini-agent` clone; keep
   `~/Code/pi-mini-agent` only until Phase 4 verification passes.

## Phase 3 — Integrate the two layers (delegate: Opus 5 or Grok 4.5 for design-heavy work)
The complementary pair, wired together:
- **bit-machine-harness** ("what survives every session"): before_agent_start
  memory injection + `remember` tool + JSON store at `~/.bitmachine`.
- **pi-mini-agent** ("bounded disposable leaves"): budgeted sub-runs with
  acceptance predicates, write-set leases, verification contracts.
Improvements, one worker task each:
1. Leaf outcomes → harness: on verified leaf completion, optionally emit a
   `remember` entry (task, verdict, cost) so lessons persist.
2. Harness → leaves: inject relevant standing memory into the leaf's context
   pack (bounded, budgeted — leaves stay disposable).
3. Shared telemetry: leaves report budget/ledger events through
   `packages/telemetry`.
4. Evals: add a `packages/evals` scenario exercising a full
   harness→leaf→remember round trip.

## Phase 4 — Verification gate (fable, no trust in self-reports)
- Every worker deliverable is verified independently: typecheck, tests,
  a live contract smoke on a cheap model, and `git diff` review by fable.
- Acceptance predicates written by fable *before* delegating each task.
- Monorepo CI: pre-commit tsgo gate stays mandatory.

## Delegation doctrine
- Fable: specs, acceptance predicates, hunk-level merge decisions, review.
- Terra/Sol/Luna: mechanical + medium tasks (drift reconcile, wiring, subtree).
- Opus 5 / Grok 4.5: design-heavy integration (Phase 3) and gnarly merges.
- Free models: diff classification, report generation, test scaffolding.
- One task = one worker = one bounded leaf run with a lease on its write-set.


## Model routing table — quality vs price (evidence: research/deepswe.md, tbench.md, frontierbench.md, 2026-08-08)

Benchmarks used: DeepSWE v1.1 (113 contamination-free long-horizon SWE tasks, pass@1, $/task),
Terminal-Bench 2.1 (89 CLI tasks, accuracy, $/run), Terminal-Bench 3.0 (= frontierbench.ai,
74 extreme long-horizon tasks). TB3.0 and frontierbench are the SAME benchmark (rebrand) — deduped.

| Tier | Route to | Evidence | Use for |
|---|---|---|---|
| Free workhorse | deepseek-v4-flash-free (max effort) | DeepSWE 53% @ $0.10/task | diff classification, report gen, test scaffolding, research fan-out, mechanical edits. DEFAULT for anything bounded + verifiable. |
| Cheap near-frontier | gpt-5.6-luna via azure/ (max effort) | DeepSWE 67.2% @ $0.61/task; best $/pt on TB3.0 Pareto (~$46/pt) | Phase 1–2 work: drift reconcile, wiring, subtree surgery, medium implementation. Best cost/quality ratio overall. |
| Cheap frontier alt | grok-4.5 (Cursor CLI pairing) | TB2.1 79.3% @ $134/run — best $/pt (~$0.59) on TB2.1 | terminal/ops-heavy tasks; long CLI sessions. |
| Frontier value | gpt-5.6-sol / gpt-5.6-terra | DeepSWE sol 72.7% @ $8.39; TB3.0 sol #2 34.6%, terra ~$46/pt | design-heavy tasks where luna's output needs a step up but opus is overkill. |
| Max quality | claude-opus-5 (HIGH effort, not max) | DeepSWE 72.8% @ $6.08 vs 73.6% @ $11.84 at max — pay half for -0.8pt | Phase 3 integration design, gnarly merges, final reviews. Never use max effort. |
| Avoid | sonnet-5, GLM-5.x, gemini-flash-lite | TB3.0 $544/pt and $820/pt; flash-lite fails silently as subagent | — |

Routing rules:
1. Default every leaf to deepseek-v4-flash-free; escalate one tier only when verification fails.
2. Effort sweet spots: deepseek max, luna max, opus HIGH (max effort on opus is ~2x cost for <1pt).
3. Verified provider routes (live smoke-tested 2026-08-08; all others fail silently with one empty
   assistant message): PASS = deepseek/deepseek-v4-flash (direct key), opencode/deepseek-v4-flash-free,
   zai-coding-cn/glm-5.2 (flat-rate plan), opencode/mimo-v2.5-free, azure/gpt-5.6-luna, anthropic/* .
   FAIL = opencode-go/* (incl. deepseek-v4-flash), zai-coding-cn/glm-5.2-highspeed, kimi-coding/*,
   opencode/kimi-k3, opencode/grok-4.5, github-copilot/grok-4.5, opencode/minimax-m3,
   opencode/gpt-5.6-luna, github-copilot/gpt-5.6-luna, opencode/gemini-3.5-flash-lite.
   Policy: opencode-go is deepseek-v4-flash-exclusive if/when it recovers; grok-4.5 only via Cursor CLI
   externally, not as a prime-agent subagent. Flat-rate plans (zai GLM 5.2) count as free-tier workhorses.
4. Fable never codes: it specs, routes per this table, and verifies with acceptance predicates.
5. Cheap models + tight verification beats expensive models unverified: the 80–84% TB2.1 frontier
   is reachable at $135–$440; the top slot costs $553–$2,059 for ~4.5pt more.


## Plans vs. what's already owned (cross-ref: research/plans.md + research/local-inventory.md, 2026-08-08)

Owned & working in prime-agent: DeepSeek direct API (cheapest raw tokens: $0.14/$0.28 per 1M, cache-hit $0.0028),
Z.ai GLM coding plan (glm-5.2 route PASS), MiMo free, azure Luna, Anthropic OAuth, ChatGPT Pro/Codex.
Owned but broken as subagent routes: opencode-go (incl. its 2x deepseek limits), kimi-coding plan, cursor grok,
minimax — paid capacity prime-agent currently can't exercise; fix routes before buying anything new.
Not owned, maybe worth adding: QwenCloud Token Plan Lite ($6/mo, qwen3.8-max+glm-5.2+deepseek, night 50% off) as
cheap fleet overflow; OpenCode Zen PAYG top-up for zero-markup frontier access; Prime Intellect PAYG (one key, 115 models).
Not worth it: Cohere ("Command Code" doesn't exist — PAYG only), extra Copilot tiers (credits model, $0.01/credit).
Fleet economics anchor: DeepSeek direct remains the default leaf engine; flat-rate GLM 5.2 second; escalate per routing table.
