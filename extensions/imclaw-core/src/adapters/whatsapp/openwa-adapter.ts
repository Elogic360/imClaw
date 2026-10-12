/**
 * imClaw OpenWA Client & Provider Adapter
 * Connects imClaw to the OpenWA Gateway REST API, WebSocket streams, and Webhooks.
 * Supports direct messaging, group operations, channel publishing, contact queries, and session management.
 */

export interface OpenWASessionConfig {
  name: string;
  engine?: "whatsapp-web.js" | "baileys";
  webhookUrl?: string;
}

export interface SendMessagePayload {
  chatId: string;
  text: string;
  mediaUrl?: string;
  caption?: string;
}

export interface OpenWAProviderResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WhatsAppChat {
  id: string;
  name: string;
  isGroup: boolean;
  isChannel?: boolean;
  unreadCount?: number;
  lastMessage?: {
    body: string;
    timestamp: number;
    from: string;
  };
}

export interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  isBusiness?: boolean;
}

export interface WhatsAppGroupMetadata {
  id: string;
  subject: string;
  owner: string;
  creation: number;
  desc?: string;
  participants: Array<{
    id: string;
    isAdmin: boolean;
    isSuperAdmin?: boolean;
  }>;
}

export class OpenWAAdapter {
  private baseUrl: string;
  private apiKey: string;
  private mode: "SIMULATION" | "LIVE";

  constructor(options: { baseUrl?: string; apiKey?: string; mode?: "SIMULATION" | "LIVE" } = {}) {
    this.baseUrl = options.baseUrl ?? (process.env.OPENWA_BASE_URL || "http://127.0.0.1:2785");
    this.apiKey = options.apiKey ?? (process.env.OPENWA_API_KEY || "");
    this.mode =
      options.mode ?? ((process.env.IMCLAW_WHATSAPP_MODE as "SIMULATION" | "LIVE") || "SIMULATION");
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public getMode(): "SIMULATION" | "LIVE" {
    return this.mode;
  }

  public setMode(mode: "SIMULATION" | "LIVE"): void {
    this.mode = mode;
  }

  public updateConfig(baseUrl?: string, apiKey?: string): void {
    if (baseUrl) this.baseUrl = baseUrl;
    if (apiKey !== undefined) this.apiKey = apiKey;
  }

  public async checkHealth(): Promise<boolean> {
    if (this.mode === "SIMULATION") return true;
    try {
      const res = await fetch(`${this.baseUrl}/api/health/ready`);
      return res.ok;
    } catch {
      return false;
    }
  }

  public async listSessions(): Promise<OpenWAProviderResponse<any[]>> {
    if (this.mode === "SIMULATION") {
      return {
        success: true,
        data: [{ name: "sim-session-default", status: "CONNECTED", engine: "baileys" }],
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = (await res.json()) as any[];
      return { success: res.ok, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getSessionStatus(sessionName: string): Promise<OpenWAProviderResponse<any>> {
    if (this.mode === "SIMULATION") {
      return {
        success: true,
        data: { name: sessionName, status: "CONNECTED", battery: 98, isPlugged: true },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/status`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async sendTextMessage(
    sessionName: string,
    chatId: string,
    text: string,
  ): Promise<OpenWAProviderResponse<{ messageId: string }>> {
    if (this.mode === "SIMULATION") {
      return {
        success: true,
        data: { messageId: `sim-msg-${Date.now()}` },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/messages/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ chatId, text }),
      });
      const data = (await res.json()) as { messageId: string };
      return { success: res.ok, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async sendGroupMessage(
    sessionName: string,
    groupId: string,
    text: string,
  ): Promise<OpenWAProviderResponse<{ messageId: string }>> {
    return this.sendTextMessage(sessionName, groupId, text);
  }

  public async listChats(
    sessionName: string,
    limit = 50,
  ): Promise<OpenWAProviderResponse<WhatsAppChat[]>> {
    if (this.mode === "SIMULATION") {
      return {
        success: true,
        data: [
          { id: "120363430275762821@g.us", name: "Executive Announcements", isGroup: true },
          { id: "120363430275762822@g.us", name: "Engineering & Devops", isGroup: true },
          { id: "255733246558@s.whatsapp.net", name: "Operations Lead", isGroup: false },
        ],
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/chats?limit=${limit}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = (await res.json()) as WhatsAppChat[];
      return { success: res.ok, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getGroupMetadata(
    sessionName: string,
    groupId: string,
  ): Promise<OpenWAProviderResponse<WhatsAppGroupMetadata>> {
    if (this.mode === "SIMULATION") {
      return {
        success: true,
        data: {
          id: groupId,
          subject: "imClaw Autonomous Workspace Group",
          owner: "255733246558@s.whatsapp.net",
          creation: Date.now() - 86400000,
          desc: "Multi-Agent operational collaboration group",
          participants: [
            { id: "255733246558@s.whatsapp.net", isAdmin: true },
            { id: "255683312365@s.whatsapp.net", isAdmin: false },
          ],
        },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = (await res.json()) as WhatsAppGroupMetadata;
      return { success: res.ok, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async createGroup(
    sessionName: string,
    title: string,
    participants: string[],
  ): Promise<OpenWAProviderResponse<{ id: string; title: string }>> {
    if (this.mode === "SIMULATION") {
      return {
        success: true,
        data: { id: `sim-grp-${Date.now()}@g.us`, title },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ title, participants }),
      });
      const data = (await res.json()) as { id: string; title: string };
      return { success: res.ok, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async getContacts(
    sessionName: string,
  ): Promise<OpenWAProviderResponse<WhatsAppContact[]>> {
    if (this.mode === "SIMULATION") {
      return {
        success: true,
        data: [
          {
            id: "255733246558@s.whatsapp.net",
            name: "Primary Admin",
            number: "+255733246558",
            isBusiness: false,
          },
          {
            id: "255683312365@s.whatsapp.net",
            name: "Enterprise Client",
            number: "+255683312365",
            isBusiness: true,
          },
        ],
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionName}/contacts`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      const data = (await res.json()) as WhatsAppContact[];
      return { success: res.ok, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
