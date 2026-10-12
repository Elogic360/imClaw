/**
 * imClaw Market Sensei Confluence Engine
 * Evaluates votes from specialist senseis across multi-timeframe, technical, pattern,
 * and liquidity dimensions to produce a mathematical Confluence Score.
 */

export interface SpecialistVote {
  specialistId: string;
  specialistName: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL" | "INVALIDATED";
  weight: number; // 0.1 to 1.0
  evidence: string;
  confidence: number; // 0 to 100%
  invalidationLevel?: number;
}

export interface ConfluenceReport {
  symbol: string;
  finalBias: "BULLISH" | "BEARISH" | "NO_TRADE";
  confluenceScore: number; // 0 to 100
  agreementRatio: number; // 0.0 to 1.0
  totalSpecialists: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  unanimous: boolean;
  contradictions: string[];
  recommendedAction: "BUY" | "SELL" | "NO_TRADE" | "WAIT";
}

export class ConfluenceEngine {
  private minAgreementThreshold: number;
  private minConfluenceScore: number;

  constructor(options: { minAgreementThreshold?: number; minConfluenceScore?: number } = {}) {
    this.minAgreementThreshold = options.minAgreementThreshold ?? 0.65; // 65% agreement required
    this.minConfluenceScore = options.minConfluenceScore ?? 70; // 70/100 confluence score required
  }

  public evaluateVotes(symbol: string, votes: SpecialistVote[]): ConfluenceReport {
    if (votes.length === 0) {
      return {
        symbol,
        finalBias: "NO_TRADE",
        confluenceScore: 0,
        agreementRatio: 0,
        totalSpecialists: 0,
        bullishCount: 0,
        bearishCount: 0,
        neutralCount: 0,
        unanimous: false,
        contradictions: ["No specialist votes received"],
        recommendedAction: "NO_TRADE",
      };
    }

    let bullishWeightedSum = 0;
    let bearishWeightedSum = 0;
    let totalWeight = 0;

    let bullishCount = 0;
    let bearishCount = 0;
    let neutralCount = 0;

    const contradictions: string[] = [];

    for (const vote of votes) {
      totalWeight += vote.weight;
      if (vote.bias === "BULLISH") {
        bullishCount++;
        bullishWeightedSum += vote.weight * (vote.confidence / 100);
      } else if (vote.bias === "BEARISH") {
        bearishCount++;
        bearishWeightedSum += vote.weight * (vote.confidence / 100);
      } else {
        neutralCount++;
      }
    }

    const totalActive = bullishCount + bearishCount;
    if (bullishCount > 0 && bearishCount > 0) {
      contradictions.push(
        `Conflicting directional biases: ${bullishCount} Bullish vs ${bearishCount} Bearish.`,
      );
    }

    const bullishScore = totalWeight > 0 ? (bullishWeightedSum / totalWeight) * 100 : 0;
    const bearishScore = totalWeight > 0 ? (bearishWeightedSum / totalWeight) * 100 : 0;

    let finalBias: "BULLISH" | "BEARISH" | "NO_TRADE" = "NO_TRADE";
    let confluenceScore = 0;
    let agreementRatio = 0;
    let recommendedAction: "BUY" | "SELL" | "NO_TRADE" | "WAIT" = "NO_TRADE";

    if (bullishScore > bearishScore && bullishScore >= this.minConfluenceScore) {
      agreementRatio = totalActive > 0 ? bullishCount / totalActive : 0;
      if (agreementRatio >= this.minAgreementThreshold) {
        finalBias = "BULLISH";
        confluenceScore = Math.round(bullishScore);
        recommendedAction = "BUY";
      } else {
        recommendedAction = "WAIT";
      }
    } else if (bearishScore > bullishScore && bearishScore >= this.minConfluenceScore) {
      agreementRatio = totalActive > 0 ? bearishCount / totalActive : 0;
      if (agreementRatio >= this.minAgreementThreshold) {
        finalBias = "BEARISH";
        confluenceScore = Math.round(bearishScore);
        recommendedAction = "SELL";
      } else {
        recommendedAction = "WAIT";
      }
    } else {
      recommendedAction = "NO_TRADE";
    }

    return {
      symbol,
      finalBias,
      confluenceScore,
      agreementRatio: Math.round(agreementRatio * 100) / 100,
      totalSpecialists: votes.length,
      bullishCount,
      bearishCount,
      neutralCount,
      unanimous: bullishCount === votes.length || bearishCount === votes.length,
      contradictions,
      recommendedAction,
    };
  }
}
