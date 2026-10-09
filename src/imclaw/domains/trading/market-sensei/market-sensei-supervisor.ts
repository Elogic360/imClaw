/**
 * imClaw Market Sensei Autonomous Supervisor
 * Coordinates specialist trading senseis, calculates confluence, formulates TradeIntent,
 * and passes it through the non-bypassable Risk Engine.
 */

import crypto from "node:crypto";
import {
  ConfluenceEngine,
  type SpecialistVote,
  type ConfluenceReport,
} from "../confluence/confluence-engine.js";
import { DeterministicRiskEngine } from "../risk/risk-engine.js";
import type { AccountRiskState, RiskEvaluationResult, TradeIntent } from "../risk/risk-types.js";

export interface MarketSenseiProposal {
  intent: TradeIntent;
  confluence: ConfluenceReport;
  riskEvaluation: RiskEvaluationResult;
}

export class MarketSenseiSupervisor {
  private confluenceEngine: ConfluenceEngine;
  private riskEngine: DeterministicRiskEngine;

  constructor(confluenceEngine?: ConfluenceEngine, riskEngine?: DeterministicRiskEngine) {
    this.confluenceEngine = confluenceEngine ?? new ConfluenceEngine();
    this.riskEngine = riskEngine ?? new DeterministicRiskEngine();
  }

  public analyzeAndProposeTrade(
    symbol: string,
    currentPrice: number,
    votes: SpecialistVote[],
    accountState: AccountRiskState,
    tradeDetails: {
      stopLossPrice: number;
      takeProfitPrice?: number;
      lotSize?: number;
    },
  ): MarketSenseiProposal {
    const confluence = this.confluenceEngine.evaluateVotes(symbol, votes);

    if (confluence.recommendedAction === "NO_TRADE" || confluence.recommendedAction === "WAIT") {
      const emptyIntent: TradeIntent = {
        intentId: `intent-${crypto.randomBytes(4).toString("hex")}`,
        symbol,
        direction: "BUY",
        volumeLots: 0,
        stopLossPrice: 0,
        proposedBySensei: "market-sensei-supervisor",
        rationale: `Confluence evaluation resulted in ${confluence.recommendedAction}. Agreement ratio: ${confluence.agreementRatio}`,
        timestamp: Date.now(),
      };

      return {
        intent: emptyIntent,
        confluence,
        riskEvaluation: {
          decision: "REJECTED",
          approved: false,
          reasons: [
            `Action withheld: Confluence engine recommended ${confluence.recommendedAction}`,
          ],
          calculatedRiskAmount: 0,
          riskPercentOfEquity: 0,
          evaluatedAt: Date.now(),
        },
      };
    }

    const direction = confluence.recommendedAction === "BUY" ? "BUY" : "SELL";
    const volumeLots = tradeDetails.lotSize ?? 0.1;

    const intent: TradeIntent = {
      intentId: `intent-${crypto.randomBytes(4).toString("hex")}`,
      symbol,
      direction,
      volumeLots,
      entryPrice: currentPrice,
      stopLossPrice: tradeDetails.stopLossPrice,
      takeProfitPrice: tradeDetails.takeProfitPrice,
      proposedBySensei: "market-sensei-supervisor",
      rationale: `Market Sensei Multi-Specialist Confluence (${confluence.confluenceScore}% score, ${confluence.agreementRatio * 100}% consensus).`,
      timestamp: Date.now(),
    };

    // Mandatory deterministic risk evaluation
    const riskEvaluation = this.riskEngine.evaluate(intent, accountState);

    return {
      intent,
      confluence,
      riskEvaluation,
    };
  }
}
