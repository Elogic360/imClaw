/**
 * imClaw Risk Guard — Deterministic Risk Engine
 * Implements non-bypassable risk validation rules.
 * An autonomous agent/LLM can NEVER execute a trade that fails these mathematical checks.
 */

import type {
  AccountRiskState,
  RiskEvaluationResult,
  RiskPolicy,
  TradeIntent,
} from "./risk-types.js";

export const DEFAULT_CONSERVATIVE_POLICY: RiskPolicy = {
  maxRiskPercentPerTrade: 1.0, // 1% max per trade
  maxDailyDrawdownPercent: 4.0, // 4% max daily drawdown
  maxWeeklyDrawdownPercent: 8.0, // 8% max weekly drawdown
  maxOpenPositions: 4,
  minRiskRewardRatio: 1.5,
  maxLeverage: 30,
  enforceStopLoss: true,
  prohibitedSymbols: [],
};

export class DeterministicRiskEngine {
  private policy: RiskPolicy;

  constructor(policy: Partial<RiskPolicy> = {}) {
    this.policy = { ...DEFAULT_CONSERVATIVE_POLICY, ...policy };
  }

  public updatePolicy(newPolicy: Partial<RiskPolicy>): void {
    this.policy = { ...this.policy, ...newPolicy };
  }

  public getPolicy(): Readonly<RiskPolicy> {
    return Object.freeze({ ...this.policy });
  }

  /**
   * Deterministically evaluate a proposed TradeIntent against account state and hard risk limits.
   */
  public evaluate(intent: TradeIntent, account: AccountRiskState): RiskEvaluationResult {
    const reasons: string[] = [];
    const now = Date.now();

    // 1. Mandatory Stop Loss Check
    if (this.policy.enforceStopLoss && (!intent.stopLossPrice || intent.stopLossPrice <= 0)) {
      reasons.push("Stop Loss is strictly mandatory but was not specified or invalid");
    }

    // 2. Check Stop Loss Direction Sanity
    if (intent.entryPrice && intent.stopLossPrice) {
      if (intent.direction === "BUY" && intent.stopLossPrice >= intent.entryPrice) {
        reasons.push("For BUY orders, Stop Loss must be strictly below Entry Price");
      }
      if (intent.direction === "SELL" && intent.stopLossPrice <= intent.entryPrice) {
        reasons.push("For SELL orders, Stop Loss must be strictly above Entry Price");
      }
    }

    // 3. Prohibited Symbols Check
    if (
      this.policy.prohibitedSymbols &&
      this.policy.prohibitedSymbols.includes(intent.symbol.toUpperCase())
    ) {
      reasons.push(`Symbol ${intent.symbol} is on the prohibited trading list`);
    }

    // 4. Max Open Positions Check
    if (account.openPositionsCount >= this.policy.maxOpenPositions) {
      reasons.push(
        `Max open positions reached (${account.openPositionsCount}/${this.policy.maxOpenPositions})`,
      );
    }

    // 5. Daily Drawdown Guard
    const totalDailyLoss = -(account.dailyRealizedPnL + Math.min(0, account.dailyUnrealizedPnL));
    const currentDailyDrawdownPercent =
      account.dailyStartingEquity > 0 ? (totalDailyLoss / account.dailyStartingEquity) * 100 : 0;

    if (currentDailyDrawdownPercent >= this.policy.maxDailyDrawdownPercent) {
      reasons.push(
        `Daily drawdown limit exceeded: current drawdown is ${currentDailyDrawdownPercent.toFixed(2)}%, max allowed is ${this.policy.maxDailyDrawdownPercent}%`,
      );
    }

    // 6. Risk-to-Reward Ratio Validation
    let rrRatio: number | undefined;
    if (intent.entryPrice && intent.stopLossPrice && intent.takeProfitPrice) {
      const riskPips = Math.abs(intent.entryPrice - intent.stopLossPrice);
      const rewardPips = Math.abs(intent.takeProfitPrice - intent.entryPrice);
      if (riskPips > 0) {
        rrRatio = rewardPips / riskPips;
        if (rrRatio < this.policy.minRiskRewardRatio) {
          reasons.push(
            `Risk-to-Reward ratio (${rrRatio.toFixed(2)}) is below minimum required (${this.policy.minRiskRewardRatio})`,
          );
        }
      }
    }

    // 7. Calculate Monetary Risk & Position Risk %
    let calculatedRiskAmount = 0;
    let riskPercentOfEquity = 0;

    if (intent.entryPrice && intent.stopLossPrice) {
      // Standard FX contract size: 100,000 units per standard lot
      const contractSize = 100000;
      const priceDistance = Math.abs(intent.entryPrice - intent.stopLossPrice);
      calculatedRiskAmount = intent.volumeLots * contractSize * priceDistance;

      if (account.equity > 0) {
        riskPercentOfEquity = (calculatedRiskAmount / account.equity) * 100;
        if (riskPercentOfEquity > this.policy.maxRiskPercentPerTrade) {
          reasons.push(
            `Trade risk (${riskPercentOfEquity.toFixed(2)}%) exceeds maximum risk limit per trade (${this.policy.maxRiskPercentPerTrade}%)`,
          );
        }
      }
    }

    // 8. Free Margin Check
    if (account.freeMargin <= 0 || calculatedRiskAmount > account.freeMargin) {
      reasons.push("Insufficient free margin to accommodate trade risk");
    }

    const approved = reasons.length === 0;

    return {
      decision: approved ? "APPROVED" : "REJECTED",
      approved,
      reasons,
      calculatedRiskAmount,
      riskPercentOfEquity,
      riskRewardRatio: rrRatio,
      evaluatedAt: now,
    };
  }
}
