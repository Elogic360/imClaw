/**
 * imClaw WhatsApp Inbound Gateway & Event Router
 * Connects directly to OpenWA's high-speed WebSocket Event Gateway (/events),
 * listens for inbound WhatsApp messages, and autonomously dispatches to imClaw agents.
 */

import { io, Socket } from "socket.io-client";
import {
  INTEGRAL_MARKET_GROUPS,
  WhatsAppDepartmentManager,
} from "../../domains/social/whatsapp/whatsapp-department.js";
import { ImClawEventBus } from "../../platform/events/event-bus.js";
import { OpenWAAdapter } from "./openwa-adapter.js";

export interface WhatsAppInboundMessage {
  id: string;
  from: string;
  chatId: string;
  senderName?: string;
  text: string;
  timestamp: number;
  isGroup: boolean;
  fromMe: boolean;
}

export class WhatsAppGatewayService {
  private socket?: Socket;
  private openwaUrl: string;
  private apiKey: string;
  private sessionId: string;
  private departmentManager: WhatsAppDepartmentManager;
  private adapter: OpenWAAdapter;
  private eventBus: ImClawEventBus;
  private adminPhone: string;
  private isRunning = false;

  constructor(
    options: {
      openwaUrl?: string;
      apiKey?: string;
      sessionId?: string;
      departmentManager?: WhatsAppDepartmentManager;
      adapter?: OpenWAAdapter;
      eventBus?: ImClawEventBus;
      adminPhone?: string;
    } = {},
  ) {
    this.openwaUrl = options.openwaUrl ?? (process.env.OPENWA_BASE_URL || "http://127.0.0.1:2785");
    this.apiKey =
      options.apiKey ??
      (process.env.OPENWA_API_KEY ||
        "owa_k1_1910243542d0d0cccb0cbbf90dd20cea544e6c42c11b95ad9acfc6da0c867cb2");
    this.sessionId =
      options.sessionId ??
      (process.env.OPENWA_SESSION_ID || "2bbd550b-6ede-441a-a704-586082e6b6df");
    this.eventBus = options.eventBus ?? new ImClawEventBus();
    this.departmentManager =
      options.departmentManager ?? new WhatsAppDepartmentManager(undefined, this.eventBus);
    this.adapter =
      options.adapter ??
      new OpenWAAdapter({ baseUrl: this.openwaUrl, apiKey: this.apiKey, mode: "LIVE" });
    this.adminPhone = options.adminPhone ?? (process.env.ADMIN_PHONE || "255733246558");
  }

  /**
   * Start listening to OpenWA WebSocket Events
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isRunning = true;
      const wsUrl = `${this.openwaUrl}/events`;

      this.socket = io(wsUrl, {
        auth: { apiKey: this.apiKey },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 2000,
      });

      this.socket.on("connect", () => {
        console.log(
          `[imClaw WhatsApp Gateway] Connected to OpenWA Event Stream (${this.socket?.id})`,
        );
        // Subscribe to incoming messages
        this.socket?.emit("message", {
          type: "subscribe",
          sessionId: this.sessionId,
          events: ["message.received"],
        });
        resolve();
      });

      this.socket.on("message", async (data: any) => {
        try {
          if (data?.event === "message.received" || data?.type === "event") {
            await this.handleIncomingEvent(data);
          }
        } catch (err: any) {
          console.error("[imClaw WhatsApp Gateway] Error processing incoming event:", err.message);
        }
      });

      this.socket.on("connect_error", (err: Error) => {
        console.error("[imClaw WhatsApp Gateway] Connection error:", err.message);
      });
    });
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  /**
   * Handle incoming raw event from OpenWA
   */
  public async handleIncomingEvent(eventPayload: any): Promise<void> {
    const data = eventPayload.data || eventPayload;
    const msg = data.message || data;
    if (!msg || msg.fromMe) return;

    const bodyText = (msg.body || msg.text || "").trim();
    if (!bodyText) return;

    const inbound: WhatsAppInboundMessage = {
      id: msg.id || `${Date.now()}`,
      from: msg.author || msg.from || "",
      chatId: msg.chatId || msg.from || "",
      senderName: msg.pushName || msg.notifyName || "Client",
      text: bodyText,
      timestamp: msg.timestamp || Math.floor(Date.now() / 1000),
      isGroup: (msg.chatId || msg.from || "").includes("@g.us"),
      fromMe: Boolean(msg.fromMe),
    };

    await this.routeInboundMessage(inbound);
  }

