/**
 * Comprehensive Test Suite for imClaw Full Platform:
 * - Deterministic Risk Guard
 * - Financial Execution Pipeline & Simulation Broker
 * - Deterministic Workflow Engine (DAG, triggers, branching)
 * - Trade Journal System
 * - Agent Platform (Registry & Lifecycle State Transitions)
 * - Skills Engine & Permission Validation
 * - MCP Platform & Tool Access Authorization
 * - Multi-Tier Memory Engine & Consolidation
 * - Reactive Event Bus
 * - Delegation & Orchestration Engine
 * - Human & Policy Approval Engine
 * - Model Routing & Cost Optimization
 */

import { describe, expect, it } from "vitest";
import {
  AgentRegistry,
  ApprovalEngine,
  DeterministicRiskEngine,
  DeterministicWorkflowEngine,
  DelegationEngine,
  FinancialExecutionPipeline,
  ImClawEventBus,
  McpPlatformManager,
  ModelRouter,
  MultiTierMemoryEngine,
  SkillRegistry,
  TradeJournalSystem,
  RepetitionGuard,
  StreamingThinkScrubber,
  RuntimeSelfProtection,
  SessionClaimFencing,
  SecurityFindingLedger,
  AclPermissionAuthority,
  PERM_BITS,
  SpeechDirectorPacing,
  isCompletedWorkflowStatus,
  isTerminalWorkflowStatus,
  CompanyRegistry,
  TaskRouter,
  AgentTeamEngine,
  LearningEngine,
  CompanySimulationOrchestrator,
  type AccountRiskState,
  type AgentProfile,
  type TradeIntent,
  type WorkflowDefinition,
} from "./index.js";

describe("imClaw Risk Guard (DeterministicRiskEngine)", () => {
  const baseAccount: AccountRiskState = {
    accountId: "ACC-TEST-001",
    broker: "simulation",
    equity: 100000,
    balance: 100000,
    freeMargin: 100000,
    usedMargin: 0,
    dailyStartingEquity: 100000,
    dailyRealizedPnL: 0,
    dailyUnrealizedPnL: 0,
    openPositionsCount: 0,
    currentDrawdownPercent: 0,
  };

  it("approves a compliant trade intent meeting all risk parameters", () => {
    const engine = new DeterministicRiskEngine({ maxRiskPercentPerTrade: 1.0 });
    const intent: TradeIntent = {
      intentId: "INT-001",
      symbol: "EURUSD",
      direction: "BUY",
      volumeLots: 1.0,
      entryPrice: 1.085,
      stopLossPrice: 1.08,
      takeProfitPrice: 1.095,
      proposedBySensei: "MarketStructureSensei",
      rationale: "Bullish BOS on H4 and tap into 15m order block.",
      timestamp: Date.now(),
    };

    const result = engine.evaluate(intent, baseAccount);
    expect(result.approved).toBe(true);
    expect(result.decision).toBe("APPROVED");
    expect(result.reasons).toHaveLength(0);
    expect(result.riskRewardRatio).toBeCloseTo(2.0, 1);
  });

  it("strictly REJECTS a trade exceeding maximum risk percentage per trade", () => {
    const engine = new DeterministicRiskEngine({ maxRiskPercentPerTrade: 1.0 });
    const dangerousIntent: TradeIntent = {
      intentId: "INT-DANGER",
      symbol: "EURUSD",
      direction: "BUY",
      volumeLots: 5.0,
      entryPrice: 1.085,
      stopLossPrice: 1.08,
      takeProfitPrice: 1.095,
      proposedBySensei: "AggressiveTrader",
      rationale: "Oversized lot attempt.",
      timestamp: Date.now(),
    };

    const result = engine.evaluate(dangerousIntent, baseAccount);
    expect(result.approved).toBe(false);
    expect(result.decision).toBe("REJECTED");
    expect(result.reasons.some((r) => r.includes("exceeds maximum risk limit"))).toBe(true);
  });

  it("strictly REJECTS a trade if daily drawdown limit is reached", () => {
    const engine = new DeterministicRiskEngine({ maxDailyDrawdownPercent: 4.0 });
    const damagedAccount: AccountRiskState = {
      ...baseAccount,
      dailyRealizedPnL: -4500,
    };

    const intent: TradeIntent = {
      intentId: "INT-DRAWDOWN",
      symbol: "EURUSD",
      direction: "BUY",
      volumeLots: 0.5,
      entryPrice: 1.085,
      stopLossPrice: 1.08,
      takeProfitPrice: 1.095,
      proposedBySensei: "ScalpingSensei",
      rationale: "Attempting to trade while in drawdown.",
      timestamp: Date.now(),
    };

    const result = engine.evaluate(intent, damagedAccount);
    expect(result.approved).toBe(false);
    expect(result.reasons.some((r) => r.includes("Daily drawdown limit exceeded"))).toBe(true);
  });

  it("strictly REJECTS a trade with missing or invalid Stop Loss", () => {
    const engine = new DeterministicRiskEngine({ enforceStopLoss: true });
    const invalidIntent: TradeIntent = {
      intentId: "INT-NO-SL",
      symbol: "GBPUSD",
      direction: "BUY",
      volumeLots: 0.1,
      entryPrice: 1.25,
      stopLossPrice: 0,
      proposedBySensei: "RogueAgent",
      rationale: "No stop loss setup.",
      timestamp: Date.now(),
    };

    const result = engine.evaluate(invalidIntent, baseAccount);
    expect(result.approved).toBe(false);
    expect(result.reasons.some((r) => r.includes("Stop Loss is strictly mandatory"))).toBe(true);
  });
});

