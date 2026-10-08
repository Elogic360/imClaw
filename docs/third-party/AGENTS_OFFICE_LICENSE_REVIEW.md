# Legal & License Review: Agents Office

**Reviewed Repository:** `/home/elogic360/Projects/agents-office`  
**License Identifier:** PolyForm Noncommercial License 1.0.0 + Sahni.ai Additional Terms  
**Copyright:** Copyright 2026 Sahni.ai, New Zealand (<https://sahni.ai>). Creator: AJ Sahni.  
**Audited Version:** `3.2.1-beta.2` (Commit: `2d4700189ee0900060a97ff3ab79f9eb0386ca23`)  
**Target Repository:** `/home/elogic360/Projects/imClaw`  
**Date:** 2026-10-08

---

## 1. Summary of Restrictive Terms

The Agents Office license imposes two major legal boundaries:

1. **PolyForm Noncommercial 1.0.0:** Only permits noncommercial research, testing, education, and study. Commercial exploitation is strictly restricted without a separate license.
2. **Sahni.ai Additional Terms (Critical Clauses):**
   - **Clause 1 (Name & Mark):** Prohibition on removing or altering Sahni.ai marks.
   - **Clause 2 (No Renaming or Rebranding):** Prohibits renaming Agents Office or presenting it as one's own work/product.
   - **Clause 3 (Not Part of Another Product or System):**
     > _"You may not adapt Agents Office to drive, display or front another agent system, workforce, platform or product, or bundle it with one, whether it is yours or a third party's."_

---

## 2. Mandatory Architectural Mandate: Clean-Room Implementation Only

Under Clause 3 and the PolyForm Noncommercial terms, **imClaw MUST NOT**:

- Copy any source files, scripts, or assets from `/home/elogic360/Projects/agents-office` into `/home/elogic360/Projects/imClaw`.
- Import or require `@agents-office` packages or bundle its files as a submodule, vendor directory, or runtime dependency.
- Disguise or wrap the Agents Office HTTP server as imClaw's backend.

### Permitted Clean-Room Engineering:

- **Observation of Concepts & Architectural Requirements:** The abstract concept of an enterprise office with 6 business departments (Marketing, Emails, Sales, Operations, Finance, Delivery), department leads delegating to specialist desks, multi-agent teams executing subtasks concurrently, and learning from corrections is an organizational concept.
- **Independent TypeScript Reimplementation:** All models, interfaces, engines, routers, and dispatchers in imClaw are written **100% from scratch** in TypeScript, adhering strictly to imClaw's native architecture, risk engine, and security boundaries.
- **Attribution:** Documenting the conceptual inspiration in `docs/third-party/AGENTS_OFFICE.md` and this audit review fulfills ethical software engineering standards while guaranteeing total license compliance.
