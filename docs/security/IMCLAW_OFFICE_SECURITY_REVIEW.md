# imClaw Office & Command Centre — Security Review

## 1. Safety Principles & Policy Guards

1. **Deterministic Risk Guard:** The UI layer never has execution authority over financial trades. Every trade proposal must pass through the Deterministic Risk Engine.
2. **Approval Engine:** Sensitive actions (sending outbound emails, publishing content, live broker fills) require explicit human approval via the approval gate.
3. **Runtime Self-Protection:** Ported from Hermes Agent safeguards (`RuntimeSelfProtection`), prohibiting destructive execution commands (`rm -rf /`, formatting disks, etc.).
4. **Sandboxing Isolation:** Background scripts run in isolated containerized backends (`local`, `docker`, `ssh`, `singularity`, `modal`).