describe("imClaw Financial Execution Pipeline", () => {
  const baseAccount: AccountRiskState = {
    accountId: "ACC-SIM-01",
    broker: "simulation",
    equity: 50000,
    balance: 50000,
    freeMargin: 50000,
    usedMargin: 0,
    dailyStartingEquity: 50000,
    dailyRealizedPnL: 0,
    dailyUnrealizedPnL: 0,
    openPositionsCount: 0,
    currentDrawdownPercent: 0,
  };

  it("executes an approved trade through the simulation broker", async () => {
    const pipeline = new FinancialExecutionPipeline();
    const intent: TradeIntent = {
      intentId: "INT-EXEC-01",
      symbol: "EURUSD",
      direction: "BUY",
      volumeLots: 0.5,
      entryPrice: 1.085,
      stopLossPrice: 1.082,
      takeProfitPrice: 1.092,
      proposedBySensei: "OrderflowSensei",
      rationale: "Institutional absorption at 1.085 level.",
      timestamp: Date.now(),
    };

    const outcome = await pipeline.processTradeIntent(intent, baseAccount);
    expect(outcome.status).toBe("FILLED");
    expect(outcome.executedOrder).toBeDefined();
    expect(outcome.executedOrder?.status).toBe("FILLED");
    expect(outcome.executedOrder?.brokerOrderId).toMatch(/^sim-/);
  });

  it("halts execution immediately when the risk engine rejects", async () => {
    const pipeline = new FinancialExecutionPipeline();
    const badIntent: TradeIntent = {
      intentId: "INT-FAIL-01",
      symbol: "EURUSD",
      direction: "BUY",
      volumeLots: 10.0,
      entryPrice: 1.08,
      stopLossPrice: 1.07,
      proposedBySensei: "OverleverageAgent",
      rationale: "Excessive volume.",
      timestamp: Date.now(),
    };

    const outcome = await pipeline.processTradeIntent(badIntent, baseAccount);
    expect(outcome.status).toBe("RISK_REJECTED");
    expect(outcome.executedOrder).toBeUndefined();
  });
});

