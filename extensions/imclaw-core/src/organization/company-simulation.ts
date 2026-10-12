/**
 * imClaw Organization — Autonomous Company Simulation Orchestrator
 * Integrates Company Registry, Task Router, Team Engine, Learning Engine,
 * and Deterministic Risk Controls into an end-to-end organizational simulation.
 */

import { CompanyRegistry } from "./company-registry.js";
import { LearningEngine } from "./learning-engine.js";
import type { TeamExecutionPlan } from "./organization-types.js";
import { TaskRouter, type TaskRouteResult } from "./task-router.js";
import { AgentTeamEngine } from "./team-engine.js";

export interface CompanyTaskResult {
  taskId: string;
  userPrompt: string;
  route: TaskRouteResult;
  teamPlan?: TeamExecutionPlan;
  finalDeliverable: string;
  requiresApproval: boolean;
  approvalStatus: "AUTO_APPROVED" | "PENDING_CONFIRMATION";
  executionDurationMs: number;
}

export class CompanySimulationOrchestrator {
  public registry: CompanyRegistry;
  public router: TaskRouter;
  public teamEngine: AgentTeamEngine;
  public learningEngine: LearningEngine;

  constructor() {
    this.registry = new CompanyRegistry();
    this.router = new TaskRouter(this.registry);
    this.teamEngine = new AgentTeamEngine(this.registry);
    this.learningEngine = new LearningEngine();
  }

  /**
   * Runs an end-to-end organizational task from user prompt through routing,
   * team formation, parallel desk execution, and lead synthesis.
   */
  public async executeCompanyTask(userPrompt: string): Promise<CompanyTaskResult> {
    const startTime = Date.now();
    const taskId = `task-${Date.now()}`;
    const route = this.router.routeRequest(userPrompt);

    let teamPlan: TeamExecutionPlan | undefined;
    let finalDeliverable: string;

    if (route.requiresTeam) {
      teamPlan = await this.teamEngine.executeTeamTask(route.departmentId, userPrompt, 4);
      finalDeliverable = teamPlan.synthesizedResult || "Team completed work.";
    } else {
      finalDeliverable = `[${route.targetLead.name}] Completed solo assessment for: "${userPrompt}" under department ${route.departmentId}.`;
    }

    // Determine approval requirements based on department policy
    const deptConfig = this.registry.getDepartment(route.departmentId);
    const requiresApproval = deptConfig?.requiresApprovalForActions ?? false;

    return {
      taskId,
      userPrompt,
      route,
      teamPlan,
      finalDeliverable,
      requiresApproval,
      approvalStatus: requiresApproval ? "PENDING_CONFIRMATION" : "AUTO_APPROVED",
      executionDurationMs: Date.now() - startTime,
    };
  }
}
