# Upstream Audit: Mimoclaw (XiaomiMiMo/MiMo-Skills)

**Baseline Upstream:** `https://github.com/XiaomiMiMo/MiMo-Skills.git` (`main`, commit `fa2a81225730f7a4885bb22dc7a7f646fc0b3823`)  
**Target Repository:** `/home/elogic360/Projects/imClaw`  
**License:** MIT  
**Date:** 2026-10-08

---

## 1. Upstream Architecture & Capabilities

Mimoclaw contains Xiaomi's MiMo agent skills for multi-modal emotion, director-guided voice inflection, and audio-aware speech synthesis:

1. **Director Prompt Mode (`skills/mimo-v2-5-tts/SKILL.md`):**
   - Three-dimensional character prompt model: `[Role]`, `[Scene]`, and `[Direction]`.
   - Modulates tempo, pacing, breathing, and emotional intensity.
2. **Inline Emotion & Prosody Tags (`skills/mimo-v2-5-tts/SKILL.md`):**
   - Natural language inline prosody brackets: `(calm, deep breath)`, `(rapid, urgent)`, `(confident)`.
   - Allows fine-grained control of synthesized agent speech across market alerts, trade confirmations, and executive briefing channels.

---

## 2. Comparison with imClaw

- **Current imClaw State:** Audio/TTS outputs lack structured prosody and director-mode styling for trading voice announcements.
- **Superior Mimoclaw Feature Selected for Integration:**
  - `SpeechDirectorPacing`: Director-mode speech formatting engine that compiles trader notifications and market signals with calibrated emotional tags and delivery directives.

---

## 3. Integration Plan

1. Create `src/imclaw/intelligence/speech-director.ts` (Clean TypeScript implementation).
2. Export from `src/imclaw/index.ts`.
3. Add unit tests to `src/imclaw/imclaw-subsystems.test.ts`.
4. Verify TypeScript compilation (`tsgo:core`) and Vitest test suite.
