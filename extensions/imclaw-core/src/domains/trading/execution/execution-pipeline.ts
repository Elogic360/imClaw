/**
 * imClaw Execution Pipeline
 * Ties together Trade Intent -> Deterministic Risk Engine -> Approval Gate -> Broker Adapter.
 * Guarantees that no order can reach execution without passing through the Risk Guard.
 */

import crypto from "node:crypto";
import type { BrokerAdapter, ExecutionOrder } from "../../../adapters/brokers/broker-adapter.js";
import { SimulationBrokerAdapter } from "../../../adapters/brokers/simulation-adapter.js";
import { DeterministicRiskEngine } from "../risk/risk-engine.js";
import type {
  AccountRiskState,
  ExecutionMode,
  RiskEvaluationResult,
  TradeIntent,
} from "../risk/risk-types.js";

export interface PipelineExecutionResult {
  intentId: string;
  orderId?: string;
  status: "FILLED" | "RISK_REJECTED" | "BROKER_ERROR";
  riskEvaluation: RiskEvaluationResult;
  executedOrder?: ExecutionOrder;
  error?: string;
}

export class FinancialExecutionPipeline {
  private riskEngine: DeterministicRiskEngine;
  private broker: BrokerAdapter;
  private mode: ExecutionMode;

  constructor(
    riskEngine?: DeterministicRiskEngine,
    broker?: BrokerAdapter,
    mode: ExecutionMode = "SIMULATION",
  ) {
    this.riskEngine = riskEngine || new DeterministicRiskEngine();
    this.broker = broker || new SimulationBrokerAdapter();
    this.mode = mode;
  }

  public getExecutionMode(): ExecutionMode {
    return this.mode;
  }

  public setBroker(broker: BrokerAdapter): void {
    this.broker = broker;
  }

  /**
   * Main entrypoint: process a Sensei trade proposal through the full non-bypassable pipeline.
   */
  public async processTradeIntent(
    intent: TradeIntent,
    account: AccountRiskState,
  ): Promise<PipelineExecutionResult> {
    // 1. Mandatory Deterministic Risk Evaluation
    const riskResult = this.riskEngine.evaluate(intent, account);

    if (!riskResult.approved) {
      return {
        intentId: intent.intentId,
        status: "RISK_REJECTED",
        riskEvaluation: riskResult,
      };
    }

    // 2. Construct Execution Order
    const orderId = `im-ord-${crypto.randomUUID()}`;
    const order: ExecutionOrder = {
      orderId,
      intentId: intent.intentId,
      symbol: intent.symbol,
      direction: intent.direction,
      volumeLots: intent.volumeLots,
      entryPrice: intent.entryPrice,
      stopLossPrice: intent.stopLossPrice,
      takeProfitPrice: intent.takeProfitPrice,
      status: "SUBMITTED",
      mode: this.mode,
      createdAt: Date.now(),
    };

    // 3. Dispatch to Broker Adapter
    try {
      if (!this.broker.isConnected()) {
        await this.broker.connect();
      }

      const executed = await this.broker.submitOrder(order);

      return {
        intentId: intent.intentId,
        orderId: executed.orderId,
        status: executed.status === "FILLED" ? "FILLED" : "BROKER_ERROR",
        riskEvaluation: riskResult,
        executedOrder: executed,
      };
    } catch (err) {
      return {
        intentId: intent.intentId,
        orderId,
        status: "BROKER_ERROR",
        riskEvaluation: riskResult,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
