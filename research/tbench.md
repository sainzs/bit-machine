# Terminal-Bench — tbench.ai research notes
> **Source:** https://www.tbench.ai/ fetched directly with httpx (no websearch; Serper is not configured here). Data was extracted from the Next.js flight payloads embedded in each page's HTML — TBench exposes no public JSON API (`/api/*` → 404); the leaderboard is backed by the Harbor Hub UI (hub.harborframework.com). Captured during this session.
>
> **Scope:** the official default leaderboard (**Terminal-Bench 2.1**) is the focus; the same site also runs legacy live boards for **TB 2.0** and **TB 1.0** and links out to the **TB 3.0** board at frontierbench.ai. All are covered below.
## 1. What the benchmark measures
- **Terminal-Bench** is a collection of **Harbor-native benchmarks** (harborframework.com) for **terminal agents** — AI agents that complete tasks by working in a terminal/shell. Site tagline: *"benchmarks for AI agents in terminal environments"*, goal *"quantify their agents' terminal mastery"*.
- Tasks are **real-world, terminal-driven tasks** across software engineering, machine learning, security, data science, system administration, and similar domains. Each task runs inside a **containerized (Docker) sandbox with deterministic, programmatic verification** of the resulting state/output.
- Versions published on the site (from `/benchmarks` and `/leaderboard`):
  - **Terminal-Bench 1.0** — the original; 80 tasks testing agents' ability to complete tasks using a terminal (legacy board, 62 published result rows).
  - **Terminal-Bench 2.0** — 89 high-quality tasks across software engineering, ML, security, data science, and more (live board, 142 result rows).
  - **Terminal-Bench 2.1** — an improved version of 2.0, inspired by Z.ai's *Terminal-Bench 2.0 Verified*; **the default/official leaderboard** (17 verified rows).
  - **Terminal-Bench 3.0** — *"shipped"*; hosted at frontierbench.ai: *"A benchmark to measure and evolve with the frontier of agent work"*; scored as **resolution rate** on long-horizon frontier agent tasks (9 rows).
  - **Terminal-Bench Challenges** — long-horizon single-task benchmarks (Rust compiler speedup, inference-engine code golf, WASM WebGL renderer); leaderboards *"coming soon"*. Each challenge is a concise project description + extensive test bed; the agent must complete the project autonomously end-to-end with **no time or resource limits**, graded on a task-specific metric (correctness and/or performance).
  - **Terminal-Bench Science** — in progress; domain-specific benchmark for scientific computing workflows in terminal environments (natural sciences).
