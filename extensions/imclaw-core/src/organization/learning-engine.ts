/**
 * imClaw Organization — Autonomous Learning & Correction Engine
 * Ported conceptually from Agents Office (learn.mjs, "revise: ...")
 * Evaluates operator feedback and corrections, transforms them into candidate lessons,
 * and consolidates them into verified standing rules above a confidence threshold.
 */

export interface OperatorCorrection {
  correctionId: string;
  departmentId: string;
  agentId?: string;
  originalOutput: string;
  correctionText: string;
  category: "TONE" | "FACTUAL" | "POLICY" | "FORMAT";
  timestamp: number;
}

export interface StandingRule {
  ruleId: string;
  departmentId: string;
  ruleStatement: string;
  confidenceScore: number;
  approved: boolean;
  createdAt: number;
}

export class LearningEngine {
  private corrections: OperatorCorrection[] = [];
  private standingRules: StandingRule[] = [];
  private confidenceThreshold: number;

  constructor(confidenceThreshold: number = 0.8) {
    this.confidenceThreshold = confidenceThreshold;
  }

  /**
   * Ingests a user correction (e.g., "revise: Never use casual tone with institutional clients").
   */
  public ingestCorrection(
    departmentId: string,
    correctionText: string,
    originalOutput: string = "",
    agentId?: string,
  ): OperatorCorrection {
    const correction: OperatorCorrection = {
      correctionId: `corr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      departmentId,
      agentId,
      originalOutput,
      correctionText,
      category: /tone|voice/i.test(correctionText)
        ? "TONE"
        : /policy|never|always/i.test(correctionText)
          ? "POLICY"
          : "FACTUAL",
      timestamp: Date.now(),
    };

    this.corrections.push(correction);
    this.evaluateCandidateRule(correction);
    return correction;
  }

  private evaluateCandidateRule(correction: OperatorCorrection): void {
    // Clean-room rule extractor
    const cleanRule = correction.correctionText.replace(/^revise:\s*/i, "").trim();
    const confidence = correction.category === "POLICY" ? 0.9 : 0.75;

    const candidate: StandingRule = {
      ruleId: `rule-${this.standingRules.length + 1}`,
      departmentId: correction.departmentId,
      ruleStatement: cleanRule,
      confidenceScore: confidence,
      approved: confidence >= this.confidenceThreshold,
      createdAt: Date.now(),
    };

    this.standingRules.push(candidate);
  }

  public getStandingRules(departmentId?: string): StandingRule[] {
    if (!departmentId) return this.standingRules.filter((r) => r.approved);
    return this.standingRules.filter((r) => r.departmentId === departmentId && r.approved);
  }

  public getPendingReviewRules(): StandingRule[] {
    return this.standingRules.filter((r) => !r.approved);
  }

  public approveRule(ruleId: string): boolean {
    const rule = this.standingRules.find((r) => r.ruleId === ruleId);
    if (!rule) return false;
    rule.approved = true;
    return true;
  }
}
