/**
 * imClaw Model Routing & Optimization Engine
 * Routes agent tasks to optimal LLMs based on reasoning complexity, latency, and cost constraints.
 */

export interface ModelTierConfig {
  id: string;
  name: string;
  costTier: "LOW" | "BALANCED" | "HIGH" | "FLAGSHIP";
  supportsReasoning: boolean;
  supportsVision: boolean;
  maxContextTokens: number;
}

export const REGISTERED_MODELS: Record<string, ModelTierConfig> = {
  "gemini-flash": {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    costTier: "LOW",
    supportsReasoning: true,
    supportsVision: true,
    maxContextTokens: 1000000,
  },
  "claude-sonnet": {
    id: "claude-sonnet",
    name: "Claude 3.7 Sonnet",
    costTier: "BALANCED",
    supportsReasoning: true,
    supportsVision: true,
    maxContextTokens: 200000,
  },
  "deepseek-r1": {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    costTier: "LOW",
    supportsReasoning: true,
    supportsVision: false,
    maxContextTokens: 128000,
  },
  "antigravity-gemini-3.8-flash": {
    id: "antigravity-gemini-3.8-flash",
    name: "Antigravity Gemini 3.8 Flash",
    costTier: "LOW",
    supportsReasoning: true,
    supportsVision: true,
    maxContextTokens: 1000000,
  },
  "antigravity-gemini-3.1-pro": {
    id: "antigravity-gemini-3.1-pro",
    name: "Antigravity Gemini 3.1 Pro",
    costTier: "FLAGSHIP",
    supportsReasoning: true,
    supportsVision: true,
    maxContextTokens: 2000000,
  },
  "antigravity-claude-sonnet-5.5": {
    id: "antigravity-claude-sonnet-5.5",
    name: "Antigravity Claude Sonnet 5.5",
    costTier: "HIGH",
    supportsReasoning: true,
    supportsVision: true,
    maxContextTokens: 200000,
  },
};

export class ModelRouter {
  public selectModel(task: {
    complexity: "SIMPLE" | "MEDIUM" | "COMPLEX";
    requiresVision?: boolean;
    costConstraint?: "STRICT" | "FLEXIBLE";
    useAntigravity?: boolean;
  }): string {
    if (task.useAntigravity) {
      if (task.complexity === "COMPLEX") return "antigravity-gemini-3.1-pro";
      return "antigravity-gemini-3.8-flash";
    }

    if (task.complexity === "SIMPLE" && !task.requiresVision) {
      return "deepseek-r1";
    }

    if (task.complexity === "COMPLEX" || task.costConstraint === "FLEXIBLE") {
      return "claude-sonnet";
    }

    return "gemini-flash";
  }
}