describe("imClaw Workflow Engine (Deterministic DAG)", () => {
  it("executes a conditional trading workflow with branching and notification", async () => {
    const engine = new DeterministicWorkflowEngine();

    engine.registerHandler("action:sensei_analyze", async () => {
      return { signal: "BULLISH_ORDERFLOW", confidence: 0.92, shouldTrade: true };
    });

    const workflow: WorkflowDefinition = {
      workflowId: "WF-DAILY-OPEN",
      name: "London Open Breakout Workflow",
      description: "Scans for liquidity sweep and sends notification if trade setup exists.",
      enabled: true,
      createdAt: Date.now(),
      nodes: [
        {
          id: "node-scanner",
          name: "Sensei Market Analysis",
          type: "action:sensei_analyze",
          parameters: { symbol: "EURUSD" },
        },
        {
          id: "node-condition",
          name: "Check Signal Exists",
          type: "condition:if",
          parameters: { field: "shouldTrade", equals: true },
        },
        {
          id: "node-notify",
          name: "Send Telegram Alert",
          type: "action:send_notification",
          parameters: { channel: "telegram", message: "Setup detected by Sensei!" },
        },
      ],
      connections: [
        { fromNodeId: "node-scanner", toNodeId: "node-condition" },
        { fromNodeId: "node-condition", toNodeId: "node-notify", conditionBranch: "true" },
      ],
    };

    const run = await engine.executeWorkflow(workflow);
    expect(run.status).toBe("COMPLETED");
    expect(run.nodeResults.get("node-scanner")?.status).toBe("SUCCESS");
    expect(run.nodeResults.get("node-condition")?.status).toBe("SUCCESS");
    expect(run.nodeResults.get("node-notify")?.status).toBe("SUCCESS");
  });
});

describe("imClaw Trade Journal System", () => {
  it("records trade proposals, fills, and produces markdown reports", () => {
    const journal = new TradeJournalSystem();
    const intent: TradeIntent = {
      intentId: "INT-JNL-01",
      symbol: "GBPUSD",
      direction: "SELL",
      volumeLots: 1.0,
      entryPrice: 1.3,
      stopLossPrice: 1.305,
      takeProfitPrice: 1.29,
      proposedBySensei: "MarketStructureSensei",
      rationale: "Bearish CHoCH on H1 after buy-side liquidity purge.",
      timestamp: Date.now(),
    };

    const entry = journal.recordProposal(
      intent,
      {
        decision: "APPROVED",
        approved: true,
        reasons: [],
        calculatedRiskAmount: 500,
        riskPercentOfEquity: 0.5,
        riskRewardRatio: 2.0,
        evaluatedAt: Date.now(),
      },
      {
        orderId: "ORD-001",
        intentId: intent.intentId,
        symbol: intent.symbol,
        direction: intent.direction,
        volumeLots: intent.volumeLots,
        entryPrice: intent.entryPrice,
        stopLossPrice: intent.stopLossPrice,
        status: "FILLED",
        mode: "SIMULATION",
        fillPrice: 1.2998,
        createdAt: Date.now(),
      },
    );

    expect(entry.reviewStatus).toBe("ACTIVE_TRADE");

    const closed = journal.closeTrade(entry.journalId, 1000, [
      "Followed liquidity sweep cleanly",
      "Partial profit taken at TP1",
    ]);

    expect(closed.reviewStatus).toBe("CLOSED_PROFIT");
    expect(closed.realizedPnL).toBe(1000);

    const markdown = journal.generateMarkdownReport(entry.journalId);
    expect(markdown).toContain("# Trade Journal: GBPUSD (SELL)");
    expect(markdown).toContain("Realized PnL:");
    expect(markdown).toContain("$1000.00");
    expect(markdown).toContain("Bearish CHoCH on H1");
  });
});

