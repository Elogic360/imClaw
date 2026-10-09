/**
 * imClaw Context Engine
 * Provides intelligent context window management, compression, summarization, and token budgeting.
 */

export interface ContextItem {
  id: string;
  source: "OBSERVATION" | "MEMORY" | "TOOL_RESULT" | "SPECIALIST_VOTE" | "MARKET_STATE";
  priority: number; // 1 (highest) to 10 (lowest)
  content: string;
  tokenEstimate: number;
  timestamp: number;
}

export interface ContextBudget {
  maxTokens: number;
  reservedTokens: number;
}

export class ContextEngine {
  private items: ContextItem[] = [];
  private budget: ContextBudget;

  constructor(budget: ContextBudget = { maxTokens: 8192, reservedTokens: 1024 }) {
    this.budget = budget;
  }

  public addItem(item: Omit<ContextItem, "tokenEstimate" | "timestamp">): ContextItem {
    const tokenEstimate = Math.ceil(item.content.length / 4);
    const fullItem: ContextItem = {
      ...item,
      tokenEstimate,
      timestamp: Date.now(),
    };
    this.items.push(fullItem);
    return fullItem;
  }

  public compileContext(): { content: string; totalTokens: number; droppedCount: number } {
    // Sort items by priority ascending (1 highest priority), then timestamp descending
    const sorted = [...this.items].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.timestamp - a.timestamp;
    });

    const maxAllowedTokens = this.budget.maxTokens - this.budget.reservedTokens;
    let accumulatedTokens = 0;
    const included: ContextItem[] = [];
    let droppedCount = 0;

    for (const item of sorted) {
      if (accumulatedTokens + item.tokenEstimate <= maxAllowedTokens) {
        included.push(item);
        accumulatedTokens += item.tokenEstimate;
      } else {
        droppedCount++;
      }
    }

    const compiledContent = included.map((i) => `[${i.source}] ${i.content}`).join("\n\n");
    return {
      content: compiledContent,
      totalTokens: accumulatedTokens,
      droppedCount,
    };
  }

  public clear(): void {
    this.items = [];
  }
}
