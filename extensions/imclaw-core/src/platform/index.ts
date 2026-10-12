/**
 * imClaw Platform Unified Barrel Export
 * Exposes core platform runtime, organizations, orchestration, and capabilities.
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

// 8. Inference, Model Routing & Safety Guards
export * from "./inference/model-router.js";
export * from "./inference/repetition-guard.js";
export * from "./inference/think-scrubber.js";
export * from "./inference/speech-director.js";

// 9. Deterministic Workflow Engine
export * from "./workflows/workflow-types.js";
export * from "./workflows/workflow-engine.js";

// 10. Security & Self-Protection
export * from "./security/runtime-self-protection.js";
export * from "./security/finding-ledger.js";
export * from "./security/acl-bitmask.js";

// 11. Organization, Departments & Autonomous Teams
export * from "./organization/organization-types.js";
export * from "./organization/company-registry.js";
export * from "./organization/task-router.js";
export * from "./organization/team-engine.js";
export * from "./organization/learning-engine.js";
export * from "./organization/company-simulation.js";
