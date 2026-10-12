/**
 * imClaw OpenWA Autonomous WhatsApp MCP Server & Tool Provider
 *
 * Implements the Model Context Protocol (MCP) server for OpenWA WhatsApp automation.
 * Exposes comprehensive tools to AI agents for:
 * - Direct messaging (`whatsapp_send_message`)
 * - Group messaging & broadcast (`whatsapp_send_group_message`)
 * - Listing chats & conversation history (`whatsapp_list_chats`)
 * - Group metadata inspection (`whatsapp_get_group_metadata`)
 * - Group creation & participant management (`whatsapp_create_group`)
 * - Address book & contact lookup (`whatsapp_list_contacts`)
 * - Connection & session health checks (`whatsapp_check_status`)
 * - Setting OpenWA connection credentials at runtime (`whatsapp_configure_credentials`)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { OpenWAAdapter } from "../adapters/whatsapp/openwa-adapter.js";

export interface OpenWaMcpOptions {
  adapter?: OpenWAAdapter;
  defaultSessionName?: string;
  name?: string;
  version?: string;
}

export class OpenWaMcpServer {
  private adapter: OpenWAAdapter;
  private defaultSessionName: string;
  private server: Server;

  constructor(options: OpenWaMcpOptions = {}) {
    this.adapter = options.adapter || new OpenWAAdapter();
    this.defaultSessionName =
      options.defaultSessionName || process.env.OPENWA_SESSION_ID || "default";
    this.server = new Server(
      {
        name: options.name || "imclaw-openwa-whatsapp",
        version: options.version || "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.registerHandlers();
  }

  public getMcpServer(): Server {
    return this.server;
  }

  public getAdapter(): OpenWAAdapter {
    return this.adapter;
  }

  private registerHandlers(): void {
    // 1. List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "whatsapp_send_message",
            description:
              "Send a direct text message to a WhatsApp user or phone number via OpenWA.",
            inputSchema: {
              type: "object",
              properties: {
                recipient: {
                  type: "string",
                  description:
                    "Phone number with country code (e.g. '255733246558') or full JID (e.g. '255733246558@s.whatsapp.net').",
                },
                message: {
                  type: "string",
                  description: "Text content of the message to send.",
                },
                session: {
                  type: "string",
                  description: "Optional OpenWA session name. Defaults to active session.",
                },
              },
              required: ["recipient", "message"],
            },
          },
          {
            name: "whatsapp_send_group_message",
            description: "Send a broadcast or message to a WhatsApp Group or Channel via OpenWA.",
            inputSchema: {
              type: "object",
              properties: {
                groupId: {
                  type: "string",
                  description: "WhatsApp group JID (e.g. '120363430275762821@g.us').",
                },
                message: {
                  type: "string",
                  description: "Message content to broadcast to the group.",
                },
                session: {
                  type: "string",
                  description: "Optional OpenWA session name.",
                },
              },
              required: ["groupId", "message"],
            },
          },
          {
            name: "whatsapp_list_chats",
            description: "Retrieve recent chats, active conversations, and groups from WhatsApp.",
            inputSchema: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Max number of chats to return (default: 30).",
                },
                session: {
                  type: "string",
                  description: "Optional OpenWA session name.",
                },
              },
            },
          },
          {
            name: "whatsapp_get_group_metadata",
            description:
              "Inspect a WhatsApp group's participants, admins, owner, description, and settings.",
            inputSchema: {
              type: "object",
              properties: {
                groupId: {
                  type: "string",
                  description: "WhatsApp group JID (e.g. '120363430275762821@g.us').",
                },
                session: {
                  type: "string",
                  description: "Optional OpenWA session name.",
                },
              },
              required: ["groupId"],
            },
          },
          {
            name: "whatsapp_create_group",
            description:
              "Autonomously create a new WhatsApp group with specified title and initial participant list.",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Group name / subject.",
                },
                participants: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of participant phone numbers or JIDs to invite.",
                },
                session: {
                  type: "string",
                  description: "Optional OpenWA session name.",
                },
              },
              required: ["title", "participants"],
            },
          },
          {
            name: "whatsapp_list_contacts",
            description:
              "Query WhatsApp contacts and phonebook entries to look up names, numbers, or client identities.",
            inputSchema: {
              type: "object",
              properties: {
                session: {
                  type: "string",
                  description: "Optional OpenWA session name.",
                },
              },
            },
          },
          {
            name: "whatsapp_check_status",
            description:
              "Check the live connectivity status, battery level, and health of the OpenWA WhatsApp gateway.",
            inputSchema: {
              type: "object",
              properties: {
                session: {
                  type: "string",
                  description: "Optional OpenWA session name.",
                },
              },
            },
          },
          {
            name: "whatsapp_configure_credentials",
            description:
              "Dynamically configure or switch OpenWA API endpoint, API key, and session ID at runtime.",
            inputSchema: {
              type: "object",
              properties: {
                baseUrl: {
                  type: "string",
                  description: "Base URL of the OpenWA service (e.g. 'http://127.0.0.1:2785').",
                },
                apiKey: {
                  type: "string",
                  description: "Authentication API Key / Bearer Token for OpenWA.",
                },
                session: {
                  type: "string",
                  description: "Target session name or ID.",
                },
                mode: {
                  type: "string",
                  enum: ["LIVE", "SIMULATION"],
                  description:
                    "Execution mode ('LIVE' connects to real WhatsApp; 'SIMULATION' mocks responses).",
                },
              },
            },
          },
        ],
      };
    });

    // 2. Execute tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      const session = (args.session as string) || this.defaultSessionName;

      switch (name) {
        case "whatsapp_send_message": {
          let recipient = String(args.recipient || "").trim();
          if (!recipient.includes("@")) {
            recipient = `${recipient.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
          }
          const message = String(args.message || "");
          const res = await this.adapter.sendTextMessage(session, recipient, message);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: res.success,
                    data: res.data,
                    error: res.error,
                    recipient,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "whatsapp_send_group_message": {
          const groupId = String(args.groupId || "");
          const message = String(args.message || "");
          const res = await this.adapter.sendGroupMessage(session, groupId, message);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: res.success,
                    data: res.data,
                    error: res.error,
                    groupId,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "whatsapp_list_chats": {
          const limit = Number(args.limit) || 30;
          const res = await this.adapter.listChats(session, limit);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(res, null, 2),
              },
            ],
          };
        }

        case "whatsapp_get_group_metadata": {
          const groupId = String(args.groupId || "");
          const res = await this.adapter.getGroupMetadata(session, groupId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(res, null, 2),
              },
            ],
          };
        }

        case "whatsapp_create_group": {
          const title = String(args.title || "");
          const participants = (args.participants as string[]) || [];
          const res = await this.adapter.createGroup(session, title, participants);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(res, null, 2),
              },
            ],
          };
        }

        case "whatsapp_list_contacts": {
          const res = await this.adapter.getContacts(session);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(res, null, 2),
              },
            ],
          };
        }

        case "whatsapp_check_status": {
          const isHealthy = await this.adapter.checkHealth();
          const sessionStatus = await this.adapter.getSessionStatus(session);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    openwaReachable: isHealthy,
                    mode: this.adapter.getMode(),
                    session: sessionStatus.data,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        case "whatsapp_configure_credentials": {
          const baseUrl = args.baseUrl ? String(args.baseUrl) : undefined;
          const apiKey = args.apiKey !== undefined ? String(args.apiKey) : undefined;
          if (args.session) {
            this.defaultSessionName = String(args.session);
          }
          if (args.mode === "LIVE" || args.mode === "SIMULATION") {
            this.adapter.setMode(args.mode);
          }
          this.adapter.updateConfig(baseUrl, apiKey);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    configured: true,
                    baseUrl: this.adapter.getBaseUrl(),
                    hasApiKey: Boolean(this.adapter.getApiKey()),
                    mode: this.adapter.getMode(),
                    session: this.defaultSessionName,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }
}
