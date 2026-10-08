/**
 * imClaw Core Index
 * Unified public barrel export for all imClaw platform subsystems.
 */

// 1. Agent Platform & Registry
export * from "./agents/agent-types.js";
export * from "./agents/agent-registry.js";

// 2. Skills Engine
export * from "./skills/skill-types.js";

// 3. MCP Platform
export * from "./mcp/mcp-platform.js";

// 4. Memory Architecture
export * from "./memory/memory-engine.js";

// 5. Event Bus
export * from "./events/event-bus.js";

// 6. Multi-Agent Orchestration & Delegation
export * from "./orchestration/delegation-engine.js";
export * from "./orchestration/session-fencing.js";

// 7. Human & Policy Approvals
export * from "./approvals/approval-engine.js";

// 8. Model Routing
export * from "./models/model-router.js";

// 9. Deterministic Risk Guard
export * from "./risk/risk-types.js";
export * from "./risk/risk-engine.js";

// 10. Financial Trading Execution
export * from "./trading/broker-adapter.js";
export * from "./trading/simulation-adapter.js";
export * from "./trading/execution-pipeline.js";

// 11. Deterministic Workflow Engine
export * from "./workflows/workflow-types.js";
export * from "./workflows/workflow-engine.js";

// 12. Sensei Intelligence & Journal
export * from "./intelligence/sensei-registry.js";
export * from "./intelligence/repetition-guard.js";
export * from "./intelligence/think-scrubber.js";
export * from "./intelligence/speech-director.js";
export * from "./journal/trade-journaler.js";

// 13. Security & Self-Protection
export * from "./security/runtime-self-protection.js";
export * from "./security/finding-ledger.js";
export * from "./security/acl-bitmask.js";

// 14. Organization, Departments & Autonomous Teams
export * from "./organization/organization-types.js";
export * from "./organization/company-registry.js";
export * from "./organization/task-router.js";
export * from "./organization/team-engine.js";
export * from "./organization/learning-engine.js";
export * from "./organization/company-simulation.js";
