# Capture Test

## Tool and model

- Tool: GitHub Copilot agent using Copilot SDK in VS Code, with the Copilot CLI hook runtime.
- Model selection: `auto`; this host does not expose separate planning and execution models. The original setup turn resolved to `gpt-6-luna`. Both verified canary sessions resolved to `mai-code-1.1-flash`. Within each turn, the selected model handles both planning and execution; auto-routing can select a different model in another session.

## Capture mechanism

The repository-level hooks in `.github/hooks/8x-agent-capture.json` invoke `.github/hooks/capture-agent-log.ps1` on `userPromptSubmitted` and `agentStop`; `sessionEnd` cleans up pending state. The prompt hook stores the complete prompt, and the stop hook reads the transcript path supplied by the runtime to capture the final assistant response and its model. Captures are written under `.agent-logs/`, one file per Copilot session.

The Windows host did not have PowerShell 7 (`pwsh`) installed, so the hook calls the available `powershell.exe` directly with `exec`. The configured hook was loaded and exercised in fresh sessions.

## Canary log paths

- `.agent-logs/2026-10-06_05-46-13_2e1c7b2d-f6b1-4364-b5e8-48708d57d604.md`
- `.agent-logs/2026-10-06_05-50-26_aa8b3868-d1ef-4058-b2d1-7ce3e23d072b.md`

## Canary entries (raw)

### Canary 1

```text
[LOG_ENTRY type=PROMPT num=1 session=2e1c7b2d]
timestamp: 2026-10-06T05:46:13.058Z
model: mai-code-1.1-flash

CAPTURE TEST — 8x assignment, Muhammad Bilal


[LOG_ENTRY type=RESPONSE num=1 session=2e1c7b2d]
timestamp: 2026-10-06T05:47:22.749Z
model: mai-code-1.1-flash

I’m an AI assistant using Copilot SDK in VS Code. This is the capture canary, and I’m ready to proceed only with the actual assignment when it’s provided.
```

### Canary 2 — fresh session

```text
[LOG_ENTRY type=PROMPT num=1 session=aa8b3868]
timestamp: 2026-10-06T05:50:26.254Z
model: mai-code-1.1-flash

CAPTURE TEST — 8x assignment, Muhammad Bilal


[LOG_ENTRY type=RESPONSE num=1 session=aa8b3868]
timestamp: 2026-10-06T05:51:23.807Z
model: mai-code-1.1-flash

I’m an AI assistant using Copilot SDK in VS Code. This is the canary check, and I’m ready to proceed only with the actual task when it’s provided.
```

## Initial attempts that did not work

- The first logger version used a single pending-prompt file per session and generated a new log filename for each prompt. A queued prompt could replace an earlier pending prompt, and the session produced multiple files. This was corrected with per-prompt pending records and a persistent per-session filename.
- PowerShell 5.1's default UTF-8 file decoding corrupted the em dash in a canary. Pending JSON is now read with an explicit UTF-8 encoding; both clean canary prompts were checked against the exact expected string.
- The first counter/line-ending logic wrote exchange number `0`. The corrected logger handles CRLF metadata and starts numbering at `1`.
- The failed-attempt log files were left untouched as recorded: `.agent-logs/2026-10-06_05-32-16_be20cf79-79b3-4934-a649-bce9910845f6.md`, `.agent-logs/2026-10-06_05-35-51_be20cf79-79b3-4934-a649-bce9910845f6.md`, and `.agent-logs/2026-10-06_05-38-41_bccadf18-2eab-4d8a-b85e-531e85fe2c60.md`. They are not the passing canary evidence above.
- The original setup exchange began before the repository hook was installed and was not captured retroactively.
