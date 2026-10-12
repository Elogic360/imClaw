# imClaw Red Lobster AI Agent Character System

## 1. Character Identity

The imClaw character design is inspired by the iconic OpenClaw space lobster, translated into a modern, cinematic AI agent laboratory:

- **Carapace & Anatomy:** Curved crimson red torso with soft rim lighting and emissive ambient glow.
- **Sensor Eyes:** Expressive bright cyan luminescence with real-time breathing/motion offsets.
- **Claws & Antenna:** Functional claw extremities paired with an interactive antenna beacon that pulses and shifts color based on actual runtime states.

## 2. Dynamic State Mapping

| State             | Antenna & Body Visual                                                     | Operational Meaning                                   |
| ----------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| IDLE              | Subtle green antenna glow, resting breathing animation                    | Available for task assignment                         |
| RUNNING           | Bright cyan antenna pulse, luminous energy particles moving to Brain Core | Executing subagent pipeline or tool invocation        |
| BLOCKED / WAITING | Amber beacon pulse                                                        | Blocked on human approval gate or external dependency |
| OFFLINE           | Desaturated body shell                                                    | Agent process terminated or detached                  |
