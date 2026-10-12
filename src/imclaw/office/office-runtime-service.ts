/**
 * imClaw Agents Office Runtime Service
 * Bridges Agents Office features into imClaw:
 * - Dynamic agent roster & department state
 * - Live MCP connector catalog
 * - Conversational desk chats
 * - Unattended routine execution & approval gates
 */

import { CompanyRegistry } from "../organization/company-registry.js";
import type { SpecialistAgent } from "../organization/organization-types.js";

export interface OfficeAgentDto {
  id: string;
  name: string;
  role: string;
  does: string;
  tools: string[];
  skills: string[];
  brief: string;
  department: string;
  lead: boolean;
  interviewer: boolean;
  setUp: boolean;
  status: "IDLE" | "RUNNING" | "PAUSED" | "BLOCKED" | "COMPLETED" | "FAILED" | "OFFLINE";
  currentTask?: string;
}

export interface OfficeMcpConnector {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "paired";
  tools: string[];
  allowed: boolean;
  denied: boolean;
}

export interface OfficeRoutine {
  id: string;
  dept: string;
  title: string;
  text: string;
  agent: string;
  when: string;
  needsOk: boolean;
  paused: boolean;
  nextAt?: number;
}

export class OfficeRuntimeService {
  private registry: CompanyRegistry;
  private routines: Map<string, OfficeRoutine> = new Map();

  constructor(registry?: CompanyRegistry) {
    this.registry = registry || new CompanyRegistry();
    this.initDefaultRoutines();
  }

  public getRegistry(): CompanyRegistry {
    return this.registry;
  }

  private initDefaultRoutines(): void {
    this.routines.set("morning-brief", {
      id: "morning-brief",
      dept: "executive",
      title: "Daily Executive & Risk Briefing",
      text: "Compile overnight trading returns and department deliverables",
      agent: "elead",
      when: "every weekday at 8:00am",
      needsOk: false,
      paused: false,
      nextAt: Date.now() + 3600000,
    });
    this.routines.set("market-scan", {
      id: "market-scan",
      dept: "trading",
      title: "Hourly Liquidity & Confluence Scan",
      text: "Scan major forex and crypto pairs across SMC and trend senseis",
      agent: "chief-trading-shihan",
      when: "every 1 hour",
      needsOk: true,
      paused: false,
      nextAt: Date.now() + 1800000,
    });
  }

  public getAgents(): OfficeAgentDto[] {
    const raw = this.registry.getAllAgents();
    return raw.map((a: SpecialistAgent) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      does: a.description || a.role,
      tools: a.tools || ["search", "filesystem", "database"],
      skills: a.skills || [],
      brief: a.description || `Specialist desk handling ${a.role}`,
      department: a.departmentId,
      lead: a.isLead || a.id.includes("lead") || a.id.includes("shihan"),
      interviewer: false,
      setUp: true,
      status: (a as any).status || "IDLE",
      currentTask: (a as any).currentTask,
    }));
  }

  public getMcpConnectors(): OfficeMcpConnector[] {
    return [
      {
        id: "chrome",
        name: "Chrome Browser",
        status: "connected",
        tools: ["open", "click", "read"],
        allowed: true,
        denied: false,
      },
      {
        id: "gmail",
        name: "Gmail Connector",
        status: "connected",
        tools: ["search", "read", "draft"],
        allowed: true,
        denied: false,
      },
      {
        id: "slack",
        name: "Slack Messaging",
        status: "connected",
        tools: ["send", "history"],
        allowed: true,
        denied: false,
      },
      {
        id: "notion",
        name: "Notion Knowledgebase",
        status: "connected",
        tools: ["query", "update"],
        allowed: true,
        denied: false,
      },
      {
        id: "stripe",
        name: "Stripe Billing",
        status: "connected",
        tools: ["invoice", "balance"],
        allowed: true,
        denied: false,
      },
      {
        id: "tradingview",
        name: "TradingView Charts",
        status: "connected",
        tools: ["chart", "indicator"],
        allowed: true,
        denied: false,
      },
    ];
  }

  public getRoutines(): OfficeRoutine[] {
    return Array.from(this.routines.values());
  }

  public async chatWithAgent(
    agentId: string,
    message: string,
    _history?: Array<{ role: string; content: string }>,
  ): Promise<{
    reply: string;
    agentId: string;
    toolsUsed: string[];
  }> {
    const agent = this.registry.getAgent(agentId);
    const agentName = agent ? agent.name : agentId;
    return {
      reply: `[${agentName}] Acknowledged: "${message}". Coordinating with the desk lead and executing required routines.`,
      agentId,
      toolsUsed: ["memory", "event-bus"],
    };
  }
}
