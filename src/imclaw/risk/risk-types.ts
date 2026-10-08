/**
 * imClaw Risk Guard — Types and Interfaces
 * Deterministic, non-bypassable risk validation boundary for financial execution.
 */

export type TradeDirection = "BUY" | "SELL";
export type ExecutionMode = "SIMULATION" | "PAPER" | "LIVE";
export type RiskDecision = "APPROVED" | "REJECTED" | "REQUIRES_HUMAN_APPROVAL";

export interface TradeIntent {
  intentId: string;
  symbol: string;
  direction: TradeDirection;
  volumeLots: number;
  entryPrice?: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  proposedBySensei: string;
  rationale: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AccountRiskState {
  accountId: string;
  broker: "ctrader" | "mt5" | "simulation";
  equity: number;
  balance: number;
  freeMargin: number;
  usedMargin: number;
  dailyStartingEquity: number;
  dailyRealizedPnL: number;
  dailyUnrealizedPnL: number;
  openPositionsCount: number;
  currentDrawdownPercent: number;
}

export interface RiskPolicy {
  maxRiskPercentPerTrade: number; // e.g. 1.0 (1%)
  maxDailyDrawdownPercent: number; // e.g. 5.0 (5%)
  maxWeeklyDrawdownPercent: number; // e.g. 10.0 (10%)
  maxOpenPositions: number; // e.g. 5
  minRiskRewardRatio: number; // e.g. 1.5
  maxLeverage: number; // e.g. 30
  prohibitedSymbols?: string[];
  restrictedTradingHoursUTC?: Array<{ startHour: number; endHour: number }>;
  enforceStopLoss: boolean;
}

export interface RiskEvaluationResult {
  decision: RiskDecision;
  approved: boolean;
  reasons: string[];
  calculatedRiskAmount: number;
  riskPercentOfEquity: number;
  riskRewardRatio?: number;
  evaluatedAt: number;
}