describe("imClaw Agent Platform (Registry & Lifecycle)", () => {
  it("registers an agent profile, spawns instances, transitions states, and cascades termination", () => {
    const registry = new AgentRegistry();
    const profile: AgentProfile = {
      id: "shihan-market",
      name: "Market Shihan",
      description: "Master Market Intelligence Coordinator",
      version: "1.0.0",
      role: "DOMAIN_SHIHAN",
      domain: "Market Analysis",
      systemPrompt: "Coordinate market intelligence.",
      requiredSkills: ["orderflow-skill"],
      optionalSkills: [],
      requiredMcpServers: ["market-data-mcp"],
      permissions: {
        filesystem: "READ_WORKSPACE",
        network: "ALLOWLISTED",
        shellExecution: "CONTAINER_ONLY",
        maxConcurrentTasks: 5,
        allowedChannels: ["telegram"],
        allowedWorkflows: ["wf-daily-scan"],
        trading: {
          canReadMarketData: true,
          canReadAccounts: true,
          canCreateOrders: true,
          canModifyOrders: false,
          canModifyPositions: false,
          canClosePositions: false,
          canExecuteLiveTrades: false,
        },
      },
      resourceLimits: {
        maxMemoryMb: 512,
        timeoutMs: 30000,
        maxDailyCostUsd: 5.0,
        maxTokensPerTurn: 4000,
      },
      modelPreferences: { primaryModel: "claude-sonnet" },
    };

    registry.registerProfile(profile);
    const parent = registry.createInstance("shihan-market");
    expect(parent.state).toBe("REGISTERED");

    registry.transitionState(parent.instanceId, "READY");
    expect(registry.getInstance(parent.instanceId)?.state).toBe("READY");

    const child = registry.createInstance("shihan-market", parent.instanceId);
    expect(registry.getInstance(parent.instanceId)?.childInstanceIds).toContain(child.instanceId);

    // Terminating parent cascades to child
    registry.terminateInstance(parent.instanceId);
    expect(registry.getInstance(parent.instanceId)?.state).toBe("TERMINATED");
    expect(registry.getInstance(child.instanceId)?.state).toBe("TERMINATED");
  });
});

describe("imClaw Skills Engine & Permissions", () => {
  it("validates skill permission grants against policy checks", () => {
    const registry = new SkillRegistry();
    registry.registerSkill({
      id: "orderflow-analyzer",
      name: "Orderflow Analyzer",
      description: "Parses volume imbalance footprint",
      version: "1.0.0",
      author: "Integral Market",
      permissions: {
        filesystemRead: true,
        filesystemWrite: false,
        networkAccess: false,
        brokerAccess: false,
        marketDataAccess: true,
        channelMessaging: false,
        memoryRead: true,
        memoryWrite: true,
      },
      toolsProvided: ["analyze_imbalance"],
      systemInstructions: "Identify institutional footprint.",
    });

    expect(registry.validatePermissions("orderflow-analyzer", "marketDataAccess")).toBe(true);
    expect(registry.validatePermissions("orderflow-analyzer", "brokerAccess")).toBe(false);
  });
});

describe("imClaw MCP Platform Manager", () => {
  it("restricts MCP tool invocations according to agent allowlists", () => {
    const manager = new McpPlatformManager();
    manager.registerServer({
      id: "ctrader-live",
      name: "cTrader Live Gateway",
      version: "1.0.0",
      transport: "websocket",
      trustLevel: "VERIFIED",
      allowedAgents: ["execution-sensei"],
      exposedTools: ["place_order", "close_position"],
      networkPolicy: "ALLOWLIST",
    });

    // Allowed agent succeeds
    const allowed = manager.isToolInvocationPermitted(
      "execution-sensei",
      "ctrader-live",
      "place_order",
    );
    expect(allowed.permitted).toBe(true);

    // Unauthorized agent is rejected
    const denied = manager.isToolInvocationPermitted(
      "research-sensei",
      "ctrader-live",
      "place_order",
    );
    expect(denied.permitted).toBe(false);
    expect(denied.reason).toContain("is not authorized");
  });
});

describe("imClaw Memory Engine (Multi-Tier & Consolidation)", () => {
  it("stores tiered memories and consolidates high-confidence episodic memories to semantic tier", () => {
    const memory = new MultiTierMemoryEngine();

    memory.store({
      tier: "EPISODIC",
      agentId: "orderflow-sensei",
      content: "Repeated liquidity absorption observed at London Open 1.0850 level.",
      tags: ["EURUSD", "liquidity"],
      confidence: 0.95,
      provenance: { source: "market_analysis" },
    });

    const initial = memory.query("orderflow-sensei", { tier: "EPISODIC" });
    expect(initial).toHaveLength(1);

    const report = memory.consolidate("orderflow-sensei");
    expect(report.consolidatedCount).toBe(1);

    const semantic = memory.query("orderflow-sensei", { tier: "SEMANTIC" });
    expect(semantic).toHaveLength(1);
    expect(semantic[0].content).toContain("1.0850 level");
  });
});

