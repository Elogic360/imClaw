/**
 * imClaw Workflow Engine — Types & Node Contracts
 * Adopts n8n's DAG execution patterns: Triggers, Conditions, Actions, Retries, and States.
 */

export type WorkflowNodeType =
  | "trigger:cron"
  | "trigger:webhook"
  | "trigger:market_event"
  | "condition:if"
  | "action:sensei_analyze"
  | "action:risk_check"
  | "action:execute_trade"
  | "action:send_notification"
  | "action:custom_tool";

export type WorkflowStatus =
  | "IDLE"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "PAUSED_APPROVAL"
  | "CANCELED";

export function isCompletedWorkflowStatus(status: WorkflowStatus): boolean {
  return status === "COMPLETED" || status === "FAILED" || status === "CANCELED";
}

export function isTerminalWorkflowStatus(status: WorkflowStatus): boolean {
  return isCompletedWorkflowStatus(status);
}

export interface WorkflowNodeData {
  id: string;
  name: string;
  type: WorkflowNodeType;
  parameters: Record<string, unknown>;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export interface WorkflowConnection {
  fromNodeId: string;
  toNodeId: string;
  conditionBranch?: "true" | "false" | "default";
}

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  description: string;
  nodes: WorkflowNodeData[];
  connections: WorkflowConnection[];
  enabled: boolean;
  createdAt: number;
}

export interface NodeExecutionResult {
  nodeId: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  outputData: unknown;
  error?: string;
  attempts?: number;
  durationMs: number;
}

export interface WorkflowExecutionRun {
  executionId: string;
  workflowId: string;
  status: WorkflowStatus;
  startedAt: number;
  completedAt?: number;
  nodeResults: Map<string, NodeExecutionResult>;
  context: Record<string, unknown>;
}
