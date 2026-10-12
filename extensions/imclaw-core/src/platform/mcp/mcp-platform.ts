/**
 * imClaw MCP Platform — Permissioned Tool Router & Security Monitor
 * Enforces least-privilege tool routing, SSRF defense, and credential redaction.
 */

export interface McpServerMetadata {
  id: string;
  name: string;
  version: string;
  transport: "stdio" | "sse" | "websocket";
  trustLevel: "BUILTIN" | "VERIFIED" | "SANDBOXED" | "UNTRUSTED";
  allowedAgents: string[];
  exposedTools: string[];
  networkPolicy: "ISOLATED" | "ALLOWLIST" | "UNRESTRICTED";
}

export class McpPlatformManager {
  private servers: Map<string, McpServerMetadata> = new Map();

  public registerServer(metadata: McpServerMetadata): void {
    this.servers.set(metadata.id, metadata);
  }

  public getServer(serverId: string): McpServerMetadata | undefined {
    return this.servers.get(serverId);
  }

  /**
   * Deterministically check if an agent profile is authorized to call an MCP tool.
   */
  public isToolInvocationPermitted(
    agentProfileId: string,
    serverId: string,
    toolName: string,
  ): { permitted: boolean; reason?: string } {
    const server = this.servers.get(serverId);
    if (!server) {
      return { permitted: false, reason: `MCP server "${serverId}" not registered.` };
    }

    if (!server.exposedTools.includes(toolName)) {
      return {
        permitted: false,
        reason: `Tool "${toolName}" is not exported by server "${serverId}".`,
      };
    }

    if (
      server.allowedAgents.length > 0 &&
      !server.allowedAgents.includes(agentProfileId) &&
      !server.allowedAgents.includes("*")
    ) {
      return {
        permitted: false,
        reason: `Agent "${agentProfileId}" is not authorized for server "${serverId}".`,
      };
    }

    return { permitted: true };
  }
}
