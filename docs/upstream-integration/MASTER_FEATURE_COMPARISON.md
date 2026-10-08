# Master Feature Comparison: imClaw vs 7 Upstream Projects

**Product:** imClaw — Integral Market Autonomous Intelligence Operating System  
**Base Repository:** `/home/elogic360/Projects/imClaw`  
**Date:** 2026-10-08

---

## 1. Upstream Audit & Synthesis Summary

| Upstream Project    | License         | Source Commit                              | Strategic Role                                        | Status in imClaw          |
| :------------------ | :-------------- | :----------------------------------------- | :---------------------------------------------------- | :------------------------ |
| **1. OpenClaw**     | MIT             | `cb01febf9fa4fbda271d10b3adff3b384c6ece76` | Base multi-channel gateway & tool foundation          | **BASE RUNTIME**          |
| **2. Hermes Agent** | MIT             | `7dab93b06e2bb3757dc18229169efcee1b5b47a3` | Repetition guard, think scrubber, self-protection     | **INTEGRATED & VERIFIED** |
| **3. NanoClaw**     | MIT             | `66f0823a693bd9cca4123e72f8ccee05f5e7e1c5` | Session claim fencing & incarnation CAS               | **INTEGRATED & VERIFIED** |
| **4. NemoClaw**     | Apache-2.0      | `f41d5bffb87daa827f0533bcb9d95207a23436d9` | Security finding ledger & deterministic blocker gates | **INTEGRATED & VERIFIED** |
| **5. Jarvis**       | Apache-2.0      | `47023ab8c478ef850102b956c32a016d104628e1` | ACL bitmask authority & high-speed tool routing       | **INTEGRATED & VERIFIED** |
| **6. Mimoclaw**     | MIT             | `fa2a81225730f7a4885bb22dc7a7f646fc0b3823` | Speech director mode & inline prosody tags            | **INTEGRATED & VERIFIED** |
| **7. n8n**          | Sustainable Use | `c194d22b5c02139d5bc7127a16df2f8a5ec62cb3` | Clean-room DAG status lifecycle & node retries        | **CLEAN-ROOM INTEGRATED** |

---

## 2. Architectural Comparison Matrix

| Feature / Subsystem            | Vanilla OpenClaw | Hermes | NanoClaw | NemoClaw | Jarvis | Mimoclaw | n8n | **imClaw Unified** |
| :----------------------------- | :--------------: | :----: | :------: | :------: | :----: | :------: | :-: | :----------------: |
| **Multi-Channel Gateway**      |        ✅        |   ❌   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  |   ✅ **Native**    |
| **Repetition Guard**           |        ❌        |   ✅   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **Integrated**  |
| **Stream Think Scrubber**      |        ❌        |   ✅   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **Integrated**  |
| **Runtime Self-Protection**    |        ❌        |   ✅   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **Integrated**  |
| **Incarnation Claim CAS**      |        ❌        |   ❌   |    ✅    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **Integrated**  |
| **Security Finding Ledger**    |        ❌        |   ❌   |    ❌    |    ✅    |   ❌   |    ❌    | ❌  | ✅ **Integrated**  |
| **Blocker Gate Engine**        |        ❌        |   ❌   |    ❌    |    ✅    |   ❌   |    ❌    | ❌  | ✅ **Integrated**  |
| **Bitmask ACL Authority**      |        ❌        |   ❌   |    ❌    |    ❌    |   ✅   |    ❌    | ❌  | ✅ **Integrated**  |
| **Speech Director Pacing**     |        ❌        |   ❌   |    ❌    |    ❌    |   ❌   |    ✅    | ❌  | ✅ **Integrated**  |
| **Workflow Node Retries**      |        ❌        |   ❌   |    ❌    |    ❌    |   ❌   |    ❌    | ✅  | ✅ **Clean-Room**  |
| **Non-Bypassable Risk Guard**  |        ❌        |   ❌   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **imClaw Core** |
| **Simulation Broker Pipeline** |        ❌        |   ❌   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **imClaw Core** |
| **Multi-Tier Memory Engine**   |        ❌        |   ❌   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **imClaw Core** |
| **Hierarchical Delegation**    |        ❌        |   ❌   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **imClaw Core** |
| **Trade Audit Journaler**      |        ❌        |   ❌   |    ❌    |    ❌    |   ❌   |    ❌    | ❌  | ✅ **imClaw Core** |
