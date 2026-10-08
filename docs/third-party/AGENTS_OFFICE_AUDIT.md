# Technical Audit & Behavioral Analysis: Agents Office

**Target Source:** `/home/elogic360/Projects/agents-office`  
**Inspected Version:** `3.2.1-beta.2` (Commit: `2d4700189ee0900060a97ff3ab79f9eb0386ca23`)  
**Auditor:** Principal AI Systems Architect & Senior Agentic Systems Engineer  
**Date:** 2026-10-08

---

## 1. System Overview & Architecture

Agents Office provides a local multi-agent organizational runtime. It models an office with:

- **6 Fixed Departments:** Marketing, Emails, Sales, Operations, Finance, Delivery.
- **35 Desk Agents:** Each with an `id`, `name`, `role`, `does` description, `tools` list, and optional standing instructions (`brief`).
- **Department Leads:** Exactly one lead agent per department who coordinates inbound work and spawns teams.
- **Agent Teams (`teams.mjs`):**
  - Intent detection: triggers on phrases like `"as a team"`, `"team up"`, `"spawn three teammates"`.
  - Planning prompt: Department Lead splits incoming request into 2 to 4 independent pieces.
  - Concurrent execution: Spawns teammates in parallel to process their designated pieces.
  - Inter-agent notes: Messages formatted as `@agentId: <note>` exchanged between teammates and the lead.
  - Lead synthesis: The lead collects completed pieces and notes to synthesize one cohesive deliverable.
- **Knowledge Brain (`brain/`):** Markdown files representing company notes and knowledge.
- **Learning & Revision (`learn.mjs`):** Catches user corrections starting with `revise: ...` and appends them to candidate standing instructions.
- **Routines & Schedules (`routines.mjs`):** Recurring cron/calendar jobs executed by desks with catch-up logic.
- **Connectors & MCP (`mcp.mjs`):** Connects external tools with allow/deny filters per department.

---

## 2. Strengths vs. Gaps Compared to imClaw

| Dimension                 | Agents Office (v3.2.1)                    | imClaw Existing Foundation                                                            | ImClaw Clean-Room Target                                              |
| :------------------------ | :---------------------------------------- | :------------------------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| **Multi-Tier Memory**     | Flat markdown notes in `brain/` directory | 5-Tier Memory (Working, Short-Term, Episodic, Semantic, Permanent) with consolidation | Extend imClaw memory with Department Brain & Company Brain adapters   |
| **Financial Risk Guard**  | None (Ad-hoc LLM guidance)                | Non-bypassable deterministic risk engine & mandatory Stop-Loss validation             | Preserve strict deterministic risk guards on Finance & Trading        |
| **Department Hierarchy**  | Flat 6 departments with lead + desks      | Hierarchical Shihan, Sensei, Specialist delegation tree                               | Unify Business Department Leads with Domain Shihans & Senseis         |
| **Concurrency & Fencing** | Relies on external process locks          | NanoClaw optimistic CAS session claim fencing                                         | Integrated monotonic incarnation fencing on team tasks                |
| **Security & Governance** | Basic allow/deny lists                    | NemoClaw SHA-256 finding ledgers, Blocker Gates, Jarvis Bitmask ACL                   | Enterprise bitmask ACLs & automated blocker gates on department tasks |

---

## 3. Clean-Room Implementation Plan for imClaw

1. **Company & Department Model (`src/imclaw/organization/`):**
   - Clean-room TypeScript definitions for `Company`, `Department`, `DepartmentLead`, `SpecialistAgent`, `OfficeRoster`.
   - Seed the 6 core business departments (Marketing, Emails, Sales, Operations, Finance, Delivery) and 35 specialist roles, while retaining Trading hierarchy.
2. **Dynamic Task Routing (`src/imclaw/organization/task-router.ts`):**
   - Deterministic and keyword/intent routing matching requests to appropriate departments and leads.
3. **Agent Team Engine (`src/imclaw/organization/team-engine.ts`):**
   - Lead task decomposition into 2–4 subtasks.
   - Genuine concurrent parallel execution across designated specialists.
   - Inter-agent structured message passing (`@lead`, `@agent`).
   - Lead result synthesis and final artifact generation.
4. **Learning from Corrections (`src/imclaw/organization/learning-engine.ts`):**
   - Captures user corrections, calculates confidence, and promotes validated lessons to memory.
5. **Routines & Scheduler (`src/imclaw/organization/routine-scheduler.ts`):**
   - Scheduled recurring routines for departments with catch-up policies.
6. **Unified Company Simulation Engine (`src/imclaw/organization/company-simulation.ts`):**
   - End-to-end execution of company tasks across Marketing, Finance, Sales, Operations, Emails, Delivery, and Trading.
