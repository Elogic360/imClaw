/**
 * imClaw Organization — Core Types and Department Roster Contracts
 * Clean-room architecture modeling autonomous company departments, leads, and specialists.
 * Inspired by Agents Office multi-department concepts, implemented natively on imClaw.
 */

export type DepartmentId =
  | "marketing"
  | "emails"
  | "sales"
  | "operations"
  | "finance"
  | "delivery"
  | "trading";

export interface DepartmentConfig {
  id: DepartmentId;
  name: string;
  leadId: string;
  description: string;
  responsibilities: string[];
  allowedTools: string[];
  requiresApprovalForActions: boolean;
}

export interface SpecialistAgent {
  id: string;
  departmentId: DepartmentId;
  name: string;
  role: string;
  isLead: boolean;
  description: string;
  skills: string[];
  tools: string[];
  modelPreference?: string;
  effort?: "LOW" | "MEDIUM" | "HIGH";
  canSpawnTeam?: boolean;
}

export interface CompanyOrganization {
  name: string;
  departments: Map<DepartmentId, DepartmentConfig>;
  agents: Map<string, SpecialistAgent>;
}

export interface TeamSubTask {
  subTaskId: string;
  agentId: string;
  title: string;
  instruction: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  output?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface TeamExecutionPlan {
  teamId: string;
  departmentId: DepartmentId;
  leadId: string;
  goal: string;
  subTasks: TeamSubTask[];
  notes: Array<{ fromAgentId: string; toAgentId: string; content: string }>;
  status: "PLANNING" | "RUNNING" | "SYNTHESIZING" | "COMPLETED" | "FAILED";
  synthesizedResult?: string;
  startedAt: number;
  completedAt?: number;
}
