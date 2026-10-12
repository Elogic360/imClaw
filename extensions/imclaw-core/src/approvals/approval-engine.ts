/**
 * imClaw Human & Policy Approval Engine
 * Enforces explicit human-in-the-loop gates for high-risk operations:
 * - Live broker orders
 * - Production database mutations
 * - Destructive filesystem commands
 */

export type ApprovalTier = "AUTO_APPROVE" | "REQUIRE_CONFIRMATION" | "REQUIRE_ADMIN" | "DENY";

export interface ApprovalRequest {
  requestId: string;
  actionType:
    | "LIVE_TRADE"
    | "SIMULATION_TRADE"
    | "PROD_DATABASE_WRITE"
    | "HOST_SHELL"
    | "VIEW_MARKET_DATA";
  requestedByAgentId: string;
  details: Record<string, unknown>;
  tier: ApprovalTier;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decidedAt?: number;
  decidedBy?: string;
  rejectionReason?: string;
}

export class ApprovalEngine {
  private requests: Map<string, ApprovalRequest> = new Map();

  /**
   * Determine the required approval tier for an action.
   */
  public evaluatePolicy(actionType: ApprovalRequest["actionType"]): ApprovalTier {
    switch (actionType) {
      case "VIEW_MARKET_DATA":
      case "SIMULATION_TRADE":
        return "AUTO_APPROVE";
      case "LIVE_TRADE":
        return "REQUIRE_CONFIRMATION";
      case "PROD_DATABASE_WRITE":
      case "HOST_SHELL":
        return "REQUIRE_ADMIN";
      default:
        return "DENY";
    }
  }

  public createRequest(
    actionType: ApprovalRequest["actionType"],
    requestedByAgentId: string,
    details: Record<string, unknown>,
  ): ApprovalRequest {
    const tier = this.evaluatePolicy(actionType);
    const requestId = `appr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const request: ApprovalRequest = {
      requestId,
      actionType,
      requestedByAgentId,
      details,
      tier,
      status: tier === "AUTO_APPROVE" ? "APPROVED" : "PENDING",
      decidedAt: tier === "AUTO_APPROVE" ? Date.now() : undefined,
      decidedBy: tier === "AUTO_APPROVE" ? "SYSTEM_POLICY" : undefined,
    };

    this.requests.set(requestId, request);
    return request;
  }

  public decide(
    requestId: string,
    approved: boolean,
    operatorId: string,
    rejectionReason?: string,
  ): ApprovalRequest {
    const req = this.requests.get(requestId);
    if (!req) {
      throw new Error(`Approval request "${requestId}" not found.`);
    }

    req.status = approved ? "APPROVED" : "REJECTED";
    req.decidedAt = Date.now();
    req.decidedBy = operatorId;
    if (!approved && rejectionReason) {
      req.rejectionReason = rejectionReason;
    }

    return req;
  }
}
