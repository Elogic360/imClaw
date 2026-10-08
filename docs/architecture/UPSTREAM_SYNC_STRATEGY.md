# imClaw Upstream Sync Strategy & Long-Term Maintenance Plan

**Document ID:** IMCLAW-SYNC-STRATEGY  
**Date:** 2026-10-07  
**Author:** Principal Autonomous Software Architect & Systems Engineering Lead  
**Repository:** `/home/elogic360/Projects/openclaw`

---

## 1. Upstream Tracking Metadata

- **Upstream Git Remote:** `https://github.com/openclaw/openclaw.git`
- **Tracked Branch:** `main`
- **Initial Hybridization Baseline Commit:** `cb01febf9fa4fbda271d10b3adff3b384c6ece76`
- **Package Manifest Version:** `2026.9.8`
- **Local Namespace Isolation:** All imClaw domain extensions are isolated under:
  - `src/imclaw/` (Risk, Trading, Workflows, Senseis, Journal)
  - `docs/` (Architecture, Research, Third-Party governance)

---

## 2. Upstream Merge & Rebase Strategy

To prevent downstream fork divergence and merge conflicts:

1. **Zero Modification to Core Files:** Do not perform invasive rewrites of `packages/agent-core`, `src/gateway/server/`, or `src/state/openclaw-agent-db-contract.ts`.
2. **Hook-Based Integration:** Any custom imClaw tools or RPC methods connect via OpenClaw's official extension points (`packages/plugin-sdk/` and `src/plugins/`).
3. **Synchronizing with Upstream Updates:**
   ```bash
   git fetch origin main
   git merge origin/main --no-commit --no-ff
   # Run automated regression suite:
   node scripts/run-vitest.mjs src/imclaw/imclaw-subsystems.test.ts
   ```
4. **Automated Continuous Testing:** The test suite (`src/imclaw/imclaw-subsystems.test.ts`) verifies the integrity of the Risk Guard, Financial Pipeline, and Workflow Engine after every upstream sync.