## 2. Methodology (Terminal-Bench 2.1 official board)
- **How a run works:** Harbor CLI — `harbor run -d terminal-bench/terminal-bench-2-1 -a <agent> -m <model> -k 5` (or `--agent-import-path path.to.agent:SomeAgent` for a custom agent). Requires Docker; cloud sandboxes (e.g. Daytona via `--env`) are supported for scale. `-k` = attempts/trials per task.
- **Primary metric:** solved-task **accuracy (%)** — fraction of tasks the agent completes successfully, judged by automated verification in the container, reported with **standard error** (`accuracy_stderr`).
- **Companion metrics (published per entry):** `pass_at_2`…`pass_at_5` (probability of solving within up-to-k repeated attempts), `n_trials`, `reward_hacks` (percent of trials disqualified for reward hacking, 0–100), token usage (`cached_input_tokens`, `uncached_input_tokens`, `output_tokens`), `avg_trial_duration_sec`, `total_cost_usd`.
- **Run size:** official entries list **n_trials = 445 ≈ 89 tasks × k=5** (one entry: 447). Board note: *"submissions may not modify timeouts or resources"*.
- **Verification & governance:** *"A Terminal-Bench team member ran the evaluation and verified the results."* Entries are submitted as PRs to the `harbor-framework/terminal-bench-2-1` repo (each row links its PR).
- **Ranking:** by `metrics.accuracy` descending.
## 3. Full leaderboard — Terminal-Bench 2.1 (17 rows, verified)
Table format: **model | score | cost/price | notes**. Agent, effort, pass@k, reward-hack %, and date are in Notes (the site reports agent+model pairs). Accuracy = % of tasks solved ± standard error over 445 trials.
| # | Model | Score (acc ± se) | Cost (run, USD) | Notes |
|---|-------|------------------|-----------------|-------|
| 1 | **Fable 5** | 83.82% ± 1.16 | $552.67 | Claude Code (date 2026-06-07, effort=xhigh); pass@2 0.8978 / pass@5 0.9326; reward-hack disqualified 0.22% of trials; PR #75 |
| 2 | **GPT-5.5** | 83.15% ± 1.13 | $2,059.19 | Codex (date 2026-05-01, effort=xhigh); pass@2 0.8888 / pass@5 0.9438; reward-hack disqualified 0.22% of trials; PR #45 |
| 3 | **Fable 5** | 80.45% ± 1.16 | $438.64 | Terminus 2 (date 2026-06-05, effort=high); pass@2 0.8640 / pass@5 0.9213; reward-hack disqualified 0.00% of trials; PR #78 |
| 4 | **Grok 4.5** | 79.33% ± 1.46 | $134.09 | Cursor CLI (date 2026-07-09, effort=high); pass@2 0.8888 / pass@5 0.9551; reward-hack disqualified 8.99% of trials; PR #86 |
| 5 | **Opus 4.8** | 78.88% ± 1.31 | $286.94 | Claude Code (date 2026-07-09, effort=high); pass@2 0.8652 / pass@5 0.9438; reward-hack disqualified 0.00% of trials; PR #92 |
| 6 | **GPT-5.6 Terra** | 78.43% ± 1.25 | $421.15 | Codex (date 2026-07-11, effort=max); pass@2 0.8539 / pass@5 0.8989; reward-hack disqualified 0.22% of trials; PR #115 |
| 7 | **GPT-5.5** | 77.98% ± 1.22 | $493.85 | Terminus 2 (date 2026-05-01, effort=xhigh); pass@2 0.8461 / pass@5 0.8764; reward-hack disqualified 0.22% of trials; PR #47 |
| 8 | **Muse Spark 1.1** | 76.18% ± 1.23 | $198.05 | mini-SWE-agent (date 2026-07-09, effort=xhigh); pass@2 0.8292 / pass@5 0.9101; reward-hack disqualified 0.00% of trials; PR #94 |
| 9 | **GPT-5.6 Luna** | 75.73% ± 1.32 | $241.45 | Codex (date 2026-07-11, effort=max); pass@2 0.8348 / pass@5 0.8876; reward-hack disqualified 0.90% of trials; PR #112 |
| 10 | **Sonnet 5** | 74.61% ± 1.64 | $288.18 | Claude Code (date 2026-07-09, effort=high); pass@2 0.8652 / pass@5 0.9213; reward-hack disqualified 0.67% of trials; PR #98 |
| 11 | **Gemini 3 Pro** | 73.93% ± 1.29 | $224.44 | Terminus 2 (date 2026-05-01, effort=high); pass@2 0.8135 / pass@5 0.8764; reward-hack disqualified 0.45% of trials; PR #48 |
| 12 | **Opus 4.7** | 68.90% ± 1.41 | $599.52 | Claude Code (date 2026-05-01, effort=max); pass@2 0.7801 / pass@5 0.8408; reward-hack disqualified 0.45% of trials; PR #44 |
| 13 | **Opus 4.7** | 66.07% ± 1.37 | $582.26 | Terminus 2 (date 2026-05-01, effort=max); pass@2 0.7438 / pass@5 0.8315; reward-hack disqualified 0.00% of trials; PR #46 |
| 14 | **Gemini 3 Pro** | 65.84% ± 1.38 | $247.76 | Gemini CLI (date 2026-05-01, effort=high); pass@2 0.7427 / pass@5 0.8202; reward-hack disqualified 0.45% of trials; PR #66 |
| 14 | **Gemini 3.1 Pro** | 65.84% ± 1.67 | $236.49 | Gemini CLI (date 2026-05-05, effort=high); pass@2 0.7820 / pass@5 0.8764; reward-hack disqualified 0.22% of trials; PR #68 |
| 16 | **Gemini 3.1 Pro** | 65.62% ± 1.65 | $229.99 | Terminus 2 (date 2026-05-05, effort=high); pass@2 0.7775 / pass@5 0.8652; reward-hack disqualified 0.45% of trials; PR #69 |
| 17 | **GLM-5.1** | 58.65% ± 1.24 | $277.14 | Claude Code (date 2026-05-01, effort=max); pass@2 0.6551 / pass@5 0.7303; reward-hack disqualified 0.00% of trials; PR #67 |
> Tie at #14: Gemini CLI + Gemini 3 Pro and Gemini CLI + Gemini 3.1 Pro both 65.84%.
### 3.1 Cost column — cheap/free standings (TB 2.1)
- **No free entries.** Every run has a nonzero `total_cost_usd` (API cost of the underlying model+agent run). The site publishes per-run totals only — no list-price tables.
- **Cheapest runs (best score per $):**
  - **Cursor CLI + Grok 4.5 (high) — 79.33% at $134.09** (#4): cheapest run on the board and best accuracy-per-dollar (≈0.59 pt/$). Its 8.99% reward-hack rate is the board's highest.
  - **mini-SWE-agent + Muse Spark 1.1 (xhigh) — 76.18% at $198.05** (#8): cheapest near-frontier run; 0% reward-hack disqualifications.
  - **Terminus 2 + Gemini 3 Pro (high) — 73.93% at $224.44** (#11); **Terminus 2 + Gemini 3.1 Pro — 65.62% at $229.99** (#16); **Gemini CLI + Gemini 3.1 Pro — 65.84% at $236.49** (#14); **Gemini CLI + Gemini 3 Pro — 65.84% at $247.76** (#14).
  - **Codex + GPT-5.6 Luna (max) — 75.73% at $241.45** (#9).
  - **Claude Code + Opus 4.8 (high) — 78.88% at $286.94** (#5): third-highest score at roughly half the top-2's cost.
- **Most expensive:** Codex + GPT-5.5 (xhigh) — 83.15% at **$2,059.19** (#2); next Claude Code + Opus 4.7 $599.52 (#12), Terminus 2 + Opus 4.7 $582.26 (#13), Claude Code + Fable 5 $552.67 (#1).
- **Takeaway:** the frontier is 80–84%; the same neighborhood is reachable for ~$135–$440 via cheaper pairs (Cursor CLI/Grok-4.5, mini-SWE-agent/Muse Spark-1.1, Terminus 2/Gemini-3, Codex/GPT-5.6-lower-effort). The cheapest entry lands mid-leaderboard within ~4.5 pts of #1.

## 4. Terminal-Bench 3.0 — resolution-rate leaderboard (frontierbench.ai, linked from tbench.ai)

TB3.0's board lives at https://www.frontierbench.ai/ (*"A benchmark to measure and evolve with the frontier of agent work"*, formerly Frontier-Bench). It ranks **agent+model pairs by resolution rate** on long-horizon TB 3.0 tasks and publishes cost + token usage. Sorted by rank:

| # | Agent | Model | Effort | Resolution rate (acc ± se) | Cost (run, USD) | Total tokens |
|---|-------|-------|--------|---------------------------|-----------------|--------------|
| 1 | mini-SWE-agent | **Opus 5** | max | 43.53% ± 1.65 | $5,973.57 | 7,280,891,794 |
| 2 | Codex | **GPT-5.6 Sol** | max | 34.59% ± 1.58 | $3,963.86 | 5,779,656,478 |
| 3 | Claude Code | **Fable 5** | max | 34.05% ± 1.71 | $7,062.39 | 3,583,230,945 |
| 4 | Claude Code | **Opus 4.8** | max | 21.08% ± 1.55 | $5,701.74 | 5,208,776,503 |
| 5 | Codex | **GPT-5.6 Terra** | max | 20.81% ± 1.40 | $2,484.52 | 7,024,607,919 |
| 6 | Cursor CLI | **Grok 4.5** | xhigh | 15.68% ± 1.47 | $960.04 | 1,238,993,118 |
| 7 | Claude Code | **Sonnet 5** | max | 14.59% ± 1.50 | $7,944.04 | 17,948,790,860 |
| 8 | Codex | **GPT-5.6 Luna** | max | 14.32% ± 1.25 | $1,632.44 | 11,872,804,231 |
| 9 | Claude Code | **GLM 5.2** | max | 4.59% ± 0.97 | $3,766.50 | 3,276,045,131 |

> Scope note: TB3.0 is a **long-horizon frontier** benchmark where single runs cost $0.9k–$8k and multi-billion-token runs are normal — a different regime from the 445-trial TB2.1 board above. Its cheapest entry (Cursor CLI + Grok 4.5, $960) is also the only non-max-effort run; mini-SWE-agent + Opus 5 currently tops it at 43.53%.

## 5. Full legacy leaderboards on tbench.ai (for completeness)

These boards publish accuracy ± stderr per agent+model submission (agent+model pairs, no reasoning-effort/cost/pass@k columns). A "verified" flag marks entries a Terminal-Bench team member validated. Full row lists follow.

### 5.1 Terminal-Bench 2.0 — 142 rows (live)

| Agent | Model | Accuracy ± se | Date | Verified |
|-------|-------|---------------|------|----------|
| NexAU-AHE (nexau) | GPT-5.5 | 84.72% ± 1.07 | 2026-05-14 |  |
| LemonHarness (Lemoncode-agent) | Gemini 3.1 Pro Preview, GPT-5.3-Codex | 84.49% ± 1.31 | 2026-05-14 |  |
| Capy (capy-build) | GPT-5.5 | 83.15% ± 1.08 | 2026-05-14 |  |
| Codex CLI (codex) | GPT-5.5 | 82.25% ± 1.13 | 2026-04-23 | yes |
| Polaris (polaris) | Claude Opus 4.7, Gemini 3.1 Pro Preview, GPT-5.5 | 82.19% ± 1.42 | 2026-05-14 |  |
| WOZCODE (claude-wozcode-plugin) | Claude Opus 4.7 | 80.22% ± 1.08 | 2026-05-14 |  |
| TongAgents (judy) | Gemini 3.1 Pro | 80.22% ± 1.34 | 2026-03-13 |  |
| LemonHarness (Lemoncode-agent) | Gemini 3.1 Pro Preview, GPT-5.3 Codex | 79.93% ± 1.55 | 2026-05-14 |  |
| SageAgent (sage) | GPT-5.3-Codex | 78.43% ± 1.12 | 2026-03-13 |  |
| Droid (Factory Droid) | GPT-5.3-Codex | 77.3% ± 1.1 | 2026-02-24 |  |
| Meta-Harness (terminus-kira-env-bootstrap) | Claude Opus 4.6 | 76.4% ± 1.24 | 2026-05-14 |  |
| CodeBrain-1.5 (ruley) | GPT-5.3-Codex | 75.84% ± 1.04 | 2026-02-10 |  |
| Codelia (codelia) | GPT-5.3-Codex | 75.73% ± 1.1 | 2026-05-14 |  |
| Capy (capy-build) | Claude Opus 4.6 | 75.28% ± 1.22 | 2026-03-12 |  |
| Simple Codex (simple_codex) | GPT-5.3-Codex | 75.06% ± 1.22 | 2026-02-06 | yes |
| Terminus-KIRA (terminus-3-3) | Gemini 3.1 Pro | 74.83% ± 1.31 | 2026-02-23 |  |
| Terminus-KIRA (terminus-3-3) | Claude Opus 4.6 | 74.72% ± 1.32 | 2026-02-22 |  |
| Mux (mux) | GPT-5.3-Codex | 74.61% ± 1.28 | 2026-03-06 |  |
| MAYA-V2 (final) | Claude 4.6 Opus | 72.08% ± 1.13 | 2026-03-12 |  |
| TongAgents (judy) | Claude Opus 4.6 | 71.91% ± 1.37 | 2026-02-22 |  |
| spoox-o-m (spoox-m) | GPT-5.3-Codex | 71.46% ± 1.27 | 2026-05-15 |  |
| Junie CLI (Junie) | Claude Opus 4.6, Gemini 3 Flash, Gemini 3.1 Pro, GPT-5.3-Codex | 71.01% ± 1.46 | 2026-03-07 |  |
| Droid (Factory Droid) | Claude Opus 4.6 | 69.89% ± 1.26 | 2026-02-05 |  |
| Ante (ante) | Gemini 3 Pro | 69.43% ± 1.07 | 2026-01-06 | yes |
| IndusAGI Coding Agent (IndusAGICodingAgent) | GPT-5.3-Codex | 69.14% ± 1.16 | 2026-03-18 |  |
| Crux (claude-code-enhanced) | Claude Opus 4.6 | 66.87% ± nan | 2026-02-23 |  |
| Deep Agents (deepagent-harbor) | GPT-5.2-Codex | 66.52% ± 1.56 | 2026-02-12 |  |
| Mux (mux) | Claude Opus 4.6 | 66.52% ± 1.29 | 2026-02-13 |  |
| clnkr (clnkr) | GPT-5.5 | 66.07% ± 1.27 | 2026-05-14 |  |
| SageAgent (sage) | Gemini 3 Pro | 65.17% ± 1.05 | 2026-02-23 |  |
| Droid (Factory Droid) | GPT-5.2 | 64.94% ± 1.41 | 2025-12-24 |  |
| Terminus 2 (terminus-2) | GPT-5.3-Codex | 64.72% ± 1.39 | 2026-02-05 | yes |
| Junie CLI (Junie) | Gemini 3 Flash | 64.27% ± 1.42 | 2025-12-23 |  |
| Droid (Factory Droid) | Claude Opus 4.5 | 63.15% ± 1.38 | 2025-12-11 |  |
| Terminus 2 (terminus-2) | Claude Opus 4.6 | 62.92% ± 1.36 | 2026-02-06 | yes |
| Codex CLI (codex) | GPT-5.2 | 62.92% ± 1.53 | 2025-12-18 | yes |
| CodeBrain-1.5 (ruley) | Gemini 3 Pro | 62.25% ± 1.33 | 2026-02-05 |  |
| II-Agent (ii-agent-simple) | Gemini 3 Pro | 61.8% ± 1.44 | 2025-12-23 |  |
| hookele (hookele) | GPT-5.1-Codex-Mini | 61.57% ± 0.97 | 2026-05-14 |  |
| Gemini CLI (gemini-cli) | Gemini 3.1 Pro | 61.42% ± 2.1 | 2026-05-14 |  |
| Warp (warp) | Claude Haiku 4.5, GPT-5.2 | 61.24% ± 1.54 | 2025-12-12 |  |
| Droid (Factory Droid) | Gemini 3 Pro | 61.12% ± 1.42 | 2025-12-24 |  |
| Mux (mux) | GPT-5.2 | 60.67% ± nan | 2026-01-17 |  |
| Codex CLI (codex) | GPT-5.1-Codex-Max | 60.45% ± 1.36 | 2025-11-24 | yes |
| Gemini CLI (gemini-cli) | Gemini 3.1 Pro | 59.36% ± 2.14 | 2026-05-14 |  |
| Letta Code (letta-code) | Claude Opus 4.5 | 59.1% ± 1.23 | 2025-12-17 |  |
| Warp (warp) | Claude Haiku 4.5, Gemini 3 Pro, GPT-5-Nano | 59.1% ± 1.4 | 2025-11-20 |  |
| Abacus AI Desktop (AbacusAI) | Claude Haiku 4.5, Gemini 3 Pro | 58.43% ± 1.4 | 2025-12-11 |  |
| Mux (mux) | Claude Opus 4.5 | 58.43% ± nan | 2026-01-17 |  |
| Claude Code (claude-code) | Claude Opus 4.6 | 57.98% ± 1.48 | 2026-02-07 | yes |
| Crux (codex) | GPT-5.1-Codex | 57.75% ± 1.5 | 2025-11-16 | yes |
| Terminus 2 (terminus-2) | Claude Opus 4.5 | 57.75% ± 1.29 | 2025-11-22 | yes |
| Grok CLI (grok-cli) | Grok 4.20 Reasoning | 57.3% ± nan | 2026-04-02 |  |
| Terminus 2 (terminus-2) | Gemini 3 Pro | 56.85% ± 1.26 | 2025-11-21 | yes |
| Letta Code (letta-code) | Gemini 3 Pro | 55.96% ± 1.52 | 2025-12-17 |  |
| Goose (goose) | Claude Opus 4.5 | 54.33% ± 1.34 | 2025-12-11 |  |
| Terminus 2 (terminus-2) | GPT-5.2 | 54.04% ± 1.48 | 2025-12-12 | yes |
| Letta Code (letta-code) | GPT-5.1-Codex | 53.48% ± 1.45 | 2025-12-17 |  |
| Simplai Agent (terminal-agent) | Claude Sonnet 4.6 | 53.43% ± 1.44 | 2026-05-14 |  |
| Terminus 2 (terminus-2) | GLM 5 | 52.42% ± 1.34 | 2026-02-23 |  |
| Claude Code (claude-code) | Claude Opus 4.5 | 52.13% ± 1.29 | 2025-12-18 | yes |
| OpenHands (openhands) | Claude Opus 4.5 | 51.91% ± 1.47 | 2026-01-04 | yes |
| OpenCode (opencode) | Claude Opus 4.5 | 51.69% ± nan | 2026-01-12 |  |
| Terminus 2 (terminus-2) | Gemini 3 Flash | 51.69% ± 1.6 | 2026-01-07 | yes |
| Warp (warp) | Claude Haiku 4.5, Claude Sonnet 4.5, GPT-5-Nano | 50.11% ± 1.36 | 2025-11-11 |  |
| Codex CLI (codex) | GPT-5 | 49.61% ± 1.48 | 2025-11-04 | yes |
| Terminus 2 (terminus-2) | GPT-5.1 | 47.58% ± 1.41 | 2025-11-16 | yes |
| Gemini CLI (gemini-cli) | Gemini 3 Flash | 47.42% ± 1.55 | 2026-03-06 |  |
| CAMEL-AI (TerminalBenchAgent) | Claude Sonnet 4.5 | 46.52% ± 1.2 | 2025-12-24 |  |
| IndusAGI Coding Agent (IndusAGICodingAgent) | MiniMax M2.7 | 45.06% ± nan | 2026-05-14 |  |
| Codex CLI (codex) | GPT-5-Codex | 44.33% ± 1.38 | 2025-11-04 | yes |
| OpenHands (openhands) | GPT-5 | 43.82% ± 1.52 | 2025-11-02 | yes |
| Terminus 2 (terminus-2) | GPT-5-Codex | 43.43% ± 1.47 | 2025-10-31 | yes |
| Terminus 2 (terminus-2) | Kimi K2.5 | 43.2% ± 1.47 | 2026-02-04 | yes |
| Goose (goose) | Claude Sonnet 4.5 | 43.15% ± 1.32 | 2025-12-11 |  |
| Crux (codex) | GPT-5.1-Codex-Mini | 43.15% ± 1.53 | 2025-11-17 | yes |
| Harness Agent (harness-agent) | MiniMax M2.7 Highspeed | 42.92% ± 1.5 | 2026-05-14 |  |
| Terminus 2 (terminus-2) | Claude Sonnet 4.5 | 42.81% ± 1.42 | 2025-10-31 | yes |
| MAYA-V2 (final) | Claude 4.5 Sonnet | 42.7% ± nan | 2026-01-04 |  |
| cchuter (cchuter) | minimax-m2.5 | 42.7% ± 1.44 | 2026-03-30 |  |
| OpenHands (openhands) | Claude Sonnet 4.5 | 42.58% ± 1.41 | 2025-11-02 | yes |
| Mini-SWE-Agent (mini-swe-agent) | Claude Sonnet 4.5 | 42.53% ± 1.43 | 2025-11-03 | yes |
| Terminus 2 (terminus-2) | Minimax m2.5 | 42.25% ± 1.34 | 2026-02-23 |  |
| Mini-SWE-Agent (mini-swe-agent) | GPT-5-Codex | 41.35% ± 1.41 | 2025-11-03 | yes |
| Claude Code (claude-code) | Claude Sonnet 4.5 | 40.06% ± 1.49 | 2025-11-04 | yes |
| Terminus 2 (terminus-2) | DeepSeek-V3.2 | 39.55% ± 1.4 | 2026-02-10 |  |
| Terminus 2 (terminus-2) | Claude Opus 4.1 | 37.98% ± 1.34 | 2025-10-31 | yes |
| OpenHands (openhands) | Claude Opus 4.1 | 36.85% ± 1.38 | 2025-11-02 | yes |
| Terminus 2 (terminus-2) | GPT-5.1-Codex | 36.85% ± 1.65 | 2025-11-17 | yes |
| Crux (claude-code) | MiniMax M2.1 | 36.63% ± 1.47 | 2025-12-22 | yes |
| Terminus 2 (terminus-2) | Kimi K2 Thinking | 35.73% ± 1.44 | 2025-11-11 | yes |
| Goose (goose) | Claude Haiku 4.5 | 35.51% ± 1.47 | 2025-12-11 |  |
| Terminus 2 (terminus-2) | GPT-5 | 35.17% ± 1.56 | 2025-10-31 | yes |
| Mini-SWE-Agent (mini-swe-agent) | Claude Opus 4.1 | 35.06% ± 1.28 | 2025-11-03 | yes |
| Claude Code (claude-code) | Claude Opus 4.1 | 34.83% ± 1.48 | 2025-11-04 | yes |
| spoox-o-m (spoox-m) | GPT-5-Mini | 34.83% ± 1.39 | 2025-12-24 |  |
| Mini-SWE-Agent (mini-swe-agent) | GPT-5 | 33.93% ± 1.48 | 2025-11-03 | yes |
| Terminus 2 (terminus-2) | GLM 4.7 | 33.39% ± 1.45 | 2026-01-28 | yes |
| Crux (claude-code) | GLM 4.7 | 33.26% ± 1.25 | 2026-02-08 |  |
| Terminus 2 (terminus-2) | Gemini 2.5 Pro | 32.64% ± 1.54 | 2025-10-31 | yes |
| Codex CLI (codex) | GPT-5-Mini | 31.85% ± 1.53 | 2025-11-04 | yes |
| Terminus 2 (terminus-2) | MiniMax M2 | 30.04% ± 1.4 | 2025-11-01 | yes |
| Mini-SWE-Agent (mini-swe-agent) | Claude Haiku 4.5 | 29.83% ± 1.28 | 2025-11-03 | yes |
| Terminus 2 (terminus-2) | MiniMax M2.1 | 29.21% ± 1.48 | 2025-12-23 | yes |
| OpenHands (openhands) | GPT-5-Mini | 29.21% ± 1.4 | 2025-11-02 | yes |
| Terminus 2 (terminus-2) | Claude Haiku 4.5 | 28.31% ± 1.47 | 2025-10-31 | yes |
| Terminus 2 (terminus-2) | Kimi K2 Instruct | 27.79% ± 1.29 | 2025-11-01 | yes |
| Claude Code (claude-code) | Claude Haiku 4.5 | 27.53% ± 1.42 | 2025-11-04 | yes |
| OpenHands (openhands) | Grok 4 | 27.19% ± 1.56 | 2025-11-02 | yes |
| Dakou Agent (aone-agent) | Qwen 3 Coder 480B | 27.19% ± 1.31 | 2025-12-28 |  |
| OpenHands (openhands) | Kimi K2 Instruct | 26.74% ± 1.38 | 2025-11-02 | yes |
| Mini-SWE-Agent (mini-swe-agent) | Gemini 2.5 Pro | 26.07% ± 1.3 | 2025-11-03 | yes |
| Mini-SWE-Agent (mini-swe-agent) | Grok Code Fast 1 | 25.84% ± 1.34 | 2025-11-03 | yes |
| Mini-SWE-Agent (mini-swe-agent) | Grok 4 | 25.39% ± 1.49 | 2025-11-03 | yes |
| OpenHands (openhands) | Qwen 3 Coder 480B | 25.39% ± 1.32 | 2025-11-02 | yes |
| little-coder (little-coder) | Qwen3.6-35B-A3B | 24.63% ± 1.64 | 2026-05-14 |  |
| Terminus 2 (terminus-2) | GLM 4.6 | 24.53% ± 1.25 | 2025-11-01 | yes |
| Terminus 2 (terminus-2) | GPT-5-Mini | 24.04% ± 1.29 | 2025-10-31 | yes |
| Terminus 2 (terminus-2) | Qwen 3 Coder 480B | 23.9% ± 1.43 | 2025-11-01 | yes |
| Terminus 2 (terminus-2) | Grok 4 | 23.15% ± 1.48 | 2025-10-31 | yes |
| little-coder (little-coder) | Qwen3.6-35B-A3B | 23.03% ± nan | 2026-05-14 |  |
| Mini-SWE-Agent (mini-swe-agent) | GPT-5-Mini | 22.25% ± 1.34 | 2025-11-03 | yes |
| spoox-o-m (spoox-m) | GPT-5-Nano | 21.8% ± 1.43 | 2026-05-15 |  |
| Gemini CLI (gemini-cli) | Gemini 2.5 Pro | 19.55% ± 1.46 | 2025-11-04 | yes |
| Bash Agent (qwen-agent) | TermiGen-32B | 19.33% ± 1.02 | 2026-05-14 |  |
| Terminus 2 (terminus-2) | GPT-OSS-120B | 18.69% ± 1.36 | 2025-11-01 | yes |
| Mini-SWE-Agent (mini-swe-agent) | Gemini 2.5 Flash | 17.08% ± 1.27 | 2025-11-03 | yes |
| Terminus 2 (terminus-2) | AfterQuery-GPT-OSS-20B | 17.02% ± 1.25 | 2026-03-31 |  |
| Terminus 2 (terminus-2) | Gemini 2.5 Flash | 16.85% ± 1.21 | 2025-10-31 | yes |
| OpenHands (openhands) | Gemini 2.5 Flash | 16.4% ± 1.22 | 2025-11-02 | yes |
| OpenHands (openhands) | Gemini 2.5 Pro | 16.4% ± 1.4 | 2025-11-02 | yes |
| Gemini CLI (gemini-cli) | Gemini 2.5 Flash | 15.45% ± 1.18 | 2025-11-04 | yes |
| Mini-SWE-Agent (mini-swe-agent) | GPT-OSS-120B | 14.16% ± 1.16 | 2025-11-03 | yes |
| Terminus 2 (terminus-2) | Grok Code Fast 1 | 14.16% ± 1.3 | 2025-10-31 | yes |
| OpenHands (openhands) | Claude Haiku 4.5 | 13.93% ± 1.39 | 2025-11-02 | yes |
| Codex CLI (codex) | GPT-5-Nano | 11.46% ± 1.16 | 2025-11-04 | yes |
| OpenHands (openhands) | GPT-5-Nano | 9.89% ± 1.08 | 2025-11-02 | yes |
| little-coder (little-coder) | Qwen3.5-9B | 9.21% ± 1.2 | 2026-05-14 |  |
| Terminus 2 (terminus-2) | GPT-5-Nano | 7.87% ± 0.95 | 2025-10-31 | yes |
| Mini-SWE-Agent (mini-swe-agent) | GPT-5-Nano | 6.97% ± 0.98 | 2025-11-03 | yes |
| Mini-SWE-Agent (mini-swe-agent) | GPT-OSS-20B | 3.37% ± 0.69 | 2025-11-03 | yes |
| Terminus 2 (terminus-2) | GPT-OSS-20B | 3.07% ± 0.77 | 2025-11-01 | yes |

### 5.2 Terminal-Bench 1.0 — 62 rows (80 tasks)

| Agent | Model | Accuracy ± se | Date | Verified |
|-------|-------|---------------|------|----------|
| Apex2 (None) | claude-4-5-sonnet | 64.5% ± 0.57 | 2025-10-15 |  |
| Chaterm (None) | claude-4-5-sonnet | 63.75% ± 0.56 | 2025-10-31 |  |
| Abacus AI Desktop (None) | gpt-5-mini, claude-sonnet-4-5 | 62.25% ± 0.92 | 2025-11-08 |  |
| Ante (None) | claude-sonnet-4-5 | 60.25% ± 1.08 | 2025-10-10 |  |
| Droid (None) | claude-opus-4-1 | 58.8% ± 0.89 | 2025-09-24 |  |
| Droid (None) | claude-sonnet-4-5 | 57.5% ± 0.79 | 2025-09-29 |  |
| OB-1 (None) | GPT-5, Claude 4.1 Opus, Claude 4 Sonnet | 56.7% ± 0.6 | 2025-09-10 |  |
| Ante (None) | claude-sonnet-4 | 54.75% ± 1.5 | 2025-09-30 |  |
| Droid (None) | gpt-5 | 52.5% ± 2.09 | 2025-09-24 |  |
| Chaterm (None) | claude-sonnet-4-5 | 52.5% ± 0.51 | 2025-10-10 |  |
| Warp (None) | claude-sonnet-4, claude-opus-4 | 52.0% ± 0.95 | 2025-06-23 |  |
| Terminus 2 (None) | claude-sonnet-4-5 | 51.0% ± 0.8 | 2025-09-30 | yes |
| Droid (None) | claude-sonnet-4 | 50.5% ± 1.35 | 2025-09-24 |  |
| DeepAgent Desktop (None) | claude-sonnet-4-5 | 50.5% ± 0.5 | 2025-10-17 |  |
| Chaterm (None) | claude-sonnet-4 | 49.25% ± 1.29 | 2025-09-10 |  |
| Apex2 (None) | gpt-5 | 49.25% ± 0.45 | 2025-10-15 |  |
| Goose (None) | claude-opus-4 | 45.25% ± 1.5 | 2025-09-03 |  |
| Engine Labs (None) | claude-sonnet-4 | 44.75% ± 0.83 | 2025-07-14 |  |
| Terminus 2 (None) | claude-opus-4-1 | 43.75% ± 1.44 | 2025-08-11 | yes |
| Claude Code (None) | claude-opus-4 | 43.2% ± 1.27 | 2025-05-22 |  |
| Codex CLI (None) | gpt-5-codex | 42.81% ± 2.13 | 2025-09-14 | yes |
| Letta (None) | claude-sonnet-4 | 42.5% ± 0.8 | 2025-08-04 |  |
| Goose (None) | claude-opus-4 | 42.0% ± 1.3 | 2025-07-12 |  |
| iFlow CLI (None) | minimax-m2 | 42.0% ± 0.8 | 2025-11-11 |  |
| Terminus 2 (None) | claude-haiku-4-5 | 41.75% ± 1.35 | 2025-10-16 | yes |
| OpenHands (None) | claude-sonnet-4 | 41.25% ± 0.69 | 2025-07-14 |  |
| Terminus 2 (None) | gpt-5 | 41.25% ± 1.12 | 2025-08-11 | yes |
| Goose (None) | claude-sonnet-4 | 41.25% ± 1.25 | 2025-09-03 |  |
| Orchestrator (None) | claude-opus-4-1 | 40.5% ± 0.3 | 2025-09-23 |  |
| Terminus 1 (None) | GLM-4.5 | 39.85% ± 0.96 | 2025-07-31 | yes |
| Terminus 2 (None) | grok-4 | 39.0% ± 1.65 | 2025-10-14 | yes |
| Terminus 2 (None) | claude-opus-4 | 39.0% ± 0.4 | 2025-08-05 | yes |
| iFlow CLI (None) | qwen3-coder-480b-a35b-instruct | 39.0% ± 0.22 | 2025-10-24 |  |
| Alpha (None) | claude-sonnet-4-5 | 38.25% ± 1.09 | 2025-10-12 |  |
| Orchestrator (None) | claude-sonnet-4 | 36.96% ± 2.0 | 2025-09-01 |  |
| Terminus 2 (None) | claude-sonnet-4 | 36.4% ± 0.6 | 2025-08-05 | yes |
| Claude Code (None) | claude-sonnet-4 | 35.5% ± 1.01 | 2025-05-22 |  |
| Terminus 1 (None) | glaive-swe-v1 | 35.3% ± 0.73 | 2025-08-14 | yes |
| Claude Code (None) | claude-3-7-sonnet | 35.18% ± 1.33 | 2025-05-16 | yes |
| CAMEL (None) | gpt-4.1 | 35.0% ± 4.0 | 2025-10-31 |  |
| Goose (None) | claude-sonnet-4 | 34.25% ± 0.97 | 2025-07-12 |  |
| Terminus 2 (None) | grok-4-fast | 31.25% ± 1.44 | 2025-09-21 | yes |
| Terminus 2 (None) | gpt-5-mini | 30.8% ± 2.0 | 2025-10-20 | yes |
| Terminus 1 (None) | claude-3-7-sonnet | 30.59% ± 1.95 | 2025-05-16 | yes |
| Terminus 1 (None) | gpt-4.1 | 30.28% ± 2.15 | 2025-05-15 | yes |
| Terminus 1 (None) | o3 | 30.24% ± 0.9 | 2025-05-15 | yes |
| Terminus 1 (None) | gpt-5 | 30.0% ± 0.88 | 2025-08-07 | yes |
| Goose (None) | o4-mini | 27.5% ± 1.25 | 2025-05-18 | yes |
| Terminus 1 (None) | gemini-2.5-pro | 25.27% ± 2.77 | 2025-05-15 | yes |
| Codex CLI (None) | o4-mini | 20.0% ± 1.47 | 2025-05-15 | yes |
| Orchestrator (None) | Qwen3-Coder-480B | 19.7% ± 2.0 | 2025-09-01 |  |
| Terminus 1 (None) | o4-mini | 18.54% ± 1.36 | 2025-05-15 | yes |
| Terminus 1 (None) | grok-3-beta | 17.5% ± 4.25 | 2025-05-17 | yes |
| Terminus 1 (None) | gemini-2.5-flash | 16.75% ± 1.29 | 2025-05-17 | yes |
| Terminus 1 (None) | Llama-4-Maverick-17B | 15.52% ± 1.68 | 2025-05-15 | yes |
| TerminalAgent (None) | Qwen3-32B | 15.5% ± 1.1 | 2025-07-31 |  |
| Mini SWE-Agent (None) | claude-sonnet-4 | 12.8% ± 0.16 | 2025-08-23 | yes |
| Terminus 2 (None) | gpt-5-nano | 12.2% ± 1.5 | 2025-10-20 | yes |
| Codex CLI (None) | codex-mini-latest | 11.25% ± 1.58 | 2025-05-18 | yes |
| Codex CLI (None) | gpt-4.1 | 8.29% ± 1.41 | 2025-05-15 | yes |
| Terminus 1 (None) | Qwen3-235B | 6.62% ± 1.4 | 2025-05-15 | yes |
| Terminus 1 (None) | DeepSeek-R1 | 5.71% ± 0.73 | 2025-05-15 | yes |

## 6. Sources

- https://www.tbench.ai/ — homepage (hero text, task-example cards)
- https://www.tbench.ai/leaderboard/terminal-bench/2.1 — official TB2.1 leaderboard (17 rows; embedded flight payload)
- https://www.tbench.ai/leaderboard/terminal-bench/2.0 and /1.0 — legacy boards (142 + 62 rows)
- https://www.tbench.ai/leaderboard — leaderboard index; /benchmarks — benchmark catalog; /docs/run-terminal-bench-2-1 — methodology/run docs
- https://www.tbench.ai/news/terminal-bench-challenges — challenges announcement (task types, cost-per-task ranges ~$1–$10 / ~$1–$100 / ~$1k+)
- https://www.tbench.ai/news/tb-science-announcement — Terminal-Bench Science details
- https://hub.harborframework.com/datasets/terminal-bench/terminal-bench-2-1/6/leaderboards/main/rows — Harbor Hub backing endpoint
- https://www.frontierbench.ai/ — TB3.0 board (9 rows)