describe("imClaw Reactive Event Bus", () => {
  it("dispatches events asynchronously to registered subscribers", async () => {
    const bus = new ImClawEventBus();
    const received: string[] = [];

    bus.subscribe("market.structure_break", async (evt) => {
      received.push(String((evt.payload as Record<string, unknown>).symbol));
    });

    await bus.emit("market.structure_break", "StructureSensei", {
      symbol: "GBPUSD",
      direction: "BULLISH",
    });
    expect(received).toEqual(["GBPUSD"]);
  });
});

describe("imClaw Delegation & Orchestration Engine", () => {
  it("delegates tasks hierarchically to matching domain profiles", () => {
    const registry = new AgentRegistry();
    registry.registerProfile({
      id: "risk-sentinel",
      name: "Risk Defense Sentinel",
      description: "Capital Preservation Agent",
      version: "1.0.0",
      role: "SPECIALIST_SENSEI",
      domain: "Risk Management",
      systemPrompt: "Defend trading capital.",
      requiredSkills: [],
      optionalSkills: [],
      requiredMcpServers: [],
      permissions: {
        filesystem: "DENY",
        network: "DENY",
        shellExecution: "DENY",
        maxConcurrentTasks: 2,
        allowedChannels: [],
        allowedWorkflows: [],
        trading: {
          canReadMarketData: false,
          canReadAccounts: true,
          canCreateOrders: false,
          canModifyOrders: false,
          canModifyPositions: false,
          canClosePositions: true,
          canExecuteLiveTrades: false,
        },
      },
      resourceLimits: {
        maxMemoryMb: 256,
        timeoutMs: 10000,
        maxDailyCostUsd: 1.0,
        maxTokensPerTurn: 2000,
      },
      modelPreferences: { primaryModel: "gemini-flash" },
    });

    const orchestrator = new DelegationEngine(registry);
    const result = orchestrator.delegateTask({
      taskId: "task-risk-check",
      taskType: "AUDIT",
      requiredDomain: "Risk Management",
      payload: { tradeLots: 2.0 },
      priority: "HIGH",
    });

    expect(result.status).toBe("DELEGATED");
    expect(result.delegatedToProfileId).toBe("risk-sentinel");
  });
});

describe("imClaw Approval & Model Router Engines", () => {
  it("enforces human confirmation on live trades and auto-approves simulation trades", () => {
    const approval = new ApprovalEngine();
    const simReq = approval.createRequest("SIMULATION_TRADE", "sensei-01", { volume: 1.0 });
    expect(simReq.status).toBe("APPROVED");

    const liveReq = approval.createRequest("LIVE_TRADE", "sensei-01", { volume: 1.0 });
    expect(liveReq.status).toBe("PENDING");
    expect(liveReq.tier).toBe("REQUIRE_CONFIRMATION");

    const decided = approval.decide(liveReq.requestId, true, "OPERATOR-ADMIN");
    expect(decided.status).toBe("APPROVED");
    expect(decided.decidedBy).toBe("OPERATOR-ADMIN");
  });

  it("routes simple tasks to fast models and complex reasoning to frontier models", () => {
    const router = new ModelRouter();
    expect(router.selectModel({ complexity: "SIMPLE" })).toBe("deepseek-r1");
    expect(router.selectModel({ complexity: "COMPLEX" })).toBe("claude-sonnet");
    expect(router.selectModel({ complexity: "MEDIUM" })).toBe("gemini-flash");
  });
});

