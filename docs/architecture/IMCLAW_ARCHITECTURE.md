# imClaw Architecture Blueprint & System Design

**Document ID:** IMCLAW-ARCHITECTURE-SPEC  
**Date:** 2026-10-07  
**Author:** Principal Autonomous Software Architect & Systems Engineering Lead  
**Implementation Repository:** `/home/elogic360/Projects/openclaw`

---

## 1. High-Level Architecture Overview

imClaw is designed as a unified autonomous intelligence operating system built upon OpenClaw's battle-tested daemon gateway and agent runtime, hybridized with superior upstream capabilities and dedicated financial trading systems:

```text
                                 [OPERATOR & CHANNELS]
                   (Web UI / CLI / Telegram / WhatsApp / Slack / Discord)
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                IMCLAW GATEWAY DAEMON                                   │
│  - WebSocket JSON-RPC (501+ Core Methods + imClaw Market Methods)                      │
│  - Token Authority & Group Scoping (Jarvis Registry Pattern)                           │
│  - Security & Credential Redaction Proxy (NemoClaw Filters)                            │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             IMCLAW AGENT & WORKFLOW RUNTIME                            │
│  ┌───────────────────────────────┐               ┌───────────────────────────────────┐ │
│  │     Agent Core Loop           │               │   Deterministic Workflow Engine   │ │
│  │  - Live Mid-Turn Steering     │               │   (n8n Architectural Pattern)     │ │
│  │  - Prompt Caching Boundary    │◄─────────────►│   - DAG Nodes & Triggers          │ │
│  │  - Subagent SQLite Hierarchy  │               │   - Retries, Backoff & Dead-Letter│ │
│  │  - Autonomous Scratchpad      │               │   - Human Approval Gates          │ │
│  └───────────────┬───────────────┘               └─────────────────┬─────────────────┘ │
└──────────────────┼─────────────────────────────────────────────────┼───────────────────┘
                   │                                                 │
                   ▼                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            INTEGRAL MARKET INTELLIGENCE LAYER                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Agent Hierarchy: Chief Shihan ──► Domain Shihan ──► Master Sensei ──► Specialist│  │
│  │  - Market Structure, Orderflow, Liquidity, Wyckoff, Elliott Wave, News Catalysts │  │
│  └──────────────────────────────────────────┬───────────────────────────────────────┘  │
└─────────────────────────────────────────────┼──────────────────────────────────────────┘
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DETERMINISTIC FINANCIAL EXECUTION PIPELINE                      │
│                                                                                        │
│     [Sensei Proposal] ──► [TradeIntent] ──► [DETERMINISTIC RISK GUARD] ──► [Approval]  │
│                                                     │ (Hard Drawdown/Margin/Size Checks│
│                                                     ▼                                  │
│                                           [IM TRADING ENGINE]                          │
│                                     (cTrader Open API / MT5 Bridge)                    │
│                                                     │                                  │
│                                                     ▼                                  │
│                                             [IM JOURNAL]                               │
│                                   (Automated Trade Review & PnL)                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout in `/home/elogic360/Projects/openclaw`

To ensure clean modularity and preserve the upstream OpenClaw upgrade path, imClaw features are organized into dedicated internal modules under `src/imclaw/`:

```text
openclaw/
├── src/
│   ├── imclaw/                         # imClaw Dedicated Domain Systems
│   │   ├── risk/                       # Deterministic Risk Guard (@imclaw/risk-guard)
│   │   │   ├── risk-engine.ts          # Non-bypassable risk validation rules
│   │   │   ├── risk-limits.ts          # Drawdown, leverage, and margin constraints
│   │   │   └── risk-types.ts           # TradeIntent, RiskEvaluation, ApprovalContext
│   │   ├── trading/                    # Financial Execution Engine (@imclaw/trading-engine)
│   │   │   ├── execution-pipeline.ts   # Order lifecycle (Proposal -> Risk -> Exec -> Fill)
│   │   │   ├── broker-adapter.ts       # Abstract broker interface
│   │   │   ├── ctrader-adapter.ts      # cTrader Open API / FIX adapter
│   │   │   ├── mt5-adapter.ts          # MT5 bridge adapter
│   │   │   └── simulation-adapter.ts   # Deterministic Paper/Simulation broker
│   │   ├── workflows/                  # Deterministic Workflow Engine (n8n pattern)
│   │   │   ├── workflow-engine.ts      # DAG executor with dependency resolution
│   │   │   ├── workflow-types.ts       # TriggerNode, ActionNode, ConditionNode
│   │   │   └── node-registry.ts        # Pluggable node library
│   │   ├── intelligence/               # Sensei & Shihan Framework
│   │   │   ├── sensei-registry.ts      # Specialized Sensei roles & prompts
│   │   │   └── market-watcher.ts       # Real-time market state analyzer
│   │   └── journal/                    # IM Journal System
│   │       └── trade-journaler.ts      # Trade logging, PnL attribution, thesis reviews
```

---

## 3. Strict Non-Bypassable Trading Boundary

1. **Trade Intent Construction:** When a Sensei (e.g. `OrderflowSensei`) identifies an entry setup, it generates a structured `TradeIntent`.
2. **Deterministic Risk Guard Execution:**
   - The agent CANNOT call the broker adapter directly.
   - The `TradeIntent` MUST be evaluated by `RiskEngine.evaluate(intent)`.
   - The engine deterministically validates:
     - Account equity & margin requirements.
     - Maximum risk percentage per trade (default 1.0%).
     - Daily and weekly drawdown limits (default 5.0%).
     - Risk-to-Reward ratio (default minimum 1.5).
     - Spread and slippage thresholds.
3. **Execution Routing:**
   - If `RiskEvaluation.status === "APPROVED"`: Passes to `ExecutionPipeline` in active execution mode (`SIMULATION`, `PAPER`, or `LIVE`).
   - If `RiskEvaluation.status === "REJECTED"`: Order is halted and reason logged to audit trail.
