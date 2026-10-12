/**
 * imClaw Agent Platform — Types & Contracts
 * Foundational definitions for Agent Profiles, Roles, States, Lifecycle, and Scoped Permissions.
 */

export type AgentRole =
  | "CHIEF_SHIHAN"
  | "DOMAIN_SHIHAN"
  | "MASTER_SENSEI"
  | "SPECIALIST_SENSEI"
  | "SUB_SENSEI"
  | "TASK_WORKER";

export type AgentLifecycleState =
  | "REGISTERED"
  | "INITIALIZING"
  | "READY"
  | "RUNNING"
  | "WAITING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TERMINATED";

export interface AgentTradingPermissions {
  canReadMarketData: boolean;
  canReadAccounts: boolean;
  canCreateOrders: boolean;
  canModifyOrders: boolean;
  canModifyPositions: boolean;
  canClosePositions: boolean;
  canExecuteLiveTrades: boolean;
}

export interface AgentSystemPermissions {
  filesystem: "DENY" | "READ_WORKSPACE" | "WRITE_WORKSPACE" | "FULL";
  network: "DENY" | "ALLOWLISTED" | "FULL";
  shellExecution: "DENY" | "CONTAINER_ONLY" | "HOST_APPROVAL";
  maxConcurrentTasks: number;
  allowedChannels: string[];
  allowedWorkflows: string[];
  trading: AgentTradingPermissions;
}

export interface AgentResourceLimits {
  maxMemoryMb: number;
  timeoutMs: number;
  maxDailyCostUsd: number;
  maxTokensPerTurn: number;
}

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  version: string;
  role: AgentRole;
  domain: string;
  systemPrompt: string;
  requiredSkills: string[];
  optionalSkills: string[];
  requiredMcpServers: string[];
  permissions: AgentSystemPermissions;
  resourceLimits: AgentResourceLimits;
  modelPreferences: {
    primaryModel: string;
    fallbackModel?: string;
    temperature?: number;
  };
}

export interface AgentInstance {
  instanceId: string;
  profileId: string;
  state: AgentLifecycleState;
  activeTaskId?: string;
  parentInstanceId?: string;
  childInstanceIds: string[];
  createdAt: number;
  updatedAt: number;
  lastHeartbeat: number;
}