describe("imClaw Hermes Intelligence & Security Integrations", () => {
  it("detects degenerative model repetition loops via RepetitionGuard", () => {
    const guard = new RepetitionGuard({
      minFragmentLength: 100,
      repeatWindow: 20,
      minRepeatCount: 4,
      dominanceRatio: 0.5,
    });

    const normalText =
      "Here is an analysis of market structure. We observe order blocks at 1.0850 and fair value gaps at 1.0820.";
    expect(guard.isRepetitionDominated(normalText)).toBe(false);

    const loopedFragment = "LOOPING_PATTERN_HERE";
    const degenerativeText = loopedFragment.repeat(8);
    expect(guard.isRepetitionDominated(degenerativeText)).toBe(true);
  });

  it("scrubs internal reasoning scratchpads via StreamingThinkScrubber", () => {
    const scrubber = new StreamingThinkScrubber();
    const rawOutput =
      "Hello trader! <think>Evaluating order flow imbalance at support...</think> Buy signal confirmed.";
    const result = scrubber.scrubText(rawOutput);

    expect(result.cleanText).toBe("Hello trader!  Buy signal confirmed.");
    expect(result.reasoning).toBe("Evaluating order flow imbalance at support...");
  });

  it("protects runtime from destructive deletion commands via RuntimeSelfProtection", () => {
    const protection = new RuntimeSelfProtection({
      workspaceRoot: "/home/elogic360/Projects/imClaw",
    });

    const safeCmd = "rm -rf /tmp/scratch_cache_123";
    expect(protection.isCommandSafe(safeCmd).safe).toBe(true);

    const dangerousNodeModules = "rm -rf node_modules";
    const check1 = protection.isCommandSafe(dangerousNodeModules);
    expect(check1.safe).toBe(false);
    expect(check1.reason).toContain("Self-protection violation");

    const dangerousSrc = "rm -rf src/imclaw";
    const check2 = protection.isCommandSafe(dangerousSrc);
    expect(check2.safe).toBe(false);
  });
});

describe("imClaw NanoClaw Coordination & Fencing Integrations", () => {
  it("enforces Compare-And-Swap (CAS) session claim fencing across incarnations", () => {
    const fencing = new SessionClaimFencing(10000);
    const sessionId = "session-forex-scalper";

    // Worker 1 claims incarnation 1
    const claim1 = fencing.tryClaimSession(sessionId, "worker-1");
    expect(claim1.success).toBe(true);
    expect(claim1.claim?.incarnation).toBe(1);

    // Worker 2 attempts claim while lease is active without expected incarnation -> rejected
    const failedClaim = fencing.tryClaimSession(sessionId, "worker-2");
    expect(failedClaim.success).toBe(false);

    // Worker 1 renews / increments incarnation via CAS
    const claim2 = fencing.tryClaimSession(sessionId, "worker-1", 1);
    expect(claim2.success).toBe(true);
    expect(claim2.claim?.incarnation).toBe(2);

    // Stale worker using incarnation 1 is fenced out
    expect(fencing.isClaimValid(sessionId, "worker-1", 1)).toBe(false);
    expect(fencing.isClaimValid(sessionId, "worker-1", 2)).toBe(true);

    // Clean release
    expect(fencing.releaseClaim(sessionId, "worker-1", 2)).toBe(true);
    expect(fencing.getClaim(sessionId)).toBeUndefined();
  });
});

describe("imClaw NemoClaw Governance & Blocker Gate Integrations", () => {
  it("records findings, computes deterministic SHA-256 fingerprint, and enforces blocker gates", () => {
    const ledger = new SecurityFindingLedger();

    // Record non-blocking P2 finding
    ledger.recordFinding({
      id: "FIND-001",
      severity: "P2",
      kind: "code-quality",
      summary: "Minor naming style inconsistency",
      sourceModule: "market-analysis",
    });

    const summary1 = ledger.getLedgerSummary();
    expect(summary1.totalFindings).toBe(1);
    expect(summary1.p2Count).toBe(1);
    expect(summary1.fingerprint).toBeDefined();

    // Blocker gate should be cleared with only P2
    const gate1 = ledger.evaluateBlockerGate();
    expect(gate1.cleared).toBe(true);

    // Record critical P0 finding
    ledger.recordFinding({
      id: "FIND-002",
      severity: "P0",
      kind: "credential-access",
      summary: "Attempted plain text access to broker API secret",
      sourceModule: "auth-guard",
    });

    const summary2 = ledger.getLedgerSummary();
    expect(summary2.p0Count).toBe(1);
    expect(summary2.fingerprint).not.toBe(summary1.fingerprint);

    // Blocker gate must trip and block execution
    const gate2 = ledger.evaluateBlockerGate();
    expect(gate2.cleared).toBe(false);
    expect(gate2.blockingFindings.length).toBe(1);
    expect(gate2.blockingFindings[0]?.id).toBe("FIND-002");
  });
});

