/**
 * imClaw OpenWA Client & Provider Adapter
 * Connects imClaw to the OpenWA Gateway REST API and Webhooks.
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

  public getMode(): "SIMULATION" | "LIVE" {
    return this.mode;
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
}
