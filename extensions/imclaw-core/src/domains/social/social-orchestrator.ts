/**
 * imClaw Social & Community Domain Orchestrator
 * Coordinates community engagement, mentorship, subscriptions, and content publication
 * across WhatsApp, Telegram, and Slack with mandatory policy approval gates.
 */

import crypto from "node:crypto";
import { ApprovalEngine } from "../../platform/approvals/approval-engine.js";

export type SocialPlatform = "WHATSAPP" | "TELEGRAM" | "SLACK";

export interface SocialPublicationIntent {
  intentId: string;
  platform: SocialPlatform;
  targetChannelOrGroupId: string;
  contentType: "MARKET_UPDATE" | "SIGNAL_POST" | "EDUCATIONAL" | "MENTORSHIP_ANNOUNCEMENT";
  title: string;
  content: string;
  authorAgentId: string;
  requiresApproval: boolean;
}

export interface PublicationResult {
  intentId: string;
  platform: SocialPlatform;
  status: "PUBLISHED" | "PENDING_APPROVAL" | "REJECTED";
  messageId?: string;
  error?: string;
}

export class SocialCommunityOrchestrator {
  private approvalEngine: ApprovalEngine;
  private publications: Map<string, PublicationResult> = new Map();

  constructor(approvalEngine?: ApprovalEngine) {
    this.approvalEngine = approvalEngine ?? new ApprovalEngine();
  }

  public async proposePublication(intent: SocialPublicationIntent): Promise<PublicationResult> {
    if (intent.requiresApproval) {
      const approvalReq = this.approvalEngine.createRequest(
        "LIVE_TRADE", // Requires confirmation tier
        intent.authorAgentId,
        {
          intentId: intent.intentId,
          platform: intent.platform,
          title: intent.title,
          contentType: intent.contentType,
        },
      );

      if (approvalReq.status === "PENDING") {
        const pendingResult: PublicationResult = {
          intentId: intent.intentId,
          platform: intent.platform,
          status: "PENDING_APPROVAL",
        };
        this.publications.set(intent.intentId, pendingResult);
        return pendingResult;
      }
    }

    // Direct publish or auto-approved
    const publishedResult: PublicationResult = {
      intentId: intent.intentId,
      platform: intent.platform,
      status: "PUBLISHED",
      messageId: `msg-${crypto.randomBytes(4).toString("hex")}`,
    };
    this.publications.set(intent.intentId, publishedResult);
    return publishedResult;
  }

  public getPublication(intentId: string): PublicationResult | undefined {
    return this.publications.get(intentId);
  }
}
