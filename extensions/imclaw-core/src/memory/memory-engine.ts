/**
 * imClaw Memory Engine — Multi-Tiered Memory Architecture
 * Implements Working, Short-Term, Episodic, Semantic, and Permanent memory tiers.
 */

export type MemoryTier = "WORKING" | "SHORT_TERM" | "EPISODIC" | "SEMANTIC" | "PERMANENT";

export interface MemoryRecord {
  id: string;
  tier: MemoryTier;
  agentId: string;
  content: string;
  tags: string[];
  confidence: number;
  provenance: {
    taskId?: string;
    sessionId?: string;
    source: string;
  };
  createdAt: number;
  lastAccessedAt: number;
}

export class MultiTierMemoryEngine {
  private memoryStore: Map<string, MemoryRecord> = new Map();

  public store(record: Omit<MemoryRecord, "id" | "createdAt" | "lastAccessedAt">): MemoryRecord {
    const id = `mem-${record.tier.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const fullRecord: MemoryRecord = {
      ...record,
      id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };
    this.memoryStore.set(id, fullRecord);
    return fullRecord;
  }

  public query(agentId: string, options: { tier?: MemoryTier; tag?: string }): MemoryRecord[] {
    const results: MemoryRecord[] = [];
    const now = Date.now();

    for (const record of this.memoryStore.values()) {
      if (record.agentId !== agentId && record.agentId !== "GLOBAL") continue;
      if (options.tier && record.tier !== options.tier) continue;
      if (options.tag && !record.tags.includes(options.tag)) continue;

      record.lastAccessedAt = now;
      results.push(record);
    }

    return results;
  }

  public consolidate(agentId: string): { consolidatedCount: number } {
    // Elevate high-confidence episodic memories into semantic patterns
    let consolidatedCount = 0;
    for (const record of this.memoryStore.values()) {
      if (record.agentId === agentId && record.tier === "EPISODIC" && record.confidence >= 0.9) {
        record.tier = "SEMANTIC";
        consolidatedCount += 1;
      }
    }
    return { consolidatedCount };
  }
}
