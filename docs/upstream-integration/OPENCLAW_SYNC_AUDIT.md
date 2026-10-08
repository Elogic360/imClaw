# Upstream Audit: OpenClaw Core vs imClaw

**Baseline Upstream:** `https://github.com/openclaw/openclaw.git` (`origin/main`, commit `cb01febf9fa4fbda271d10b3adff3b384c6ece76`)  
**Target Repository:** `/home/elogic360/Projects/imClaw`  
**Date:** 2026-10-07

---

## 1. Upstream Scope and Architecture

OpenClaw is an open-source autonomous agent gateway and multi-channel runtime designed for personal AI assistants.
Key features of baseline OpenClaw:

- Multi-channel gateway (Telegram, Discord, Slack, WhatsApp, Signal, Web)
- Extensible tool execution environment
- Skill plugins and MCP protocol integration
- Session and conversation persistence
- Fast TypeScript/Node.js architecture with Vite/Vitest

## 2. Gaps in Vanilla OpenClaw Addressed by imClaw

While OpenClaw provides an exceptional multi-channel gateway and tool execution foundation, it lacks:

1. **Multi-Agent Lifecycle & Hierarchy:** No native Shihan/Sensei delegation hierarchy, cascading process tree termination, or agent capability whitelisting.
2. **Deterministic Risk Protection:** No financial trade validation, non-bypassable risk engine, maximum drawdown limits, or mandatory Stop-Loss enforcement.
3. **Multi-Tiered Memory Architecture:** Memory is primarily session-bound; lacks differentiated Working, Short-Term, Episodic, Semantic, and Permanent memory tiers with automatic threshold consolidation.
4. **Deterministic Workflow DAGs:** Lacks topological DAG orchestration with conditional branching and backoff retries.
5. **Trade Execution Pipeline & Simulation:** No abstraction for financial brokers or trade journal auditing.

## 3. imClaw Core Additions Over OpenClaw

All additions are architected cleanly under `src/imclaw/` and verified with `imclaw-subsystems.test.ts` without modifying baseline OpenClaw files destructively:

- `src/imclaw/agents/` — Dynamic registry, hierarchical lifecycle management, cascading child kill.
- `src/imclaw/risk/` — Non-bypassable deterministic risk engine.
- `src/imclaw/trading/` — Simulation broker & trade execution pipeline.
- `src/imclaw/memory/` — Multi-tier memory engine with episodic-to-semantic consolidation.
- `src/imclaw/workflows/` — Deterministic DAG workflow engine.
- `src/imclaw/mcp/` — Least-privilege MCP tool security router.
- `src/imclaw/skills/` — Default-deny skill permission evaluator.
- `src/imclaw/approvals/` — Human-in-the-loop / simulated trade approval policies.
- `src/imclaw/models/` — Cost/complexity aware model router.
- `src/imclaw/events/` — Asynchronous pub/sub reactive event bus.
- `src/imclaw/orchestration/` — Hierarchical Shihan-Sensei delegation orchestrator.
- `src/imclaw/journal/` — Trade thesis and post-trade markdown audit journaler.

## 4. Verification Status

- Core TypeScript compilation: **PASS** (`tsgo:core`, exit 0)
- Subsystem test suite: **16/16 PASS** (100% pass rate)
- Git compatibility: Full upstream git history preserved.
