/**
 * imClaw Antigravity Inference Bridge
 * Connects imClaw agents to Google Antigravity models using the authenticated
 * system Antigravity CLI (agy) and OAuth token keyring.
 */

import { spawn } from "node:child_process";

export interface AntigravityInferenceOptions {
  model?: string;
  effort?: "low" | "medium" | "high";
  systemPrompt?: string;
  timeoutMs?: number;
}

export class AntigravityBridge {
  private agyPath: string;
  private defaultModel: string;

  constructor(options: { agyPath?: string; defaultModel?: string } = {}) {
    this.agyPath = options.agyPath ?? (process.env.AGY_PATH || "/home/elogic360/.local/bin/agy");
    this.defaultModel =
      options.defaultModel ?? (process.env.ANTIGRAVITY_MODEL || "gemini-3.8-flash-low");
  }

  /**
   * Execute inference through Antigravity
   */
  public async generateText(
    prompt: string,
    options: AntigravityInferenceOptions = {},
  ): Promise<string> {
    const model = options.model || this.defaultModel;
    const effort = options.effort || "low";
    const timeout = options.timeoutMs || 30000;

    const fullPrompt = options.systemPrompt
      ? `System: ${options.systemPrompt}\n\nUser: ${prompt}`
      : prompt;

    return new Promise((resolve, reject) => {
      const args = ["-p", fullPrompt];
      if (model) args.push("--model", model);
      if (effort) args.push("--effort", effort);

      const child = spawn(this.agyPath, args, {
        env: {
          ...process.env,
          HOME: process.env.HOME || "/home/elogic360",
        },
      });

      let stdout = "";
      let stderr = "";

      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error(`Antigravity generation timed out after ${timeout}ms`));
      }, timeout);

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Antigravity exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
}
