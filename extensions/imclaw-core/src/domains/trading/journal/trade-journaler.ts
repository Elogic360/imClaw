/**
 * imClaw Trade Journal
 * Records trade proposals, execution fills, closed outcomes, and post-trade psychological/technical reviews.
 * Extends OpenClaw's memory wiki paradigms for systematic market learning.
 */

import type { ExecutionOrder } from "../../../adapters/brokers/broker-adapter.js";
import type { RiskEvaluationResult, TradeIntent } from "../risk/risk-types.js";

export interface TradeJournalEntry {
  journalId: string;
  intent: TradeIntent;
  riskEvaluation: RiskEvaluationResult;
  order?: ExecutionOrder;
  reviewStatus:
    | "PENDING_EXECUTION"
    | "ACTIVE_TRADE"
    | "CLOSED_PROFIT"
    | "CLOSED_LOSS"
    | "RISK_REJECTED";
  realizedPnL?: number;
  lessonsLearned?: string[];
  createdAt: number;
  closedAt?: number;
}

export class TradeJournalSystem {
  private entries: Map<string, TradeJournalEntry> = new Map();

  public recordProposal(
    intent: TradeIntent,
    riskEval: RiskEvaluationResult,
    order?: ExecutionOrder,
  ): TradeJournalEntry {
    const journalId = `jnl-${intent.intentId}`;
    const entry: TradeJournalEntry = {
      journalId,
      intent,
      riskEvaluation: riskEval,
      order,
      reviewStatus: riskEval.approved ? "ACTIVE_TRADE" : "RISK_REJECTED",
      createdAt: Date.now(),
    };
    this.entries.set(journalId, entry);
    return entry;
  }

  public closeTrade(
    journalId: string,
    realizedPnL: number,
    lessons: string[] = [],
  ): TradeJournalEntry {
    const entry = this.entries.get(journalId);
    if (!entry) {
      throw new Error(`Journal entry ${journalId} not found`);
    }

    entry.realizedPnL = realizedPnL;
    entry.reviewStatus = realizedPnL >= 0 ? "CLOSED_PROFIT" : "CLOSED_LOSS";
    entry.lessonsLearned = lessons;
    entry.closedAt = Date.now();

    return entry;
  }

  public getEntries(): TradeJournalEntry[] {
    return Array.from(this.entries.values());
  }

  public generateMarkdownReport(journalId: string): string {
    const entry = this.entries.get(journalId);
    if (!entry) return `# Journal Entry ${journalId} Not Found`;

    return `---
journal_id: ${entry.journalId}
symbol: ${entry.intent.symbol}
direction: ${entry.intent.direction}
status: ${entry.reviewStatus}
proposed_by: ${entry.intent.proposedBySensei}
---

# Trade Journal: ${entry.intent.symbol} (${entry.intent.direction})

## 1. Setup Rationale
${entry.intent.rationale}

## 2. Risk Defense Audit
- **Status:** ${entry.riskEvaluation.decision}
- **Calculated Risk:** $${entry.riskEvaluation.calculatedRiskAmount.toFixed(2)} (${entry.riskEvaluation.riskPercentOfEquity.toFixed(2)}% of equity)
- **Risk/Reward:** ${entry.riskEvaluation.riskRewardRatio?.toFixed(2) || "N/A"}

## 3. Execution & Outcome
- **Order ID:** ${entry.order?.orderId || "N/A"}
- **Fill Price:** ${entry.order?.fillPrice || "N/A"}
- **Realized PnL:** ${entry.realizedPnL !== undefined ? `$${entry.realizedPnL.toFixed(2)}` : "Pending"}

## 4. Retrospective & Lessons
${(entry.lessonsLearned || []).map((l) => `- ${l}`).join("\n") || "No notes recorded yet."}
`;
  }
}
