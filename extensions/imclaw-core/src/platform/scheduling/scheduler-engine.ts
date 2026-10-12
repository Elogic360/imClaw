/**
 * imClaw Platform Scheduling Engine
 * Supports one-time, interval, cron expressions, market-triggered, and event-triggered autonomous jobs.
 */

import crypto from "node:crypto";
import { ImClawEventBus } from "../events/event-bus.js";

export type JobTriggerType = "INTERVAL" | "CRON" | "EVENT" | "MARKET_CONDITION" | "ONE_TIME";

export interface ScheduledJobConfig {
  id?: string;
  name: string;
  triggerType: JobTriggerType;
  intervalMs?: number;
  cronExpression?: string;
  eventPattern?: string;
  targetAgentId: string;
  taskPayload: Record<string, unknown>;
  enabled: boolean;
  maxRetries?: number;
}

export interface ScheduledJobInstance extends ScheduledJobConfig {
  id: string;
  lastRunAt?: number;
  nextRunAt?: number;
  executionCount: number;
  status: "ACTIVE" | "PAUSED" | "RUNNING" | "FAILED";
}

export class AutonomousScheduler {
  private jobs: Map<string, ScheduledJobInstance> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private eventBus?: ImClawEventBus;

  constructor(eventBus?: ImClawEventBus) {
    this.eventBus = eventBus;
  }

  public registerJob(config: ScheduledJobConfig): ScheduledJobInstance {
    const id = config.id || `job-${crypto.randomBytes(4).toString("hex")}`;
    const instance: ScheduledJobInstance = {
      ...config,
      id,
      executionCount: 0,
      status: config.enabled ? "ACTIVE" : "PAUSED",
      nextRunAt: config.intervalMs ? Date.now() + config.intervalMs : undefined,
    };

    this.jobs.set(id, instance);

    if (instance.status === "ACTIVE" && instance.intervalMs) {
      this.armInterval(instance);
    }

    if (this.eventBus && instance.eventPattern) {
      this.eventBus.subscribe(
        instance.eventPattern as import("../events/event-bus.js").ImClawEventType,
        async (event) => {
          if (instance.status === "ACTIVE") {
            await this.executeJob(instance.id, { triggerEvent: event });
          }
        },
      );
    }

    return instance;
  }

  private armInterval(job: ScheduledJobInstance): void {
    if (this.timers.has(job.id)) {
      clearInterval(this.timers.get(job.id)!);
    }

    const timer = setInterval(async () => {
      await this.executeJob(job.id);
    }, job.intervalMs);

    this.timers.set(job.id, timer);
  }

  public async executeJob(
    jobId: string,
    runtimeContext?: Record<string, unknown>,
  ): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status === "PAUSED") return false;

    job.status = "RUNNING";
    job.lastRunAt = Date.now();
    job.executionCount++;

    try {
      if (this.eventBus) {
        await this.eventBus.emit("workflow.triggered", "scheduler", {
          jobId: job.id,
          name: job.name,
          agentId: job.targetAgentId,
          payload: { ...job.taskPayload, ...runtimeContext },
          executionCount: job.executionCount,
        });
      }

      job.status = "ACTIVE";
      if (job.intervalMs) {
        job.nextRunAt = Date.now() + job.intervalMs;
      }
      return true;
    } catch {
      job.status = "FAILED";
      return false;
    }
  }

  public pauseJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = "PAUSED";
    if (this.timers.has(jobId)) {
      clearInterval(this.timers.get(jobId)!);
      this.timers.delete(jobId);
    }
    return true;
  }

  public resumeJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = "ACTIVE";
    if (job.intervalMs) {
      this.armInterval(job);
    }
    return true;
  }

  public getJob(jobId: string): ScheduledJobInstance | undefined {
    return this.jobs.get(jobId);
  }

  public listJobs(): ScheduledJobInstance[] {
    return Array.from(this.jobs.values());
  }

  public stopAll(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
  }
}
