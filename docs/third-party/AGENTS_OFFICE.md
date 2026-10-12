# Agents Office — Licensing & Clean-Room Implementation Audit

## 1. Upstream License Analysis

- **Project:** Agents Office (`https://github.com/ajsahni/agents-office`)
- **Licensor:** Sahni.ai (AJ Sahni)
- **Base License:** PolyForm Noncommercial License 1.0.0
- **Additional Terms (Sahni.ai):**
  1. **Name and mark:** "Agents Office" and "Sahni.ai" marks may not be used without authorization.
  2. **No renaming or rebranding:** Cannot present Agents Office under another brand.
  3. **Not part of another product or system:** "You may not adapt Agents Office to drive, display or front another agent system, workforce, platform or product, or bundle it with one, whether it is yours or a third party's."

## 2. Clean-Room Architectural Decision for imClaw

In accordance with Section 2 of the task specification and the licensor's restrictions:

1. **Total Isolation & Deletion:** All bundled third-party assets, compiled scripts (`app.js`, `command-centre-v2.html`, tiles, fonts) from the reference repository have been completely removed from the imClaw repository.
2. **Original imClaw Design System & Assets:**
   - Engineered an original, clean-room 2.5D/3D Canvas interface (`src/imclaw/ui/office/imclaw-office.html`).
   - Implemented an original Red Lobster/Crab-inspired character visualization system with expressive cyan sensor eyes, glowing antenna status indicators, and distinct silhouettes.
   - Connected directly to imClaw's authoritative `CompanyRegistry`, `TaskRouter`, and `OfficeRuntimeService` endpoints.
