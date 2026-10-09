# imClaw Final Architecture Specification

**Status**: PROPOSED & VERIFIED  
**Version**: 2.0.0  
**Scope**: Autonomous Multi-Agent Organization Operating System

---

## 1. Architectural Layers & Principles

imClaw is organized into strictly layered tiers. Dependencies flow **strictly inward/downward**:

```text
Layer 6: Applications & Presentation (Office UI, Control Dashboard, CLI commands)
   ↓
Layer 5: Integrations & External Adapters (Brokers, Messaging Connectors, CRMs)
   ↓
Layer 4: Domain Capabilities (Trading, Content, Support, Legal, Finance)
   ↓
Layer 3: Autonomous Platform Infrastructure (Org Registry, Task Router, Teams, DAGs)
   ↓
Layer 2: Core Platform Utilities (Memory, EventBus, Governance, Inference Guards)
   ↓
Layer 1: OpenClaw Host Runtime (Daemon, Sessions, Protocol, Gateway, Plugins)
```

### Dependency Invariants

1. **Platform Independence**: Layer 2 and Layer 3 (Platform) **MUST NEVER** import from Layer 4 (Domains). The core organization engine must know nothing about trade orders, tickers, or pips.
2. **Deterministic Risk Isolation**: No domain execution pipeline can bypass the risk engine or approval gates.
3. **Pluggable Domain Interface**: Any new domain (e.g., `domains/healthcare`, `domains/customer-support`) attaches to the platform via `DomainCapabilityDefinition` contracts without altering core platform code.
4. **Single Unified Runtime**: imClaw does NOT run as a separate daemon; it extends the OpenClaw gateway and daemon seamlessly.

---

## 2. Directory Structure Specification

```text
src/imclaw/
├── platform/
│   ├── organization/          # Company, Departments, Specialists, TaskRouter, Teams
│   ├── orchestration/         # Delegation Engine, Session Fencing, Agent Lifecycle
│   ├── workflows/             # Deterministic DAG Workflow Orchestrator
│   ├── memory/                # Multi-Tier Memory (Working, Episodic, Semantic)
│   ├── events/                # In-Process Event Bus & Pub/Sub Topics
│   ├── approvals/             # Human-In-The-Loop Governance & Policy Tiers
│   ├── security/              # ACL Bitmasks, Security Ledger, Self-Protection
│   ├── inference/             # Model Router, Repetition Guard, Think Scrubber
│   ├── mcp/                   # Model Context Protocol Integration & Tooling
│   └── skills/                # Agent Skills Registry & Metadata
│
├── domains/
│   └── trading/               # Financial Trading Domain
│       ├── risk/              # Deterministic Non-Bypassable Risk Engine
│       ├── execution/         # Order Pipelines & Execution Engines
│       ├── journal/           # Post-Session Trade Journal & Review
│       └── intelligence/      # Market Structure Shihan & Persona Profiles
│
├── adapters/                  # Pluggable External Adapters
│   └── brokers/               # Simulation Broker, cTrader, MT5
│
└── index.ts                   # Public Barrel Export
```

---

## 3. Subsystem Boundaries & Classifications

### 3.1 Financial Trading Domain (`domains/trading/`)

- **Responsibility**: Market structure interpretation, trade intent formulation, mathematical risk calculation, and broker order execution.
- **Components**:
  - `risk/risk-engine.ts`: Pure mathematical verification against drawdown limits, leverage caps, and stop-loss rules.
  - `execution/execution-pipeline.ts`: Enforces the invariant pipeline: `Intent -> Risk -> Approval -> Broker`.
  - `intelligence/sensei-registry.ts`: Specialized financial analysis system prompts and agent personas.
- **Decoupling**: The rest of imClaw interacts with trading strictly via standard tasks dispatched by the `TaskRouter` to the `trading` department lead (`chief-trading-shihan`).

### 3.2 Trade Journal (`domains/trading/journal/`)

- **Responsibility**: Tracking trade outcomes, calculating realized PnL, and storing post-trade reviews.
- **Event-Driven Decoupling**: Rather than requiring synchronous core coupling, the Trade Journal listens to `trade:filled` and `trade:closed` events published on the Platform Event Bus.

### 3.3 Workflow Engine (`platform/workflows/`)

- **Responsibility**: Generic, deterministic DAG execution with dependency resolution, parallel execution, retries, and step handlers.
- **Classification**: Platform Capability. All 7 departments (Marketing, Sales, Operations, Finance, Delivery, Trading, Email) utilize the workflow engine to orchestrate complex multi-step processes.

### 3.4 Intelligence & Inference Utilities (`platform/inference/`)

- **Responsibility**: Model routing, LLM output sanitization, and loop prevention.
- `think-scrubber.ts`: Generic regex/stream parser to clean reasoning tokens (`<think>`, `<reasoning>`).
- `repetition-guard.ts`: Detects degenerate repetition loops in autoregressive model generation.
- `model-router.ts`: Dynamically assigns tasks to appropriate model tiers (fast, heavy, reasoning).

---

## 4. Migration Plan

A non-breaking transition plan:

1. **Phase 1: Structure Alignment**:
   - Organize files into `platform/`, `domains/`, and `adapters/`.
   - Update internal relative imports.
2. **Phase 2: Barrel & Route Compatibility**:
   - Update `src/imclaw/index.ts` to re-export all public interfaces from their clean locations.
   - Update `src/gateway/organization-http.ts` imports.
3. **Phase 3: Verification**:
   - Run `pnpm tsgo:core` to guarantee 0 type errors.
   - Run Vitest suite (`imclaw-subsystems.test.ts`) to ensure 100% test pass rate.
   - Test live HTTP endpoints (`/api/imclaw/departments` and `/imclaw/office`).
