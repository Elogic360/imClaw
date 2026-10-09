/**
 * imClaw WhatsApp Capability Layer
 * Enforces policy, agent identities, rate limits, and approval gates before dispatching to OpenWA.
 */

import { OpenWAAdapter } from "../../../adapters/whatsapp/openwa-adapter.js";
import { ApprovalEngine } from "../../../platform/approvals/approval-engine.js";

export type WhatsAppActionType =
  | "SEND_TEXT"
  | "SEND_SIGNAL"
  | "SEND_ALERT"
  | "SEND_AUTH_TOKEN"
  | "GROUP_MANAGE";

export interface WhatsAppCapabilityRequest {
  action: WhatsAppActionType;
  agentId: string;
  sessionName: string;
  recipientOrGroupId: string;
  payload: {
    text?: string;
    signalId?: string;
    tokenType?: string;
    clientId?: string;
  };
  requiresApproval?: boolean;
}

export interface WhatsAppCapabilityResponse {
  allowed: boolean;
  status: "EXECUTED" | "HELD_FOR_APPROVAL" | "REJECTED";
  messageId?: string;
  reason?: string;
}

export class WhatsAppCapability {
  private adapter: OpenWAAdapter;
  private approvalEngine: ApprovalEngine;

  constructor(adapter?: OpenWAAdapter, approvalEngine?: ApprovalEngine) {
    this.adapter = adapter ?? new OpenWAAdapter();
    this.approvalEngine = approvalEngine ?? new ApprovalEngine();
  }

  public async execute(req: WhatsAppCapabilityRequest): Promise<WhatsAppCapabilityResponse> {
    // 1. Check if the action requires human approval
    const requiresApproval =
      req.requiresApproval ??
      (req.action === "SEND_AUTH_TOKEN" ||
        req.action === "GROUP_MANAGE" ||
        req.action === "SEND_SIGNAL");

    if (requiresApproval) {
      const approval = this.approvalEngine.createRequest(
        "LIVE_TRADE", // Tiered confirmation policy
        req.agentId,
        {
          action: req.action,
          target: req.recipientOrGroupId,
          summary: req.payload.text?.slice(0, 100),
        },
      );

      if (approval.status === "PENDING") {
        return {
          allowed: false,
          status: "HELD_FOR_APPROVAL",
          reason: `Action ${req.action} placed in approval queue (${approval.requestId}).`,
        };
      }
    }

    // 2. Dispatch through OpenWA Adapter
    const result = await this.adapter.sendTextMessage(
      req.sessionName,
      req.recipientOrGroupId,
      req.payload.text || "",
    );

    if (result.success && result.data) {
      return {
        allowed: true,
        status: "EXECUTED",
        messageId: result.data.messageId,
      };
    }

    return {
      allowed: false,
      status: "REJECTED",
      reason: result.error || "Failed to deliver message via OpenWA",
    };
  }
}
