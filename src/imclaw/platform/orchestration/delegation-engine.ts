/**
 * imClaw Delegation & Orchestration Engine
 * Implements hierarchical agent delegation from Shihan to Senseis to Task Workers.
 */

import { AgentRegistry } from "../agents/agent-registry.js";

export interface DelegationTask {
  taskId: string;
  taskType: string;
  requiredDomain: string;
  payload: Record<string, unknown>;
  priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  deadlineMs?: number;
}

export interface DelegationResult {
  taskId: string;
  delegatedToInstanceId: string;
  delegatedToProfileId: string;
  status: "DELEGATED" | "NO_ELIGIBLE_AGENT";
  reason?: string;
}

export class DelegationEngine {
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  /**
   * Find the most qualified active agent instance or instantiate one based on domain & capability.
   */
  public delegateTask(task: DelegationTask, parentInstanceId?: string): DelegationResult {
    const profiles = this.registry.listProfiles();
    // Match by required domain or capability
    const match = profiles.find((p) =>
      p.domain.toLowerCase().includes(task.requiredDomain.toLowerCase()),
    );

    if (!match) {
      return {
        taskId: task.taskId,
        delegatedToInstanceId: "",
        delegatedToProfileId: "",
        status: "NO_ELIGIBLE_AGENT",
        reason: `No registered agent profile for domain "${task.requiredDomain}".`,
      };
    }

    const instance = this.registry.createInstance(match.id, parentInstanceId);
    this.registry.transitionState(instance.instanceId, "READY");

    return {
      taskId: task.taskId,
      delegatedToInstanceId: instance.instanceId,
      delegatedToProfileId: match.id,
      status: "DELEGATED",
    };
  }
}
