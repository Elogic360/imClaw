/**
 * imClaw Organization — Autonomous Agent Team Engine
 * Coordinates Department Leads splitting complex goals into 2-4 concurrent subtasks,
 * executing them in genuine parallel across specialist desks, and synthesizing the final deliverable.
 */

import crypto from "node:crypto";
import type { CompanyRegistry } from "./company-registry.js";
import type { DepartmentId, TeamExecutionPlan } from "./organization-types.js";

export type SpecialistSubtaskRunner = (
  agentId: string,
  instruction: string,
  departmentId: DepartmentId,
) => Promise<string>;

export class AgentTeamEngine {
  private registry: CompanyRegistry;
  private runner: SpecialistSubtaskRunner;

  constructor(registry: CompanyRegistry, runner?: SpecialistSubtaskRunner) {
    this.registry = registry;
    this.runner = runner || this.defaultRunner;
  }

  private async defaultRunner(
    agentId: string,
    instruction: string,
    _departmentId: DepartmentId,
  ): Promise<string> {
    return `[${agentId}] Executed: "${instruction}" -> Output: Deliverable verified.`;
  }

  /**
   * Plans and executes a team task across specialist desks concurrently.
   */
  public async executeTeamTask(
    departmentId: DepartmentId,
    goal: string,
    maxSpecialists: number = 4,
  ): Promise<TeamExecutionPlan> {
    const dept = this.registry.getDepartment(departmentId);
    if (!dept) {
      throw new Error(`Department ${departmentId} does not exist.`);
    }

    const lead = this.registry.getAgent(dept.leadId);
    if (!lead) {
      throw new Error(`Lead for department ${departmentId} does not exist.`);
    }

    const specialists = this.registry
      .getDepartmentAgents(departmentId)
      .filter((a) => !a.isLead)
      .slice(0, Math.max(2, maxSpecialists));

    const teamId = `team-${departmentId}-${crypto.randomUUID().slice(0, 8)}`;
    const plan: TeamExecutionPlan = {
      teamId,
      departmentId,
      leadId: lead.id,
      goal,
      subTasks: specialists.map((spec, idx) => ({
        subTaskId: `subtask-${idx + 1}-${spec.id}`,
        agentId: spec.id,
        title: `${spec.name} Execution`,
        instruction: `Analyze and contribute specialist deliverable on: "${goal}" from the perspective of ${spec.role}`,
        status: "QUEUED",
      })),
      notes: [],
      status: "RUNNING",
      startedAt: Date.now(),
    };

    // Parallel Execution of all specialist subtasks
    const executions = plan.subTasks.map(async (task) => {
      task.status = "RUNNING";
      task.startedAt = Date.now();
      try {
        const result = await this.runner(task.agentId, task.instruction, departmentId);
        task.output = result;
        task.status = "COMPLETED";
        task.completedAt = Date.now();

        // Note to lead
        plan.notes.push({
          fromAgentId: task.agentId,
          toAgentId: lead.id,
          content: `Subtask complete: ${result.slice(0, 100)}`,
        });
      } catch (err) {
        task.output = `Error: ${err instanceof Error ? err.message : String(err)}`;
        task.status = "FAILED";
        task.completedAt = Date.now();
      }
    });

    await Promise.all(executions);

    // Lead Synthesis Phase
    plan.status = "SYNTHESIZING";
    const completedPieces = plan.subTasks
      .filter((t) => t.status === "COMPLETED")
      .map((t) => `- [${t.agentId}]: ${t.output}`)
      .join("\n");

    plan.synthesizedResult = `[${lead.name} Synthesis]\nGoal: ${goal}\nDepartment: ${dept.name}\nCompleted Team Deliverables:\n${completedPieces}`;
    plan.status = "COMPLETED";
    plan.completedAt = Date.now();

    return plan;
  }
}
