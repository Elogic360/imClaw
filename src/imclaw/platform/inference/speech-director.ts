/**
 * imClaw Intelligence — Speech Director & Prosody Pacing
 * Ported from Xiaomi MiMo Skills (skills/mimo-v2-5-tts/SKILL.md)
 * Formats autonomous agent speech and market alerts with emotional nuance,
 * director-mode guidance, and inline prosody audio tags.
 */

export type VoiceUrgency = "CALM" | "NORMAL" | "URGENT" | "CRITICAL";

export interface SpeechDirectorSpec {
  roleDescription: string;
  sceneContext: string;
  directionGuidance: string;
  defaultPacing: "SLOW" | "MODERATE" | "FAST";
}

export class SpeechDirectorPacing {
  private defaultSpec: SpeechDirectorSpec;

  constructor(customSpec?: Partial<SpeechDirectorSpec>) {
    this.defaultSpec = {
      roleDescription:
        customSpec?.roleDescription || "Senior Financial Sensei & Quantitative Risk Commander.",
      sceneContext:
        customSpec?.sceneContext ||
        "Live financial markets environment delivering algorithmic decisions.",
      directionGuidance:
        customSpec?.directionGuidance ||
        "Confident, precise, measured articulation with clear pauses before numerical levels.",
      defaultPacing: customSpec?.defaultPacing || "MODERATE",
    };
  }

  /**
   * Formats an alert or market insight with inline prosody tags based on urgency.
   */
  public formatSpeechOutput(rawMessage: string, urgency: VoiceUrgency = "NORMAL"): string {
    switch (urgency) {
      case "CRITICAL":
        return `(urgent, authoritative) ATTENTION: ${rawMessage} (pause, serious) Immediate action required.`;
      case "URGENT":
        return `(focused, rapid pace) Market Alert: ${rawMessage}`;
      case "CALM":
        return `(calm, relaxed breath) Market Update: ${rawMessage}`;
      case "NORMAL":
      default:
        return `(clear, confident) ${rawMessage}`;
    }
  }

  /**
   * Compiles the full Director Mode prompt block for downstream TTS models.
   */
  public compileDirectorPrompt(message: string, urgency: VoiceUrgency = "NORMAL"): string {
    const formattedBody = this.formatSpeechOutput(message, urgency);
    return [
      `[Role]: ${this.defaultSpec.roleDescription}`,
      `[Scene]: ${this.defaultSpec.sceneContext}`,
      `[Direction]: ${this.defaultSpec.directionGuidance} [Pacing]: ${this.defaultSpec.defaultPacing}`,
      `[Script]: ${formattedBody}`,
    ].join("\n");
  }
}
