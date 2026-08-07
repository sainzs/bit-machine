# Bit Machine

> *entries made after dark, in a hand not entirely my own*

A personal coding agent by Santiago Sainz. The name is not explained.

Grown from a fork of [earendil-works/pi](https://github.com/earendil-works/pi)
(badlogic's pi-mono). Upstream stays pullable (`git fetch upstream`); Bit Machine's
own organs live in new packages and never patch upstream files — the
vendored-engine posture, not the fork treadmill.

## The thesis

An agent is three layers, and only one of them compounds:

| Layer | What | Here |
|---|---|---|
| **Runtime** | session loop, tools, providers, TUI | `packages/coding-agent` et al — vendored upstream, unmodified |
| **Leaves** | bounded, budgeted, VERIFIED sub-runs | `packages/pi-mini-agent` — acceptance predicates, write-set leases, binding-error classification, routing rows |
| **Harness** | what survives every session | `packages/bit-machine-harness` — standing memory, injected per-turn, persisted forever |

Runtimes are replaceable. Leaves are disposable by design. Only the harness's
ledger grows more valuable with use. Bit Machine invests there.

## Doctrine (each line earned from an incident, 2026-08)

1. **A sub-run's self-report is a verification request, not a result.** The
   harness runs the acceptance predicate; git observation computes the file
   list; the model's claim is decorative. (`packages/pi-mini-agent/README.md`
   for receipts: silent zero-work "completed" waves, fabricated file lists
   across three model families.)
2. **Budgets are physics.** Steps, dollars, wall-clock, tree-wide — checked
   pre-spend, never post-hoc.
3. **Ground truth lives at the root; leaves stay dumb.** No middle managers,
   no leaf verifies itself, no self-spawning without an explicit sub-budget.
4. **Memory must be auditable or it drifts into fiction.** The store is a
   human-editable JSON file, hard-capped at injection (~2k tokens),
   dropped-with-disclosure on overflow.
5. **Measure, don't assume.** Every load-bearing claim in this repo cites a
   measurement or an incident.

## Status

- `packages/pi-mini-agent` — working; 34/34 tests + 3 live smokes (also
  developed standalone at `sainzs/pi-mini-agent`; imported here by subtree).
- `packages/bit-machine-harness` — v0: standing memory, two scopes (`~/.bit-machine`
  global, `<repo>/.bit-machine` project), `remember` tool, per-turn injection.
  9/9 tests; live cross-session round-trip proven.

## Roadmap (one small package, one contract each)

- **Bit Machine-refine** — evidence-gated memory refinement at session end.
- **Bit Machine-routing** — read `mini`'s `audit.ndjson` back into model selection:
  which model passes which task class at what price, as data.
- **Bit Machine-skills** — reusable procedures with explicit call contracts.
- **upstream cadence** — periodic `git fetch upstream && merge`, gated on the
  full test matrix.

## Install

```bash
pi install ./packages/pi-mini-agent    # the verified leaf runtime (tool: mini)
pi install ./packages/bit-machine-harness   # standing memory (tool: remember)
```

This is a personal project, developed on personal accounts and personal time.
Upstream's original README: [README.upstream.md](README.upstream.md).
