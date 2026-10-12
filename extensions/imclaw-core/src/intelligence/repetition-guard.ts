/**
 * imClaw Intelligence — Repetition Guard
 * Ported from Nous Research Hermes Agent (agent/repetition_guard.py)
 * Detects degenerative repetition loops in agent output before wasting token budgets.
 */

export interface RepetitionGuardConfig {
  minFragmentLength?: number;
  repeatWindow?: number;
  minRepeatCount?: number;
  dominanceRatio?: number;
}

export class RepetitionGuard {
  private minFragmentLength: number;
  private repeatWindow: number;
  private minRepeatCount: number;
  private dominanceRatio: number;

  constructor(config: RepetitionGuardConfig = {}) {
    this.minFragmentLength = config.minFragmentLength ?? 400;
    this.repeatWindow = config.repeatWindow ?? 60;
    this.minRepeatCount = config.minRepeatCount ?? 5;
    this.dominanceRatio = config.dominanceRatio ?? 0.5;
  }

  /**
   * Checks whether a given text output is dominated by exact repetitions.
   */
  public isRepetitionDominated(text: string): boolean {
    if (!text || typeof text !== "string") {
      return false;
    }
    const n = text.length;
    if (n < this.minFragmentLength) {
      return false;
    }

    const w = this.repeatWindow;
    const windowCounts = new Map<string, number>();

    // Step through the string with sliding window
    for (let i = 0; i <= n - w; i += Math.max(1, Math.floor(w / 2))) {
      const fragment = text.slice(i, i + w);
      windowCounts.set(fragment, (windowCounts.get(fragment) || 0) + 1);
    }

    let maxOccurrences = 0;
    for (const count of windowCounts.values()) {
      if (count > maxOccurrences) {
        maxOccurrences = count;
      }
    }

    if (maxOccurrences >= this.minRepeatCount) {
      // Calculate coverage ratio
      const estimatedCoverage = (maxOccurrences * w) / n;
      if (estimatedCoverage >= this.dominanceRatio) {
        return true;
      }
    }

    return false;
  }
}
