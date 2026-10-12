/**
 * imClaw Orchestration — Session Claim Fencing
 * Ported from NanoClaw (src/db/coordination.ts, session-claim-fencing)
 * Guarantees monotonic incarnation fencing and prevents split-brain execution
 * when agents or background worker processes claim session execution leases.
 */

export interface SessionClaim {
  sessionId: string;
  incarnation: number;
  claimedBy: string;
  claimedAt: number;
  leaseExpiresAt: number;
  stopIntent: "NONE" | "STOP" | "RESPAWN_AFTER_STOP";
}

export class SessionClaimFencing {
  private claims: Map<string, SessionClaim> = new Map();
  private defaultLeaseDurationMs: number;

  constructor(defaultLeaseDurationMs: number = 30000) {
    this.defaultLeaseDurationMs = defaultLeaseDurationMs;
  }

  /**
   * Attempts to claim or renew a session using optimistic Compare-And-Swap (CAS).
   * Increments the incarnation number so any previous incarnation is fenced out immediately.
   */
  public tryClaimSession(
    sessionId: string,
    workerId: string,
    expectedIncarnation?: number,
  ): { success: boolean; claim?: SessionClaim; reason?: string } {
    const now = Date.now();
    const existing = this.claims.get(sessionId);

    if (existing) {
      // If expected incarnation was provided, verify CAS match
      if (expectedIncarnation !== undefined && existing.incarnation !== expectedIncarnation) {
        return {
          success: false,
          reason: `CAS fencing failure: Current incarnation is ${existing.incarnation}, expected ${expectedIncarnation}`,
        };
      }

      // Check if lease is active and owned by someone else
      if (existing.claimedBy !== workerId && existing.leaseExpiresAt > now) {
        return {
          success: false,
          reason: `Session is locked by active lease held by worker ${existing.claimedBy}`,
        };
      }

      // Grant new claim with incremented incarnation
      const updated: SessionClaim = {
        sessionId,
        incarnation: existing.incarnation + 1,
        claimedBy: workerId,
        claimedAt: now,
        leaseExpiresAt: now + this.defaultLeaseDurationMs,
        stopIntent: "NONE",
      };
      this.claims.set(sessionId, updated);
      return { success: true, claim: updated };
    }

    // New claim
    const initial: SessionClaim = {
      sessionId,
      incarnation: 1,
      claimedBy: workerId,
      claimedAt: now,
      leaseExpiresAt: now + this.defaultLeaseDurationMs,
      stopIntent: "NONE",
    };
    this.claims.set(sessionId, initial);
    return { success: true, claim: initial };
  }

  /**
   * Verifies if a given worker and incarnation still holds a valid, non-fenced lease.
   */
  public isClaimValid(sessionId: string, workerId: string, incarnation: number): boolean {
    const claim = this.claims.get(sessionId);
    if (!claim) return false;
    if (claim.incarnation !== incarnation) return false; // Fenced by newer incarnation
    if (claim.claimedBy !== workerId) return false;
    return claim.leaseExpiresAt > Date.now();
  }

  /**
   * Releases an active claim cleanly.
   */
  public releaseClaim(sessionId: string, workerId: string, incarnation: number): boolean {
    const claim = this.claims.get(sessionId);
    if (!claim) return false;
    if (claim.incarnation === incarnation && claim.claimedBy === workerId) {
      this.claims.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Sets stop intent on a session.
   */
  public setStopIntent(sessionId: string, intent: "STOP" | "RESPAWN_AFTER_STOP"): boolean {
    const claim = this.claims.get(sessionId);
    if (!claim) return false;
    claim.stopIntent = intent;
    return true;
  }

  public getClaim(sessionId: string): SessionClaim | undefined {
    return this.claims.get(sessionId);
  }
}
