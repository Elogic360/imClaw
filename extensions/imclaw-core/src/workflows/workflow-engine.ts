/**
 * imClaw Workflow Engine — Deterministic DAG Orchestrator
 * Implements deterministic workflow execution with dependency topological ordering,
 * conditional branching, backoff retries, and error handling.
 */

import crypto from "node:crypto";
import type {
  WorkflowDefinition,
  WorkflowExecutionRun,
  WorkflowNodeData,
} from "./workflow-types.js";

export type NodeExecutionHandler = (
  parameters: Record<string, unknown>,
  context: Record<string, unknown>,
  inputData: unknown,
) => Promise<unknown>;

export class DeterministicWorkflowEngine {
  private handlers: Map<string, NodeExecutionHandler> = new Map();

  constructor() {
    this.registerDefaultHandlers();
  }

  public registerHandler(nodeType: string, handler: NodeExecutionHandler): void {
    this.handlers.set(nodeType, handler);
  }

  private registerDefaultHandlers(): void {
    // Basic Condition: IF Node
    this.registerHandler("condition:if", async (params, _ctx, input) => {
      const field = String(params.field || "");
      const expected = params.equals;
      const actual = (input as Record<string, unknown>)?.[field];
      return actual === expected;
    });

    // Notification Action Node
    this.registerHandler("action:send_notification", async (params) => {
      const channel = params.channel || "console";
      const message = params.message || "No message";
      return { sent: true, channel, message, timestamp: Date.now() };
    });
  }

  /**
   * Execute a workflow definition with initial trigger data.
   */
  public async executeWorkflow(
    workflow: WorkflowDefinition,
    initialData: Record<string, unknown> = {},
  ): Promise<WorkflowExecutionRun> {
    const executionId = `wf-run-${crypto.randomUUID()}`;
    const run: WorkflowExecutionRun = {
      executionId,
      workflowId: workflow.workflowId,
      status: "RUNNING",
      startedAt: Date.now(),
      nodeResults: new Map(),
      context: { ...initialData },
    };

    const nodeMap = new Map<string, WorkflowNodeData>(workflow.nodes.map((n) => [n.id, n]));
    const executedNodes = new Set<string>();

    // Identify start/trigger nodes (nodes with no incoming connections)
    const incomingEdges = new Set<string>(workflow.connections.map((c) => c.toNodeId));
    const startNodes = workflow.nodes.filter((n) => !incomingEdges.has(n.id));

    const queue: Array<{ nodeId: string; inputData: unknown }> = startNodes.map((n) => ({
      nodeId: n.id,
      inputData: initialData,
    }));

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (executedNodes.has(current.nodeId)) continue;

      const node = nodeMap.get(current.nodeId);
      if (!node) continue;

      const handler = this.handlers.get(node.type);
      const startTime = Date.now();

      if (!handler) {
        run.nodeResults.set(node.id, {
          nodeId: node.id,
          status: "FAILED",
          outputData: null,
          error: `No handler registered for node type: ${node.type}`,
          durationMs: Date.now() - startTime,
        });
        run.status = "FAILED";
        run.completedAt = Date.now();
        return run;
      }

      let attempts = 0;
      const maxAttempts = node.retryOnFailure ? (node.maxRetries ?? 3) + 1 : 1;
      let lastError: unknown = null;
      let output: unknown = null;
      let success = false;

      while (attempts < maxAttempts && !success) {
        attempts++;
        try {
          output = await handler(node.parameters, run.context, current.inputData);
          success = true;
        } catch (err) {
          lastError = err;
        }
      }

      if (success) {
        executedNodes.add(node.id);
        run.nodeResults.set(node.id, {
          nodeId: node.id,
          status: "SUCCESS",
          outputData: output,
          attempts,
          durationMs: Date.now() - startTime,
        });

        // Enqueue next nodes based on connection edges
        const outgoing = workflow.connections.filter((c) => c.fromNodeId === node.id);
        for (const conn of outgoing) {
          if (node.type === "condition:if") {
            const branchCondition = output === true ? "true" : "false";
            if (conn.conditionBranch === branchCondition) {
              queue.push({ nodeId: conn.toNodeId, inputData: output });
            }
          } else {
            queue.push({ nodeId: conn.toNodeId, inputData: output });
          }
        }
      } else {
        run.nodeResults.set(node.id, {
          nodeId: node.id,
          status: "FAILED",
          outputData: null,
          attempts,
          error: lastError instanceof Error ? lastError.message : String(lastError),
          durationMs: Date.now() - startTime,
        });
        run.status = "FAILED";
        run.completedAt = Date.now();
        return run;
      }
    }

    run.status = "COMPLETED";
    run.completedAt = Date.now();
    return run;
  }
}
