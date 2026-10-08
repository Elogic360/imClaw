# imClaw Full Autonomous Agent Platform Architecture

**Document ID:** IMCLAW-FULL-AGENT-PLATFORM-SPEC  
**Date:** 2026-10-07  
**Author:** Principal Autonomous Software Architect & Systems Engineering Lead  
**Working Repository:** `/home/elogic360/Projects/imClaw`

---

## 1. Platform Architectural Overview

imClaw is Integral Market's Autonomous Intelligence Operating System. The entire repository (`/home/elogic360/Projects/imClaw`) embodies the platform:

```text
                                  imClaw PLATFORM
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   │                     │                     │
             Agent Platform        Skills Engine          MCP Platform
         (Registry & Lifecycle)   (Permissioned Pkgs)  (Least-Privilege)
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         │
                                   Orchestration
                               (Delegation & Shihan)
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   │                     │                     │
             Memory Engine       Deterministic Workflows  Scheduler
           (Multi-Tier Cache)     (Topological DAG)     (Event/Cron)
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         │
                                  Policy & Security
                             (NemoClaw Filters & SSRF)
                                         │
                                  Approval Engine
                             (Human-in-the-Loop Gates)
                                         │
                              Deterministic Guardrails
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   │                     │                     │
             Risk Guard          Execution Pipeline       Trade Journal
          (Hard Math Stops)     (Broker Sim & Live)     (PnL Attribution)
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         │
                                   Observability
                             (Structured Telemetry)
                                         │
                                 Messaging Channels
                            (Telegram, WhatsApp, Slack)
```

---

## 2. Core Implemented Platform Subsystems

### 2.1 Agent Platform (`src/imclaw/agents/`)

- **Agent Profiles & Machine-Readable Contracts (`agent-types.ts`):** Defines explicit agent roles (`CHIEF_SHIHAN`, `DOMAIN_SHIHAN`, `MASTER_SENSEI`, `SPECIALIST_SENSEI`, `SUB_SENSEI`, `TASK_WORKER`), scoped permissions, resource limits, and model preferences.
- **Agent Registry & Lifecycle Engine (`agent-registry.ts`):** Implements state machines (`REGISTERED` -> `INITIALIZING` -> `READY` -> `RUNNING` -> `COMPLETED` / `TERMINATED`), heartbeat recording, and cascading subagent termination.

### 2.2 Skills Engine (`src/imclaw/skills/`)

- **Permissioned Skill Packages (`skill-types.ts`):** Skills declare strict permission sets (`filesystemRead`, `filesystemWrite`, `networkAccess`, `brokerAccess`, `marketDataAccess`, `channelMessaging`, `memoryRead`, `memoryWrite`).
- Default permission is **DENY** unless explicitly authorized by the manifest and agent profile.

### 2.3 MCP Platform (`src/imclaw/mcp/`)

- **Permissioned Tool Router (`mcp-platform.ts`):** Manages external MCP servers (stdio, sse, websocket), trust levels (`BUILTIN`, `VERIFIED`, `SANDBOXED`), and validates each tool invocation against agent allowlists before routing.

### 2.4 Multi-Tier Memory Engine (`src/imclaw/memory/`)

- **Tiered Architecture (`memory-engine.ts`):** Supports `WORKING`, `SHORT_TERM`, `EPISODIC`, `SEMANTIC`, and `PERMANENT` tiers.
- **Autonomous Consolidation:** Consolidates high-confidence episodic trade observations into generalized semantic patterns.

### 2.5 Reactive Event Bus (`src/imclaw/events/`)

- **Event Distribution (`event-bus.ts`):** Asynchronous publish/subscribe bus for agent lifecycle, market tick data, structural breaks, trade proposals, risk decisions, and workflow completions.

### 2.6 Multi-Agent Delegation & Orchestration (`src/imclaw/orchestration/`)

- **Hierarchical Delegation (`delegation-engine.ts`):** Matches incoming tasks with qualified domain Senseis, instantiating parent-child execution lineages.

### 2.7 Human & Policy Approval Engine (`src/imclaw/approvals/`)

- **Approval Tiers (`approval-engine.ts`):** Evaluates operations against policy tiers (`AUTO_APPROVE` for simulation and market queries, `REQUIRE_CONFIRMATION` for live orders, `REQUIRE_ADMIN` for database mutations).

### 2.8 Model Router (`src/imclaw/models/`)

- **Tiered Routing (`model-router.ts`):** Routes tasks based on complexity, reasoning requirements, vision, and cost constraints (e.g. DeepSeek R1 for fast classification, Claude 3.7 Sonnet for complex multi-timeframe synthesis).

### 2.9 Financial Execution & Deterministic Risk Guard (`src/imclaw/risk/`, `src/imclaw/trading/`, `src/imclaw/journal/`)

- **Non-Bypassable Risk Engine:** Hardcoded mathematical checks on equity, margin, max risk % per trade, daily drawdown stops, and mandatory stop-losses.
- **Financial Execution Pipeline:** Strict sequential flow: `TradeIntent` -> `Risk Guard` -> `ExecutionOrder` -> `Broker Adapter` -> `Fill`.
- **Trade Journal:** Automated post-trade thesis reviews, PnL attribution, and Markdown reporting.
