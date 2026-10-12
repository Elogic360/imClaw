/**
 * imClaw Security — ACL Bitmask Permission Authority
 * Ported from Jarvis Registry (scripts/backfill_acl_roleid.py, accessroles)
 * High-performance bitmask-based ACL evaluator for fine-grained resource and tool execution authority.
 */

export const PERM_BITS = {
  NONE: 0,
  READ: 1 << 0, // 1
  WRITE: 1 << 1, // 2
  EXECUTE: 1 << 2, // 4
  ADMIN: 1 << 3, // 8
  TRADE_EXECUTE: 1 << 4, // 16
  LIVE_CAPITAL: 1 << 5, // 32
} as const;

export type PermBitFlag = (typeof PERM_BITS)[keyof typeof PERM_BITS];

export interface AclRole {
  roleId: string;
  roleName: string;
  resourceType: string;
  permBits: number;
}

export interface AclEntry {
  principalId: string; // AgentId or UserId
  resourceType: string;
  roleId: string;
  grantedPermBits: number;
}

export class AclPermissionAuthority {
  private roles: Map<string, AclRole> = new Map();
  private entries: Map<string, AclEntry[]> = new Map(); // principalId -> entries

  constructor() {
    this.registerDefaultRoles();
  }

  private registerDefaultRoles(): void {
    this.registerRole({
      roleId: "role-viewer",
      roleName: "Resource Viewer",
      resourceType: "tools",
      permBits: PERM_BITS.READ,
    });
    this.registerRole({
      roleId: "role-operator",
      roleName: "Tool Operator",
      resourceType: "tools",
      permBits: PERM_BITS.READ | PERM_BITS.EXECUTE,
    });
    this.registerRole({
      roleId: "role-trader-sim",
      roleName: "Simulation Trader",
      resourceType: "trading",
      permBits: PERM_BITS.READ | PERM_BITS.TRADE_EXECUTE,
    });
    this.registerRole({
      roleId: "role-trader-live",
      roleName: "Live Capital Trader",
      resourceType: "trading",
      permBits: PERM_BITS.READ | PERM_BITS.TRADE_EXECUTE | PERM_BITS.LIVE_CAPITAL,
    });
  }

  public registerRole(role: AclRole): void {
    this.roles.set(role.roleId, role);
  }

  public grantRole(principalId: string, roleId: string): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Cannot grant unknown role: ${roleId}`);
    }

    const current = this.entries.get(principalId) || [];
    current.push({
      principalId,
      resourceType: role.resourceType,
      roleId,
      grantedPermBits: role.permBits,
    });
    this.entries.set(principalId, current);
  }

  /**
   * Evaluates whether a principal possesses the required permission bits on a resource type.
   */
  public hasPermission(principalId: string, resourceType: string, requiredBits: number): boolean {
    const principalEntries = this.entries.get(principalId) || [];
    let effectiveBits = PERM_BITS.NONE;

    for (const entry of principalEntries) {
      if (entry.resourceType === resourceType || entry.resourceType === "*") {
        effectiveBits |= entry.grantedPermBits;
      }
    }

    return (effectiveBits & requiredBits) === requiredBits;
  }
}
