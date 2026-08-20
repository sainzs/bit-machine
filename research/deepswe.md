# DeepSWE benchmark research

Source: https://deepswe.datacurve.ai/ (leaderboard v1.1; page data generated 2026-08-07; 113 tasks).

## What it measures and methodology
DeepSWE measures frontier coding agents on original, long-horizon software-engineering tasks. The set contains 113 tasks across 91 repositories and 5 languages. Tasks are written from scratch (contamination-free), prompts are roughly half the length of SWE-bench Pro while solutions require 5.5x more code and about 2x more output tokens, and hand-written behavioral verifiers test software behavior rather than implementation details. All models run on mini-swe-agent for consistency.

Leaderboard data groups every rollout by model + reasoning effort (53 configurations). Score is pass@1: passed scored rollout attempts / attempted scored rollouts; context-window failures and agent timeouts count as failures, while provider/verifier/network errors are excluded. The displayed uncertainty is a 95% run-to-run confidence interval across repeated whole-benchmark passes. Costs are average USD per task.

## Full leaderboard (all 53 configurations)

| Model | Score (pass@1) | Cost/price | Notes |
|---|---:|---:|---|
| claude-opus-5 | 73.6% | $11.84/task | effort: max; avg output 118k tokens; avg 99 steps |
| claude-opus-5 | 73.2% | $9.07/task | effort: xhigh; avg output 92k tokens; avg 89 steps |
| claude-opus-5 | 72.8% | $6.08/task | effort: high; avg output 64k tokens; avg 73 steps |
| gpt-5.6.sol | 72.7% | $8.39/task | effort: max; avg output 60k tokens; avg 61 steps |
| gpt-5.6.sol | 70.7% | $4.70/task | effort: xhigh; avg output 41k tokens; avg 44 steps |
| claude-fable-5 | 69.9% | $13.41/task | effort: xhigh; avg output 80k tokens; avg 68 steps |
| claude-fable-5 | 69.7% | $21.63/task | effort: max; avg output 119k tokens; avg 88 steps |
| gpt-5.6.terra | 69.6% | $3.96/task | effort: max; avg output 72k tokens; avg 76 steps |
| gpt-5.6.sol | 69.4% | $3.47/task | effort: high; avg output 28k tokens; avg 37 steps |
| claude-opus-5 | 68.9% | $3.29/task | effort: medium; avg output 37k tokens; avg 52 steps |
| claude-fable-5 | 68.6% | $9.18/task | effort: high; avg output 57k tokens; avg 59 steps |
| kimi-k3 | 68.5% | $4.65/task | effort: max; avg output 81k tokens; avg 98 steps |
| gpt-5.6.luna | 67.2% | $0.61/task | effort: max; avg output 73k tokens; avg 102 steps |
| gpt-5.5 | 67.0% | $7.23/task | effort: xhigh; avg output 46k tokens; avg 82 steps |
| claude-fable-5 | 65.4% | $6.09/task | effort: medium; avg output 40k tokens; avg 48 steps |
| gpt-5.5 | 64.4% | $5.10/task | effort: high; avg output 31k tokens; avg 62 steps |
| gpt-5.6.sol | 61.1% | $1.86/task | effort: medium; avg output 18k tokens; avg 31 steps |
| gpt-5.6.terra | 60.2% | $1.70/task | effort: xhigh; avg output 40k tokens; avg 43 steps |
| claude-fable-5 | 59.6% | $3.76/task | effort: low; avg output 25k tokens; avg 38 steps |
| claude-opus-4.8 | 59.0% | $13.22/task | effort: max; avg output 135k tokens; avg 120 steps |
| claude-opus-5 | 58.1% | $1.66/task | effort: low; avg output 20k tokens; avg 36 steps |
| qwen3.8-max | 57.5% | $3.73/task | effort: xhigh; avg output 95k tokens; avg 111 steps |
| gpt-5.6.luna | 56.9% | $0.31/task | effort: xhigh; avg output 45k tokens; avg 71 steps |
| muse-spark-1-2 | 54.9% | $3.70/task | effort: xhigh; avg output 99k tokens; avg 101 steps |
| claude-opus-4.8 | 54.4% | $8.01/task | effort: xhigh; avg output 86k tokens; avg 95 steps |
| gpt-5.5 | 54.0% | $2.75/task | effort: medium; avg output 20k tokens; avg 46 steps |
| claude-sonnet-5 | 53.8% | $26.40/task | effort: max; avg output 214k tokens; avg 268 steps |
| gpt-5.6.terra | 53.8% | $0.91/task | effort: high; avg output 22k tokens; avg 34 steps |
| grok-4.5 | 53.8% | $2.42/task | effort: high; avg output 36k tokens; avg 61 steps |
| deepseek-v4-flash | 53.3% | $0.10/task | effort: max; avg output 108k tokens; avg 153 steps |
| muse-spark-1-1 | 53.3% | $2.36/task | effort: xhigh; avg output 74k tokens; avg 96 steps |
| claude-opus-4.8 | 51.8% | $4.28/task | effort: high; avg output 50k tokens; avg 72 steps |
| gpt-5.4 | 51.8% | $5.65/task | effort: xhigh; avg output 71k tokens; avg 70 steps |
| claude-sonnet-5 | 49.7% | $11.89/task | effort: xhigh; avg output 121k tokens; avg 186 steps |
| claude-opus-4.8 | 48.7% | $3.44/task | effort: medium; avg output 41k tokens; avg 66 steps |
| gemini-3.6.flash | 48.6% | $3.53/task | effort: high; avg output 97k tokens; avg 108 steps |
| claude-sonnet-5 | 48.2% | $7.43/task | effort: high; avg output 87k tokens; avg 147 steps |
| gpt-5.6.sol | 45.4% | $1.07/task | effort: low; avg output 11k tokens; avg 23 steps |
| gpt-5.6.luna | 44.2% | $0.16/task | effort: high; avg output 26k tokens; avg 49 steps |
| glm-5.2 | 43.8% | $3.92/task | effort: max; avg output 78k tokens; avg 129 steps |
| claude-opus-4.8 | 40.8% | $2.29/task | effort: low; avg output 29k tokens; avg 54 steps |
| claude-sonnet-5 | 39.8% | $4.08/task | effort: medium; avg output 57k tokens; avg 108 steps |
| gemini-3.5.flash | 37.4% | $7.34/task | effort: medium; avg output 276k tokens; avg 86 steps |
| glm-5.2 | 36.3% | $2.84/task | effort: high; avg output 54k tokens; avg 122 steps |
| gpt-5.6.terra | 35.1% | $0.47/task | effort: medium; avg output 12k tokens; avg 25 steps |
| kimi-k2.7-code | 30.5% | $2.82/task | effort: null; avg output 59k tokens; avg 149 steps |
| claude-sonnet-5 | 30.5% | $2.19/task | effort: low; avg output 36k tokens; avg 77 steps |
| claude-sonnet-4.6 | 29.9% | $5.52/task | effort: high; avg output 76k tokens; avg 134 steps |
| gpt-5.5 | 27.0% | $1.20/task | effort: low; avg output 9k tokens; avg 28 steps |
| gpt-5.6.terra | 24.1% | $0.34/task | effort: low; avg output 9k tokens; avg 21 steps |
| gemini-3.1-pro-preview | 11.8% | $9.48/task | effort: high; avg output 196k tokens; avg 81 steps |
| gpt-5.6.luna | 11.3% | $0.04/task | effort: medium; avg output 8k tokens; avg 24 steps |
| gpt-5.6.luna | 1.5% | $0.01/task | effort: low; avg output 3k tokens; avg 12 steps |