/**
 * imClaw Organization — Autonomous Task Router
 * Routes inbound natural language requests and goals to the appropriate department, lead, and specialists.
 * Uses deterministic keyword classification combined with semantic intent rules.
 */

import type { CompanyRegistry } from "./company-registry.js";
import type { DepartmentId, SpecialistAgent } from "./organization-types.js";

export interface TaskRouteResult {
  departmentId: DepartmentId;
  targetLead: SpecialistAgent;
  candidateAgents: SpecialistAgent[];
  requiresTeam: boolean;
  priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  confidence: number;
}

export class TaskRouter {
  private registry: CompanyRegistry;

  constructor(registry: CompanyRegistry) {
    this.registry = registry;
  }

  /**
   * Deterministically routes user requests to the appropriate department and lead.
   */
  public routeRequest(text: string): TaskRouteResult {
    const lower = text.toLowerCase();

    // 1. Check for Team Intent
    const teamIntentRegex = /\b(team|as a team|together|collaborate|split|department)\b/i;
    const requiresTeam = teamIntentRegex.test(lower);

    // 2. Department routing heuristics
    let selectedDept: DepartmentId = "operations";
    let confidence = 0.7;

    if (
      /\b(btc|eth|crypto|forex|orderflow|liquidity|trade|market structure|risk engine|drawdown)\b/i.test(
        lower,
      )
    ) {
      selectedDept = "trading";
      confidence = 0.95;
    } else if (
      /\b(marketing|campaign|social|copywriting|seo|content|growth|brand)\b/i.test(lower)
    ) {
      selectedDept = "marketing";
      confidence = 0.92;
    } else if (
      /\b(email|inbox|client email|vendor email|newsletter draft|reply to)\b/i.test(lower)
    ) {
      selectedDept = "emails";
      confidence = 0.9;
    } else if (/\b(sales|lead|pipeline|prospect|crm|proposal|quote|deal)\b/i.test(lower)) {
      selectedDept = "sales";
      confidence = 0.9;
    } else if (
      /\b(finance|financial|accounting|cashflow|balance sheet|reconciliation|budget)\b/i.test(lower)
    ) {
      selectedDept = "finance";
      confidence = 0.93;
    } else if (/\b(delivery|deliverable|qa|release|fulfillment|packaging|ship)\b/i.test(lower)) {
      selectedDept = "delivery";
      confidence = 0.88;
    }

    const dept = this.registry.getDepartment(selectedDept);
    if (!dept) {
      throw new Error(`Department not found for id: ${selectedDept}`);
    }

    const lead = this.registry.getAgent(dept.leadId);
    if (!lead) {
      throw new Error(`Lead not found for department: ${selectedDept}`);
    }

    const candidates = this.registry.getDepartmentAgents(selectedDept);

    return {
      departmentId: selectedDept,
      targetLead: lead,
      candidateAgents: candidates,
      requiresTeam,
      priority: /\b(critical|urgent|asap|emergency)\b/i.test(lower) ? "CRITICAL" : "NORMAL",
      confidence,
    };
  }
}
