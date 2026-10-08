# Upstream Audit: Hermes Agent (NousResearch/hermes-agent)

**Baseline Upstream:** `https://github.com/NousResearch/hermes-agent.git` (`main`, commit `7dab93b06e2bb3757dc18229169efcee1b5b47a3`)  
**Target Repository:** `/home/elogic360/Projects/imClaw`  
**License:** MIT  
**Date:** 2026-10-07

---

## 1. Upstream Architecture & Capabilities

Hermes Agent is Nous Research's production agent runtime designed around Hermes models and autonomous tool loops.
Key architectural capabilities:

1. **Repetition Guard (`agent/repetition_guard.py`):**
   - Detects degenerative output loops before hitting length truncation.
   - Prevents cascading token waste and corrupted conversation history from repetitive model outputs.
2. **Streaming Think Scrubber (`agent/think_scrubber.py`):**
   - Stateful reasoning and scratchpad tag scrubber for streaming tokens.
   - Handles multi-turn streaming boundaries without leaking internal thought blocks (`<think>`, `<thought>`, `<reasoning>`, CJK equivalents).
3. **Runtime Self-Protection (`agent/runtime_self_protection.py`):**
   - Non-bypassable approval floor preventing the agent from deleting its own executable, venv, or runtime dependencies via shell commands or tool invocations.

---

## 2. Comparison with imClaw

- **OpenClaw/imClaw current state:** Lacks streaming think scrubber and output repetition detector; guards against runtime self-deletion are ad-hoc rather than hardened into the command execution engine.
- **Superior Hermes Features Selected for Integration:**
  - `RepetitionGuard`: Deterministic detector for runaway repetitive token loops in agent responses.
  - `StreamingThinkScrubber`: Stateful stream parser that isolates and scrubs raw `<think>` blocks while preserving clean user output.
  - `RuntimeSelfProtection`: Protection engine that analyzes shell commands for dangerous self-deletion vectors.

---

## 3. Integration Plan

1. Create `src/imclaw/intelligence/repetition-guard.ts` (Clean TypeScript implementation).
2. Create `src/imclaw/intelligence/think-scrubber.ts` (Clean TypeScript implementation).
3. Create `src/imclaw/security/runtime-self-protection.ts` (Clean TypeScript implementation).
4. Integrate with `src/imclaw/index.ts` and add unit tests to `src/imclaw/imclaw-subsystems.test.ts`.
5. Verify TypeScript compilation (`tsgo:core`) and Vitest execution.