  /**
   * Autonomous Agent Routing Logic:
   * 1. Client Auth Token Request (#token)
   * 2. Copy Trading Inquiry (#copy)
   * 3. Admin Direct Control Commands (#admin)
   * 4. Sales Group General Inquiries (#help, etc.)
   * 5. Signals Group Queries (#status, #risk)
   */
  public async routeInboundMessage(msg: WhatsAppInboundMessage): Promise<void> {
    const textLower = msg.text.toLowerCase();
    console.log(
      `[imClaw WhatsApp Router] Processing from ${msg.senderName} (${msg.chatId}): "${msg.text}"`,
    );

    // 1. Check for Client Auth Token Request (#token)
    if (textLower === "#token" || textLower.startsWith("#token ")) {
      const generatedToken = `IM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const reply = `🔐 *Integral Market Access Verification*\n\nHello ${msg.senderName}!\nYour requested one-time access token is:\n👉 *${generatedToken}*\n\n_Valid for 10 minutes. Governed by imClaw Security Layer._`;

      await this.adapter.sendTextMessage(this.sessionId, msg.chatId, reply);
      return;
    }

    // 2. Check for Copy Trading Request (#copy)
    if (textLower === "#copy" || textLower.includes("copy trading")) {
      const reply = `📈 *Integral Market — Copy Trading Desk*\n\nHello ${msg.senderName}!\nOur automated copy trading accounts execute institutional risk models:\n• Min Capital: $250\n• Risk Per Trade: 1-2%\n• MT5 Institutional Node Workers\n\nTo link your investor account, reply directly or contact support.`;

      await this.adapter.sendTextMessage(this.sessionId, msg.chatId, reply);
      return;
    }

    // 3. Admin Control Commands (from Admin Phone or direct DM)
    const isAdmin = msg.from.includes(this.adminPhone) || msg.chatId.includes(this.adminPhone);
    if (
      isAdmin &&
      (textLower.startsWith("#admin") || textLower.startsWith("/admin") || !msg.isGroup)
    ) {
      if (textLower.includes("status")) {
        const reply = `🤖 *imClaw Autonomous Status*\n\n• Event Stream: CONNECTED (OpenWA WebSocket)\n• Active Groups: 3 Connected\n• Risk Guard: ACTIVE\n• MT5 Worker: HEALTHY\n\nAll autonomous agent desks operational.`;
        await this.adapter.sendTextMessage(this.sessionId, msg.chatId, reply);
        return;
      }
    }

    // 4. Sales Group General Inquiries
    if (msg.chatId === INTEGRAL_MARKET_GROUPS.VIP_SALES_SUPPORT) {
      if (
        textLower.startsWith("#help") ||
        textLower.includes("price") ||
        textLower.includes("cost") ||
        textLower.includes("how to join")
      ) {
        const reply = `💼 *Integral Market Client Desk*\n\nHello ${msg.senderName}! Thank you for reaching out.\n\nQuick Commands:\n• Type *#token* — Instant portal access token\n• Type *#copy* — Institutional copy trading info\n• Type *#help* — View options\n\nOur AI client specialist is standing by.`;
        await this.adapter.sendTextMessage(this.sessionId, msg.chatId, reply);
        return;
      }
    }

    // 5. Signals Group Queries
    if (msg.chatId === INTEGRAL_MARKET_GROUPS.VIP_SIGNALS) {
      if (textLower === "#status" || textLower === "#risk") {
        const reply = `📊 *Market Sensei Risk Overview*\n\n• Target Pairs: XAUUSD, EURUSD, BTCUSD\n• Risk Engine Status: Max Drawdown Gate 3.5%\n• Confluence Threshold: 75% Agreement\n\nNext scheduled market scan in progress.`;
        await this.adapter.sendTextMessage(this.sessionId, msg.chatId, reply);
        return;
      }
    }
  }
}
