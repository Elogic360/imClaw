# imClaw Upstream Capability Matrix & Comparative Analysis

**Document ID:** IMCLAW-UPSTREAM-MATRIX  
**Date:** 2026-10-07  
**Author:** Principal Autonomous Software Architect & Systems Engineering Lead  
**Scope:** OpenClaw, Hermes, NanoClaw, NemoClaw, Jarvis, Mimoclaw, n8n

---

## 1. Upstream Candidate Inventory & Verification

| Candidate             | Source Repository / Git Remote                         | Verified Commit                            | License                             | Primary Architectural Focus                                                              |
| :-------------------- | :----------------------------------------------------- | :----------------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------------- |
| **OpenClaw (Core)**   | `https://github.com/openclaw/openclaw.git`             | `cb01febf9fa4fbda271d10b3adff3b384c6ece76` | MIT                                 | Gateway daemon, SQLite state, multi-channel messaging, subagent supervisor               |
| **Hermes Agent**      | `https://github.com/NousResearch/hermes-agent.git`     | `7dab93b06e2bb3757dc18229169efcee1b5b47a3` | MIT                                 | Self-improving skills, autonomous scratchpad reasoning, prompt caching boundaries        |
| **NanoClaw**          | `https://github.com/nanocoai/nanoclaw.git`             | `66f0823a693bd9cca4123e72f8ccee05f5e7e1c5` | MIT                                 | Minimalist container execution, agent runner isolation, task script sandboxing           |
| **NemoClaw**          | `https://github.com/NVIDIA/NemoClaw.git`               | `f41d5bffb87daa827f0533bcb9d95207a23436d9` | Apache-2.0                          | Hardened security policies, SSRF defenses, credential leak scanning, OpenShell isolation |
| **n8n**               | `https://github.com/n8n-io/n8n.git`                    | `c194d22b5c02139d5bc7127a16df2f8a5ec62cb3` | Sustainable Use License (Fair-code) | Deterministic DAG workflow engine, trigger/condition branching, retry/dead-letter        |
| **Jarvis (Registry)** | `https://github.com/ascending-llc/jarvis-registry.git` | `47023ab8c478ef850102b956c32a016d104628e1` | Apache-2.0                          | Enterprise tool registry, managed-agent group scoping, token authority                   |
| **Mimoclaw**          | `https://github.com/XiaomiMiMo/MiMo-Skills.git`        | `fa2a81225730f7a4885bb22dc7a7f646fc0b3823` | MIT                                 | Multimodal speech synthesis, emotion tag pacing, voice cloning skills                    |

---

## 2. Comprehensive Cross-Project Capability Matrix

| Capability Domain            | OpenClaw Support            | Upstream Benchmark            | Superior Implementation & Insights                                                                   | imClaw Decision        | Target Implementation Location in imClaw  |
| :--------------------------- | :-------------------------- | :---------------------------- | :--------------------------------------------------------------------------------------------------- | :--------------------- | :---------------------------------------- |
| **Agent Core Loop**          | FULL (`agent-core`)         | Hermes / NanoClaw             | OpenClaw's `@openclaw/agent-core` loop with live mid-turn steering and abortion is state-of-the-art. | **KEEP & EXTEND**      | `packages/agent-core/`                    |
| **Subagent Hierarchy**       | FULL (SQLite store)         | Hermes                        | OpenClaw's SQLite durable subagent registry with crash recovery exceeds all others.                  | **KEEP UNCHANGED**     | `src/agents/subagents/`                   |
| **Self-Improving Skills**    | PARTIAL (Static markdown)   | Hermes (`skill_commands.py`)  | Hermes has dynamic skill discovery, multi-slot command cache, and prompt cache boundaries.           | **ADAPT / PORT**       | `src/skills/im-skills-engine/`            |
| **Container Sandboxing**     | FULL (Docker/Podman/SSH)    | NanoClaw / NemoClaw           | NemoClaw adds SSRF prevention, OpenShell policies, and credential leak scanners.                     | **HARDEN / ENFORCE**   | `src/agents/sandbox/` + NemoClaw filters  |
| **Deterministic Workflows**  | WEAK (linear flows/claws)   | n8n (`packages/workflow`)     | n8n has complete DAG execution, triggers, retry backoff, approval gates, and paired-item state.      | **ADAPT ARCHITECTURE** | `src/workflows/im-workflow-engine/`       |
| **Enterprise Tool Registry** | BASIC (local tool list)     | Jarvis (`jarvis-registry`)    | Jarvis implements group-scoped tokens and centralized enterprise tool federation.                    | **ADAPT PATTERN**      | `src/mcp/im-mcp-registry/`                |
| **Voice & Multimodal**       | FULL (TTS/Whisper)          | Mimoclaw                      | Mimoclaw adds fine-grained speech emotion tags (`[pause]`, `[sighs]`) and director mode.             | **EXTEND SKILLS**      | `skills/im-voice-director/`               |
| **Financial / Trading**      | ABSENT (Zero market code)   | NONE (General agent projects) | Upstreams lack financial markets, broker FIX APIs, order execution, and risk checks.                 | **BUILD (NEW)**        | `src/trading/` (`im-trading-engine`)      |
| **Deterministic Risk**       | ABSENT (Zero risk controls) | NONE                          | Must be an independent, non-bypassable barrier between LLMs and broker execution.                    | **BUILD (NEW)**        | `src/risk/` (`im-risk-guard`)             |
| **Trade Journaling**         | BASIC (Generic wiki)        | OpenClaw `memory-wiki`        | OpenClaw's Obsidian-compatible wiki can be specialized into an autonomous Trade Journal.             | **EXTEND**             | `extensions/memory-wiki/` -> `im-journal` |

---

## 3. License & Governance Analysis

1. **Permissive Core (MIT & Apache-2.0):**
   - OpenClaw (MIT), Hermes (MIT), NanoClaw (MIT), NemoClaw (Apache-2.0), Jarvis (Apache-2.0), Mimoclaw (MIT).
   - All permissive. Commercial use and proprietary extensions allowed. Notices preserved.
2. **Copyleft / Fair-Code Caution (n8n Sustainable Use License):**
   - **CRITICAL:** n8n is NOT Apache or MIT; it uses the Sustainable Use License with commercial restrictions.
   - **GOVERNANCE DIRECTIVE:** Do NOT copy or vendor n8n source code files into imClaw.
   - **ACTION:** Extract only the _architectural patterns_ (DAG execution semantics, node contracts, trigger/condition models) and implement them cleanly in imClaw TypeScript.
