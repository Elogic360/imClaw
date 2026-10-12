/**
 * imClaw Agent Platform — Agent Registry & Lifecycle Manager
 * Manages registration, instantiation, heartbeats, permission checks, and lifecycle states.
 */

import crypto from "node:crypto";
import type { AgentInstance, AgentLifecycleState, AgentProfile } from "./agent-types.js";

export class AgentRegistry {
  private profiles: Map<string, AgentProfile> = new Map();
  private instances: Map<string, AgentInstance> = new Map();

  /**
   * Register or update an agent profile.
   */
  public registerProfile(profile: AgentProfile): void {
    this.profiles.set(profile.id, profile);
  }

  public getProfile(profileId: string): AgentProfile | undefined {
    return this.profiles.get(profileId);
  }

  public listProfiles(): AgentProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Spawn a managed agent instance from a registered profile.
   */
  public createInstance(profileId: string, parentInstanceId?: string): AgentInstance {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Cannot spawn agent: profile "${profileId}" is not registered.`);
    }

    const instanceId = `inst-${profile.id}-${crypto.randomUUID().slice(0, 8)}`;
    const now = Date.now();

    const instance: AgentInstance = {
      instanceId,
      profileId,
      state: "REGISTERED",
      parentInstanceId,
      childInstanceIds: [],
      createdAt: now,
      updatedAt: now,
      lastHeartbeat: now,
    };

    if (parentInstanceId) {
      const parent = this.instances.get(parentInstanceId);
      if (parent) {
        parent.childInstanceIds.push(instanceId);
      }
    }

    this.instances.set(instanceId, instance);
    return instance;
  }

  public getInstance(instanceId: string): AgentInstance | undefined {
    return this.instances.get(instanceId);
  }

  public transitionState(instanceId: string, newState: AgentLifecycleState): AgentInstance {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance "${instanceId}" not found.`);
    }

    // Guard terminal transitions
    if (instance.state === "TERMINATED") {
      throw new Error(`Cannot transition terminated instance "${instanceId}".`);
    }

    instance.state = newState;
    instance.updatedAt = Date.now();
    return instance;
  }

  public recordHeartbeat(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.lastHeartbeat = Date.now();
    }
  }

  public terminateInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    // Cascade termination to active child instances
    for (const childId of instance.childInstanceIds) {
      this.terminateInstance(childId);
    }

    instance.state = "TERMINATED";
    instance.updatedAt = Date.now();
  }

  public listActiveInstances(): AgentInstance[] {
    return Array.from(this.instances.values()).filter(
      (inst) => inst.state !== "TERMINATED" && inst.state !== "COMPLETED",
    );
  }
}
