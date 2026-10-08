# Upstream Clean-Room Audit: n8n Workflow Engine (n8n-io/n8n)

**Baseline Upstream:** `https://github.com/n8n-io/n8n.git` (`master`, commit `c194d22b5c02139d5bc7127a16df2f8a5ec62cb3`)  
**Target Repository:** `/home/elogic360/Projects/imClaw`  
**License Notice:** Sustainable Use License (Non-copyleft / Fair-code).  
**Engineering Methodology:** **STRICT CLEAN-ROOM ARCHITECTURAL REIMPLEMENTATION ONLY.** Absolutely zero upstream code was copied or pasted. All models and logic were engineered independently from architectural principles.  
**Date:** 2026-10-08

---

## 1. Upstream Architectural Principles Studied

1. **Execution Status Lifecycle (`packages/workflow/src/execution-status.ts`):**
   - Precise status machine: `new` -> `running` -> `waiting` -> `success` / `error` / `crashed` / `canceled`.
   - Distinct predicates `isTerminalExecutionStatus` and `isCompletedExecutionStatus` to prevent resurrection or state confusion.
2. **Deterministic Node Retry with Exponential Backoff:**
   - Node-level max retries configuration with monotonic delay calculation.
3. **Execution Dead-Letter Queue (DLQ) & Failure Recovery:**
   - Preserves partial run context and records unhandled errors for triage.

---

## 2. Comparison with imClaw

- **Current imClaw State:** `DeterministicWorkflowEngine` executes topological DAG graphs with conditional branching, but did not have retry with exponential backoff on node failures or terminal status discrimination predicates.
- **Enhanced imClaw Clean-Room Features:**
  - Integrated automatic node retries (`maxRetries`, `retryOnFailure`).
  - Formalized terminal status predicates (`isTerminalStatus`, `isCompletedStatus`).
  - Added node error isolation so failed attempts record retry counts accurately.

---

## 3. Integration Plan

1. Update `src/imclaw/workflows/workflow-types.ts` with status predicates.
2. Enhance `src/imclaw/workflows/workflow-engine.ts` with clean-room retry backoff execution.
3. Add tests in `src/imclaw/imclaw-subsystems.test.ts`.
4. Verify TypeScript compilation (`tsgo:core`) and Vitest test suite.