describe("imClaw Jarvis Security & ACL Authority Integrations", () => {
  it("evaluates binary bitmask permissions across roles and resource types", () => {
    const acl = new AclPermissionAuthority();

    // Agent 1 is given viewer role on tools
    acl.grantRole("agent-viewer-01", "role-viewer");
    expect(acl.hasPermission("agent-viewer-01", "tools", PERM_BITS.READ)).toBe(true);
    expect(acl.hasPermission("agent-viewer-01", "tools", PERM_BITS.EXECUTE)).toBe(false);

    // Agent 2 is given simulation trader role on trading
    acl.grantRole("agent-trader-01", "role-trader-sim");
    expect(acl.hasPermission("agent-trader-01", "trading", PERM_BITS.TRADE_EXECUTE)).toBe(true);
    expect(acl.hasPermission("agent-trader-01", "trading", PERM_BITS.LIVE_CAPITAL)).toBe(false);

    // Live trader role grants live capital bit
    acl.grantRole("agent-trader-live", "role-trader-live");
    expect(acl.hasPermission("agent-trader-live", "trading", PERM_BITS.LIVE_CAPITAL)).toBe(true);
  });
});

describe("imClaw Mimoclaw Speech Director & Prosody Pacing Integrations", () => {
  it("formats urgency prosody tags and compiles complete director mode prompt blocks", () => {
    const director = new SpeechDirectorPacing();

    // Critical urgency formatting
    const criticalSpeech = director.formatSpeechOutput("Trailing Stop hit on EURUSD", "CRITICAL");
    expect(criticalSpeech).toContain("(urgent, authoritative)");
    expect(criticalSpeech).toContain("Immediate action required.");

    // Calm urgency formatting
    const calmSpeech = director.formatSpeechOutput("Daily session closed with 2.1% profit", "CALM");
    expect(calmSpeech).toContain("(calm, relaxed breath)");

    // Full director prompt compilation
    const prompt = director.compileDirectorPrompt("Order filled at 1.0850", "URGENT");
    expect(prompt).toContain("[Role]:");
    expect(prompt).toContain("[Scene]:");
    expect(prompt).toContain("[Direction]:");
    expect(prompt).toContain("[Script]:");
    expect(prompt).toContain("(focused, rapid pace)");
  });
});

describe("imClaw n8n Clean-Room Workflow Architecture Integrations", () => {
  it("validates workflow execution status predicates", () => {
    expect(isCompletedWorkflowStatus("COMPLETED")).toBe(true);
    expect(isCompletedWorkflowStatus("FAILED")).toBe(true);
    expect(isCompletedWorkflowStatus("CANCELED")).toBe(true);
    expect(isCompletedWorkflowStatus("RUNNING")).toBe(false);
    expect(isTerminalWorkflowStatus("COMPLETED")).toBe(true);
  });

  it("retries failed workflow nodes when retryOnFailure is configured", async () => {
    const engine = new DeterministicWorkflowEngine();
    let invocationCount = 0;

    engine.registerHandler("action:flaky_task", async () => {
      invocationCount++;
      if (invocationCount < 3) {
        throw new Error("Temporary network glitch");
      }
      return { success: true, attemptsNeeded: invocationCount };
    });

    const workflow: WorkflowDefinition = {
      workflowId: "WF-RETRY-TEST",
      name: "Retry Test Workflow",
      description: "Tests automated node retry with clean-room backoff loop",
      enabled: true,
      createdAt: Date.now(),
      nodes: [
        {
          id: "node-flaky",
          name: "Flaky Action",
          type: "action:flaky_task",
          parameters: {},
          retryOnFailure: true,
          maxRetries: 3,
        },
      ],
      connections: [],
    };

    const run = await engine.executeWorkflow(workflow);
    expect(run.status).toBe("COMPLETED");
    const nodeResult = run.nodeResults.get("node-flaky");
    expect(nodeResult?.status).toBe("SUCCESS");
    expect(nodeResult?.attempts).toBe(3);
    expect(invocationCount).toBe(3);
  });
});

