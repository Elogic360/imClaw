/**
 * imClaw Skills Engine — Types & Permission Contracts
 * Skills are modular, versioned, sandboxed capability packages.
 */

export interface SkillPermissionSet {
  filesystemRead: boolean;
  filesystemWrite: boolean;
  networkAccess: boolean;
  brokerAccess: boolean;
  marketDataAccess: boolean;
  channelMessaging: boolean;
  memoryRead: boolean;
  memoryWrite: boolean;
}

export interface SkillManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  permissions: SkillPermissionSet;
  toolsProvided: string[];
  systemInstructions: string;
}

export class SkillRegistry {
  private skills: Map<string, SkillManifest> = new Map();

  public registerSkill(manifest: SkillManifest): void {
    this.skills.set(manifest.id, manifest);
  }

  public getSkill(skillId: string): SkillManifest | undefined {
    return this.skills.get(skillId);
  }

  public listSkills(): SkillManifest[] {
    return Array.from(this.skills.values());
  }

  /**
   * Verify if an agent's assigned skills satisfy required permissions.
   */
  public validatePermissions(
    skillId: string,
    requestedPermission: keyof SkillPermissionSet,
  ): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;
    return !!skill.permissions[requestedPermission];
  }
}
