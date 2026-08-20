# Local AI provider and subscription inventory

Read-only audit; credentials are intentionally omitted (only presence, key names, and auth modes recorded).

| provider | evidence | auth type | plan tier (if inferable) | wired into prime-agent? |
|---|---|---|---|---|
| OpenAI/Codex | `~/.prime/agent/auth.json` openai-codex OAuth; `~/.codex/auth.json` tokens; models includes provider | OAuth | ChatGPT/Codex tier not reliably inferable | Yes |
| OpenAI API | prime auth `openai` key; OpenCode OAuth account metadata indicates `chatgpt_plan_type=pro` | API key / OAuth | ChatGPT Pro (OpenCode account metadata) | Yes |
| Anthropic | prime auth + OpenCode auth entries, OAuth | OAuth | Pro/Max not distinguishable from local files | Yes |
| GitHub Copilot | prime auth OAuth; OpenCode auth OAuth; `~/.config/github-copilot/apps.json` | OAuth | Copilot tier not inferable | Yes |
| Kimi/Moonshot | prime `kimi-coding` key; OpenCode `kimi-for-coding` key | API key | Coding plan likely, exact tier unknown | Yes |
| Z.ai/GLM | prime `zai-coding-plan` OAuth and `zai-coding-cn` key; OpenCode key; config secret filename `zai-coding-plan-api-key` | OAuth / API key | Coding plan | Yes |
| Xiaomi MiMo | prime OAuth; OpenCode xiaomi and token-plan entries | OAuth / API key | MiMo token plan entries present; tier unknown | Yes |
| OpenCode | prime key and OpenCode auth key | API key | OpenCode Go/account present; tier unknown | Yes |
| Azure OpenAI/Foundry | prime azure/foundry entries; OpenCode Azure entries | API key | Enterprise/project billing; tier N/A | Yes |
| DeepSeek | prime API key | API key | Tier unknown | Yes |
| Amazon Bedrock | OpenCode auth key | API key | Cloud billing; not evident in prime auth | No (OpenCode only) |
| Factory/Droid | `~/.factory/byok.env` key name `FACTORY_OPENROUTER_API_KEY`; Factory auth files | API key / login | Factory subscription tier not inferable | No direct prime provider |
| Cursor | prime OAuth; Cursor CLI config and CLI installed | OAuth | Cursor tier not inferable | Yes |
| OpenRouter | Factory BYOK key name; 1Password Dev item titles | API key | Tier unknown | No direct prime entry |
| 1Password-stored AI/API credentials | Dev titles: Cerebras API, kimi code token, openrouter, MiniMax API Key Coding Plan, ZAI API Key, Google Studio API Credentials, Factory AI, Azure API Credential, etc.; Personal titles include OpenAI, Anthropic Partner Program, Claude, Cursor, Xiaomi, DeepSeek, Perplexity | Stored credentials (titles only) | Subscription/API status not inferable | Some wired; remaining not confirmed |

## Installed CLIs (PATH)

- `claude` 2.1.224 (Claude Code)
- `codex` 0.146.0
- `opencode` 0.0.0-local-v1.18.9-202608031929
- `cursor-agent` 2026.06.26-7079533
- `droid` 0.189.0
- `gemini` 0.49.0
- `gh` 2.93.0
- `op` (1Password CLI) 2.34.0
- `aider` not found

## Notes

`~/.codex/auth.json` has OAuth token fields and an empty `OPENAI_API_KEY` field. Claude settings contain model defaults but no reliable Max/Pro indicator. 1Password listing was title-only; no item contents were read.
