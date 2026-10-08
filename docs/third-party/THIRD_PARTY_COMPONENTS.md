# imClaw Third-Party Governance & Provenance Record

**Document ID:** IMCLAW-THIRD-PARTY-GOVERNANCE  
**Date:** 2026-10-07  
**Author:** Principal Autonomous Software Architect & Systems Engineering Lead

---

## 1. Upstream Components & License Inventory

| Component             | Source Git Repository                                  | Cloned Path                                   | Baseline Commit                            | License                             | Borrowed Paradigm / Pattern                                                         | Integration Mechanism in imClaw                                                          |
| :-------------------- | :----------------------------------------------------- | :-------------------------------------------- | :----------------------------------------- | :---------------------------------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **OpenClaw**          | `https://github.com/openclaw/openclaw.git`             | `/home/elogic360/Projects/openclaw`           | `cb01febf9fa4fbda271d10b3adff3b384c6ece76` | MIT                                 | Gateway daemon, SQLite state, Agent-core loop, Channel adapters                     | Base Host Platform                                                                       |
| **Hermes Agent**      | `https://github.com/NousResearch/hermes-agent.git`     | `/home/elogic360/Projects/upstreams/hermes`   | `7dab93b06e2bb3757dc18229169efcee1b5b47a3` | MIT                                 | Self-improving skill discovery, multi-slot command caching, prompt cache boundaries | Adopted in `src/skills/`                                                                 |
| **NanoClaw**          | `https://github.com/nanocoai/nanoclaw.git`             | `/home/elogic360/Projects/upstreams/nanoclaw` | `66f0823a693bd9cca4123e72f8ccee05f5e7e1c5` | MIT                                 | Lean container process execution boundaries                                         | Enforced in `src/agents/sandbox/`                                                        |
| **NemoClaw**          | `https://github.com/NVIDIA/NemoClaw.git`               | `/home/elogic360/Projects/upstreams/nemoclaw` | `f41d5bffb87daa827f0533bcb9d95207a23436d9` | Apache-2.0                          | SSRF defenses, credential leak scanning, OpenShell isolation                        | Adopted in security boundaries                                                           |
| **n8n**               | `https://github.com/n8n-io/n8n.git`                    | `/home/elogic360/Projects/upstreams/n8n`      | `c194d22b5c02139d5bc7127a16df2f8a5ec62cb3` | Sustainable Use License (Fair-code) | Architectural DAG model (triggers, conditions, actions, retry backoff)              | **Clean-room TypeScript reimplementation** in `src/imclaw/workflows/` (Zero code copied) |
| **Jarvis (Registry)** | `https://github.com/ascending-llc/jarvis-registry.git` | `/home/elogic360/Projects/upstreams/jarvis`   | `47023ab8c478ef850102b956c32a016d104628e1` | Apache-2.0                          | Enterprise tool registry, token authority, group-scope fallback                     | Adopted in tool authorization                                                            |
| **Mimoclaw**          | `https://github.com/XiaomiMiMo/MiMo-Skills.git`        | `/home/elogic360/Projects/upstreams/mimoclaw` | `fa2a81225730f7a4885bb22dc7a7f646fc0b3823` | MIT                                 | Multimodal emotion tags, director mode speech pacing                                | Adopted in Voice Sensei skills                                                           |

---

## 2. IP Governance & Fair-Code Isolation Guarantee

1. **No Proprietary Contamination:** All third-party notices and licenses are strictly verified.
2. **n8n Compliance Notice:** n8n source code files under the Sustainable Use License are **NOT** copied, vendored, or distributed in imClaw. imClaw's `DeterministicWorkflowEngine` is an independent, clean-room TypeScript DAG implementation based on universal computer science graph traversal principles.
