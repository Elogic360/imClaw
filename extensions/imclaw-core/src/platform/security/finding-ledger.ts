/**
 * imClaw Security — Finding Ledger & Blocker Gate
 * Ported from NVIDIA NemoClaw (tools/pr-review-advisor/finding-ledger.mts, blocker-gate.mts)
 * Cryptographically fingerprinted findings ledger that enforces deterministic blocker gates
 * across autonomous agent actions, code modifications, and trading workflows.
 */

import crypto from "node:crypto";

export type FindingSeverity = "P0" | "P1" | "P2" | "INFO";
export type FindingKind =
  | "security"
  | "credential-access"
  | "risk-violation"
  | "correctness"
  | "code-quality"
  | "operations";

export interface Finding {
  id: string;
  severity: FindingSeverity;
  kind: FindingKind;
  summary: string;
  sourceModule: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface LedgerSummary {
  totalFindings: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  fingerprint: string;
}

export class SecurityFindingLedger {
  private findings: Finding[] = [];

  /**
   * Records a security or compliance finding.
   */
  public recordFinding(finding: Omit<Finding, "timestamp">): Finding {
    const fullFinding: Finding = {
      ...finding,
      timestamp: Date.now(),
    };
    this.findings.push(fullFinding);
    return fullFinding;
  }

  public getFindings(): readonly Finding[] {
    return this.findings;
  }

  /**
   * Generates a deterministic SHA-256 fingerprint over the ledger contents.
   */
  public getLedgerSummary(): LedgerSummary {
    let p0Count = 0;
    let p1Count = 0;
    let p2Count = 0;

    for (const f of this.findings) {
      if (f.severity === "P0") p0Count++;
      else if (f.severity === "P1") p1Count++;
      else if (f.severity === "P2") p2Count++;
    }

    const payload = JSON.stringify(
      this.findings.map((f) => ({
        id: f.id,
        severity: f.severity,
        kind: f.kind,
        summary: f.summary,
        sourceModule: f.sourceModule,
      })),
    );

    const fingerprint = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      totalFindings: this.findings.length,
      p0Count,
      p1Count,
      p2Count,
      fingerprint,
    };
  }

  /**
   * Blocker Gate: Evaluates whether any findings block promotion or execution.
   * By default, any P0 or P1 finding strictly blocks execution.
   */
  public evaluateBlockerGate(allowP1: boolean = false): {
    cleared: boolean;
    blockingFindings: Finding[];
    reason?: string;
  } {
    const blockingFindings = this.findings.filter((f) => {
      if (f.severity === "P0") return true;
      if (!allowP1 && f.severity === "P1") return true;
      return false;
    });

    if (blockingFindings.length > 0) {
      return {
        cleared: false,
        blockingFindings,
        reason: `BlockerGate Tripped: ${blockingFindings.length} critical finding(s) require resolution.`,
      };
    }

    return {
      cleared: true,
      blockingFindings: [],
    };
  }
}
