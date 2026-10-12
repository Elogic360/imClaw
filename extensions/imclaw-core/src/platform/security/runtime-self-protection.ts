/**
 * imClaw Security — Runtime Self-Protection Engine
 * Ported from Nous Research Hermes Agent (agent/runtime_self_protection.py)
 * Hardens against destructive commands attempting to delete node_modules,
 * the running Node binary, repository workspace roots, or core package files.
 */

import path from "node:path";

export interface SelfProtectionConfig {
  workspaceRoot: string;
  blockedExecutables?: string[];
  protectedDirectories?: string[];
}

export class RuntimeSelfProtection {
  private workspaceRoot: string;
  public readonly blockedExecutables: Set<string>;
  private protectedDirectories: string[];

  constructor(config: SelfProtectionConfig) {
    this.workspaceRoot = path.resolve(config.workspaceRoot);
    this.blockedExecutables = new Set(config.blockedExecutables || ["node", "pnpm", "npm", "git"]);
    this.protectedDirectories = (
      config.protectedDirectories || [
        "node_modules",
        ".git",
        "src",
        "package.json",
        "pnpm-lock.yaml",
      ]
    ).map((d) => path.resolve(this.workspaceRoot, d));
  }

  /**
   * Analyzes a shell command to ensure it does not attempt to destroy the runtime.
   * Throws an error or returns false if a prohibited destructive operation is detected.
   */
  public isCommandSafe(commandLine: string): { safe: boolean; reason?: string } {
    if (!commandLine || typeof commandLine !== "string") {
      return { safe: true };
    }

    const trimmed = commandLine.trim();

    // Check for destructive deletion commands: rm, rmdir, unlink
    const destructivePattern = /\b(rm|rmdir|unlink)\s+([^\n;|]+)/gi;
    let match: RegExpExecArray | null;

    while ((match = destructivePattern.exec(trimmed)) !== null) {
      const args = match[2];
      if (!args) {
        continue;
      }
      const tokens = args.split(/\s+/);

      for (const token of tokens) {
        if (token.startsWith("-")) {
          continue; // flag like -rf
        }

        const resolvedTarget = path.resolve(this.workspaceRoot, token);

        // Protect workspace root itself
        if (resolvedTarget === this.workspaceRoot) {
          return {
            safe: false,
            reason: `Self-protection violation: Command attempts to delete the workspace root: ${token}`,
          };
        }

        // Protect critical directories and files
        for (const protectedPath of this.protectedDirectories) {
          if (
            resolvedTarget === protectedPath ||
            resolvedTarget.startsWith(protectedPath + path.sep)
          ) {
            return {
              safe: false,
              reason: `Self-protection violation: Command attempts to delete protected path: ${token}`,
            };
          }
        }
      }
    }

    return { safe: true };
  }
}
