# Upstream Audit: NanoClaw (nanocoai/nanoclaw)

**Baseline Upstream:** `https://github.com/nanocoai/nanoclaw.git` (`main`, commit `66f0823a693bd9cca4123e72f8ccee05f5e7e1c5`)  
**Target Repository:** `/home/elogic360/Projects/imClaw`  
**License:** MIT  
**Date:** 2026-10-07

---

## 1. Upstream Architecture & Capabilities

NanoClaw provides lightweight container supervision, multi-tenant session coordination, and crash-resilient process isolation for agents.
Key architectural capabilities:

1. **Session Claim Fencing & Incarnation CAS (`src/db/coordination.ts`, `src/session-claim-fencing.test.ts`):**
   - Implements optimistic Compare-And-Swap (CAS) fencing on agent session claims.
   - Prevents split-brain execution across multiple worker hosts or overlapping processes.
   - Stale finish callbacks or zombie workers cannot overwrite or stomp newer incarnation state.
2. **Container Task Runner & Resource Limiting (`src/container-runner.ts`):**
   - Strict sandboxing with CPU, memory, PIDs limits, and clean unmount guarantees.
3. **Graceful Sweep & Zombie Reaper (`src/host-sweep.ts`):**
   - Automated heartbeat-based eviction of uncoordinated or dead agent sessions.

---

## 2. Comparison with imClaw

- **Current imClaw State:** Agent registry handles process tree cascading, but lacks incarnation claim fencing and lock leases if multiple agent instances attempt to coordinate over shared resources or session state.
- **Superior NanoClaw Feature Selected for Integration:**
  - `SessionClaimFencing`: Distributed CAS fencing token engine ensuring single-incarnation execution per agent session with monotonic incarnation numbers and stop intents.

---

## 3. Integration Plan

1. Create `src/imclaw/orchestration/session-fencing.ts` with Compare-And-Swap (CAS) claim tokens, incarnation monotonically increasing counters, and fencing lease checks.
2. Export from `src/imclaw/index.ts`.
3. Add unit tests to `src/imclaw/imclaw-subsystems.test.ts`.
4. Verify TypeScript compilation (`tsgo:core`) and Vitest test suite.
