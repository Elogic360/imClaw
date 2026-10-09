/**
 * imClaw Core Index
 * Unified public barrel export with strict layer boundaries:
 * Platform (Core Autonomous Operating System)
 * Domains (Trading, Social, etc.)
 * Adapters (Brokers, Connectors, Protocols)
 */

// 1. Re-export layered architectures
export * from "./platform/index.js";
export * from "./platform/scheduling/scheduler-engine.js";
export * from "./platform/context/context-engine.js";
export * from "./domains/trading/index.js";
export * from "./domains/social/index.js";
export * from "./adapters/index.js";