describe("imClaw Autonomous Organization & Multi-Agent Department Simulation", () => {
  it("initializes CompanyRegistry with 6 core business departments, Trading, and specialist desks", () => {
    const registry = new CompanyRegistry();
    const depts = registry.getAllDepartments();
    expect(depts.length).toBeGreaterThanOrEqual(7);

    const mkt = registry.getDepartment("marketing");
    expect(mkt).toBeDefined();
    expect(mkt?.leadId).toBe("mlead");

    const mktAgents = registry.getDepartmentAgents("marketing");
    expect(mktAgents.length).toBeGreaterThanOrEqual(4);

    const fin = registry.getDepartment("finance");
    expect(fin?.requiresApprovalForActions).toBe(true);
    expect(fin?.leadId).toBe("alead");

    const trading = registry.getDepartment("trading");
    expect(trading?.leadId).toBe("chief-trading-shihan");
  });

  it("routes requests deterministically to appropriate departments and leads via TaskRouter", () => {
    const registry = new CompanyRegistry();
    const router = new TaskRouter(registry);

    const r1 = router.routeRequest(
      "Team: Create a brand campaign and social media announcements for Integral Market",
    );
    expect(r1.departmentId).toBe("marketing");
    expect(r1.targetLead.id).toBe("mlead");
    expect(r1.requiresTeam).toBe(true);

    const r2 = router.routeRequest("Analyze BTC liquidity sweeps and fair value gaps");
    expect(r2.departmentId).toBe("trading");
    expect(r2.targetLead.id).toBe("chief-trading-shihan");

    const r3 = router.routeRequest("Reconcile monthly ledger balances and cashflow statements");
    expect(r3.departmentId).toBe("finance");
    expect(r3.targetLead.id).toBe("alead");
  });

  it("executes an autonomous multi-agent team task with concurrent specialist execution and lead synthesis", async () => {
    const registry = new CompanyRegistry();
    const teamEngine = new AgentTeamEngine(registry);

    const plan = await teamEngine.executeTeamTask(
      "marketing",
      "Launch Q4 Growth Sprint for Integral Market",
      3,
    );

    expect(plan.status).toBe("COMPLETED");
    expect(plan.leadId).toBe("mlead");
    expect(plan.subTasks.length).toBeGreaterThanOrEqual(2);
    expect(plan.subTasks.every((t) => t.status === "COMPLETED")).toBe(true);
    expect(plan.notes.length).toBeGreaterThanOrEqual(2);
    expect(plan.synthesizedResult).toContain("[Marketing Lead Synthesis]");
  });

  it("captures operator corrections and promotes validated lessons via LearningEngine", () => {
    const learning = new LearningEngine(0.85);

    // Casual correction
    learning.ingestCorrection(
      "emails",
      "Revise: Always sign client correspondence with official company email footer",
    );
    const rules = learning.getStandingRules("emails");
    expect(rules.length).toBe(1);
    expect(rules[0]?.ruleStatement).toContain("Always sign client correspondence");
    expect(rules[0]?.approved).toBe(true);
  });

  it("executes an end-to-end company simulation scenario through CompanySimulationOrchestrator", async () => {
    const sim = new CompanySimulationOrchestrator();

    // Scenario: Team Marketing Sprint
    const result = await sim.executeCompanyTask(
      "Team: Build a multi-channel campaign for Integral Market expansion",
    );

    expect(result.route.departmentId).toBe("marketing");
    expect(result.route.requiresTeam).toBe(true);
    expect(result.teamPlan).toBeDefined();
    expect(result.teamPlan?.status).toBe("COMPLETED");
    expect(result.finalDeliverable).toContain("[Marketing Lead Synthesis]");
    expect(result.requiresApproval).toBe(true);
    expect(result.approvalStatus).toBe("PENDING_CONFIRMATION");
  });
});
