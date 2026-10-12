# imClaw 🦞 — Autonomous Multi-Agent Platform & Social Gateway

> **Your assistant, on your devices, in your chats, running your company, code, and trading operations.**

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-banner-light.png">
    <img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-banner-dark.png" alt="imClaw — Autonomous Multi-Agent Platform">
  </picture>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
  <a href="https://github.com/Elogic360/imClaw"><img src="https://img.shields.io/badge/github-Elogic360%2FimClaw-blue?style=flat-square&logo=github" alt="imClaw GitHub"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/openclaw?style=flat-square" alt="Node.js version"></a>
</p>

imClaw is an autonomous open-source multi-agent platform and social gateway that connects to any model provider, runs 24/7 background workflows, automates trading and financial risk fences, and orchestrates a 35-specialist corporate organization with an interactive 3D command center.

---

## 🌟 Core Architecture & 6 Pillars

### #1 Connect — Lives Everywhere

**Telegram, Discord, Slack, WhatsApp, Signal, Email, CLI** — and a growing list of platforms. One agent, one memory, every surface.

- Native WhatsApp Gateway with multi-session capability (powered by OpenWA protocol).
- Discord, Slack, Telegram, Signal, iMessage, and terminal TUI/CLI.
- Unified multi-channel routing with persistent session continuity across channels.

### #2 Remember — Persistent Memory

**It learns your projects, auto-generates skills, and never forgets how it solved a problem.**

- Multi-tier memory engine: Working Context, Episodic memory, and Semantic Knowledge base.
- Procedural skill acquisition & self-improving memory loop (powered by Hermes & Agent Learning Engine).
- Automated operator correction capture: learns lessons from interactions and promotes validated organizational guidelines.

### #3 Schedule — Focused Automation

**Natural-language scheduling for reports, backups, and briefings — running unattended through the gateway, focused every time.**

- Autonomous Scheduler engine supporting cron patterns, intervals, and natural-language triggers.
- Unattended routines for automated trading scans, daily financial reconciliations, team standups, and social broadcasts.
- Dead-letter handling, persistent execution logs, and automated retry policies.

### #4 Delegate — Tasks Multiplied

**Isolated subagents with their own conversations, terminals, and Python RPC scripts for zero-context-cost pipelines.**

- Autonomous Organization & 3D Interactive Agents Office with 35 specialist desks across 6 core corporate departments (Engineering, Product, Marketing, Sales, Operations, Finance) plus Trading Desks.
- Hierarchical task routing: Department leads decompose tasks, dispatch concurrent specialist work, and synthesize finished deliverables.
- Subagent isolation with Compare-And-Swap (CAS) session claim fencing.

### #5 Search — Browse the Web & Multi-Modal Intelligence

**Web search, browser automation, vision, image generation, text-to-speech, and multi-model reasoning.**

- Integrated headless browser automation and web search tools.
- Multi-model routing engine dynamically selecting optimal LLMs (Google Antigravity/Gemini Flash & Pro, Nous Portal / Hermes-Agent, Anthropic Claude 3.7 Sonnet, DeepSeek R1, OpenAI).
- Live audio/speech direction with prosody pacing tags and streaming thought scrubber.

### #6 Experiment — Isolated Sandboxing

**Five backends — local, Docker, SSH, Singularity, Modal — with container hardening and namespace isolation.**

- Hardened sandbox execution backends ensuring safe code execution.
- Deterministic Risk Engine & Policy Guard for financial trades (max drawdown, enforced stop-loss, risk-per-trade fences).
- Binary bitmask ACL security authority and runtime self-protection against destructive commands.

---

## 🏢 Interactive 3D Agents Office Command Centre

Access the real-time visual office:

