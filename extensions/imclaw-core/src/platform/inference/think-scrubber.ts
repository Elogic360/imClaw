/**
 * imClaw Intelligence — Streaming Think Scrubber
 * Ported from Nous Research Hermes Agent (agent/think_scrubber.py)
 * Strips reasoning scratchpads (<think>, <thought>, <reasoning>) from streaming or full text.
 */

export const THINK_TAGS = [
  "think",
  "thinking",
  "reasoning",
  "thought",
  "REASONING_SCRATCHPAD",
  "思考",
  "反思",
  "推理",
  "推敲",
];

export class StreamingThinkScrubber {
  private inBlock: boolean = false;
  private buffer: string = "";
  private hiddenReasoning: string[] = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.inBlock = false;
    this.buffer = "";
    this.hiddenReasoning = [];
  }

  public getExtractedReasoning(): string {
    return this.hiddenReasoning.join("").trim();
  }

  /**
   * Feeds a delta token/string and returns scrubbed displayable text.
   */
  public feed(chunk: string): string {
    this.buffer += chunk;
    let output = "";

    while (this.buffer.length > 0) {
      if (!this.inBlock) {
        // Look for open tag
        let openMatchIndex = -1;
        let matchedTag = "";

        for (const tag of THINK_TAGS) {
          const openPattern = `<${tag}>`;
          const idx = this.buffer.toLowerCase().indexOf(openPattern.toLowerCase());
          if (idx !== -1 && (openMatchIndex === -1 || idx < openMatchIndex)) {
            openMatchIndex = idx;
            matchedTag = openPattern;
          }
        }

        if (openMatchIndex !== -1) {
          output += this.buffer.slice(0, openMatchIndex);
          this.buffer = this.buffer.slice(openMatchIndex + matchedTag.length);
          this.inBlock = true;
        } else {
          // No open tags in buffer, check if end might be an incomplete open tag (e.g. "<th")
          const lastLt = this.buffer.lastIndexOf("<");
          if (lastLt !== -1 && lastLt >= this.buffer.length - 25) {
            output += this.buffer.slice(0, lastLt);
            this.buffer = this.buffer.slice(lastLt);
            break;
          } else {
            output += this.buffer;
            this.buffer = "";
          }
        }
      } else {
        // Look for close tag
        let closeMatchIndex = -1;
        let matchedTag = "";

        for (const tag of THINK_TAGS) {
          const closePattern = `</${tag}>`;
          const idx = this.buffer.toLowerCase().indexOf(closePattern.toLowerCase());
          if (idx !== -1 && (closeMatchIndex === -1 || idx < closeMatchIndex)) {
            closeMatchIndex = idx;
            matchedTag = closePattern;
          }
        }

        if (closeMatchIndex !== -1) {
          this.hiddenReasoning.push(this.buffer.slice(0, closeMatchIndex));
          this.buffer = this.buffer.slice(closeMatchIndex + matchedTag.length);
          this.inBlock = false;
        } else {
          // Accumulate reasoning
          this.hiddenReasoning.push(this.buffer);
          this.buffer = "";
          break;
        }
      }
    }

    return output;
  }

  /**
   * Flushes any remaining buffer text when stream finishes.
   */
  public flush(): string {
    if (this.inBlock) {
      this.hiddenReasoning.push(this.buffer);
      this.buffer = "";
      return "";
    }
    const rem = this.buffer;
    this.buffer = "";
    return rem;
  }

  /**
   * Complete scrubber for non-streaming strings.
   */
  public scrubText(fullText: string): { cleanText: string; reasoning: string } {
    this.reset();
    const cleanText = this.feed(fullText) + this.flush();
    return {
      cleanText: cleanText.trim(),
      reasoning: this.getExtractedReasoning(),
    };
  }
}