- **3D Isometric Interactive Command Centre:** [http://127.0.0.1:18789/imclaw/office/3d](http://127.0.0.1:18789/imclaw/office/3d)
- **Organization Hierarchy Dashboard:** [http://127.0.0.1:18789/imclaw/office](http://127.0.0.1:18789/imclaw/office)
- **Control Web UI:** [http://127.0.0.1:18789/](http://127.0.0.1:18789/)

---

## ⚡ Universal Quick Install

### Linux / macOS / WSL2

```bash
curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash
```

### Windows (Native PowerShell)

```powershell
iex (irm https://raw.githubusercontent.com/Elogic360/imClaw/main/install.ps1)
```

---

## ❓ FAQs

<details>
<summary><b>How does imClaw connect to any model provider?</b></summary>
imClaw provides a unified Model Router and Provider Bridge. You can configure Gemini, Claude, OpenAI, DeepSeek, Ollama, or Hermes models seamlessly via CLI or web UI.
</details>

<details>
<summary><b>Can imClaw run unattended automations and trading?</b></summary>
Yes. imClaw features a built-in Deterministic Risk Engine that enforces strict drawdowns and stop-loss policies before any trade reaches the broker adapter. Its autonomous scheduler runs background routines 24/7.
</details>

<details>
<summary><b>How do subagents communicate?</b></summary>
Subagents run in isolated execution contexts and exchange messages through the typed Reactive Event Bus and RPC pipelines without bloating the parent agent context tokens.
</details>

<details>
<summary><b>Is my data kept local?</b></summary>
Yes. All credentials, sqlite state, session logs, trade journals, and memory indexes are stored locally on your machine.
</details>

---

## How it fits together

- The [Gateway](https://docs.openclaw.ai/gateway) is the local control plane for sessions, tools, events, and channel connections.
- The [Control UI](https://docs.openclaw.ai/web/control-ui), CLI, and [TUI](https://docs.openclaw.ai/web/tui) connect to the Gateway.
- [Channels](https://docs.openclaw.ai/channels) bring the assistant to WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, and other messaging services.
- [Companion apps and nodes](https://docs.openclaw.ai/platforms) add voice, Canvas, camera, screen, and device-local actions on supported platforms.

OpenClaw works with hosted and local [model providers](https://docs.openclaw.ai/concepts/model-providers). Its [tools](https://docs.openclaw.ai/tools), [skills](https://docs.openclaw.ai/tools/skills), and [plugins](https://docs.openclaw.ai/plugins) extend what an assistant can do.

## Security

Treat inbound messages as untrusted input. DM-capable channels pair unknown senders by default; approve a pairing request with `openclaw pairing approve <channel> <code>`.

Tools run on the host for the main session unless you configure sandboxing. Read the [security guide](https://docs.openclaw.ai/gateway/security), [exposure runbook](https://docs.openclaw.ai/gateway/security/exposure-runbook), and [sandboxing guide](https://docs.openclaw.ai/gateway/sandboxing) before connecting other users or exposing the Gateway remotely.

## Documentation

| Goal                             | Start here                                                                                                                                                                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configure models and auth        | [Models](https://docs.openclaw.ai/concepts/models) · [Model providers](https://docs.openclaw.ai/concepts/model-providers)                                                                                                                                            |
| Connect a messaging service      | [Channels](https://docs.openclaw.ai/channels)                                                                                                                                                                                                                        |
| Add tools, skills, and plugins   | [Tools](https://docs.openclaw.ai/tools) · [Skills](https://docs.openclaw.ai/tools/skills) · [Plugins](https://docs.openclaw.ai/plugins) · [ClawHub](https://clawhub.ai)                                                                                              |
| Run apps and device nodes        | [Platforms](https://docs.openclaw.ai/platforms) · [Nodes](https://docs.openclaw.ai/nodes)                                                                                                                                                                            |
| Use the CLI and chat commands    | [CLI reference](https://docs.openclaw.ai/cli) · [Slash commands](https://docs.openclaw.ai/tools/slash-commands)                                                                                                                                                      |
| Configure or operate the Gateway | [Configuration](https://docs.openclaw.ai/gateway/configuration) · [Architecture](https://docs.openclaw.ai/concepts/architecture) · [Updating](https://docs.openclaw.ai/install/updating) · [Release channels](https://docs.openclaw.ai/install/development-channels) |

## Development

The repository is a pnpm workspace. Plain `npm install` at the repository root is not supported.

```bash
git clone https://github.com/Elogic360/imClaw.git
cd imClaw
pnpm install
pnpm build
pnpm ui:build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow and the [source setup guide](https://docs.openclaw.ai/start/setup) for the development loop.

## Governance

OpenClaw is developed in the open by the [OpenClaw Foundation](https://openclaw.org), an independent 501(c)(3). The Foundation employs the core team and signs releases. Donors and infrastructure sponsors support the Foundation; none of them own or direct the project. OpenAI is a donor, not an owner.

## Community

See [CONTRIBUTING.md](CONTRIBUTING.md) for maintainers and contribution guidelines; AI-assisted PRs are welcome.

Use the [issue chooser](https://github.com/openclaw/openclaw/issues/new/choose) for bugs and feature requests, ask setup questions in [Discord](https://discord.gg/clawd), and report vulnerabilities through [SECURITY.md](SECURITY.md). New capabilities usually belong in plugins built on the [plugin SDK](https://docs.openclaw.ai/plugins/building-plugins) and shared through [ClawHub](https://clawhub.ai).

OpenClaw was built for **Molty**, a space lobster AI assistant, by Peter Steinberger and the community. Explore the [project lore](https://docs.openclaw.ai/start/lore), [soul.md](https://soul.md), [Peter's site](https://steipete.me), [Star History](https://www.star-history.com/#openclaw/openclaw&type=date&legend=top-left), and [@openclaw](https://x.com/openclaw).

Special thanks to [Mario Zechner](https://mariozechner.at/) for his support and for [pi](https://github.com/earendil-works/pi), and to Adam Doppelt for the lobster.bot domain.

## Donors and sponsors

The Foundation is funded by donors including Amazon, Lobster Computer Company, Offline Holdings, OpenAI, Red Hat, and the University of Michigan, with infrastructure support from Blacksmith, Convex, GitHub, NVIDIA, and Vercel.

<table>
  <tr>
    <td align="center"><a href="https://blacksmith.sh/"><picture><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/blacksmith-light.svg"><img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/blacksmith.svg" alt="Blacksmith" height="28"></picture></a></td>
    <td align="center"><a href="https://www.convex.dev/"><picture><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/convex-light.svg"><img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/convex.svg" alt="Convex" height="24"></picture></a></td>
    <td align="center"><a href="https://github.com/"><picture><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/github-light.svg"><img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/github.svg" alt="GitHub" height="28"></picture></a></td>
    <td align="center"><a href="https://www.nvidia.com/"><picture><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/nvidia.svg"><img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/nvidia-dark.svg" alt="NVIDIA" height="28"></picture></a></td>
    <td align="center"><a href="https://github.com/openai"><picture><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/openai-light.svg"><img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/openai.svg" alt="OpenAI" height="28"></picture></a></td>
    <td align="center"><a href="https://www.redhat.com/"><picture><source media="(prefers-color-scheme: light)" srcset="docs/assets/sponsors/redhat-light.svg"><img src="docs/assets/sponsors/redhat.svg" alt="Red Hat" height="28"></picture></a></td>
    <td align="center"><a href="https://vercel.com/"><picture><source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/vercel-light.svg"><img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/sponsors/vercel.svg" alt="Vercel" height="24"></picture></a></td>
  </tr>
</table>

## License

[MIT](LICENSE) © imClaw. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for incorporated or adapted code.
