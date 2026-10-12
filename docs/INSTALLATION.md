# imClaw Universal Installation Guide

Install and run **imClaw** across Linux, macOS, WSL2, and native Windows.

---

## ⚡ Quick Start One-Liners

### Linux / macOS / WSL2

```bash
curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash
```

Custom port or directory:

```bash
curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash -s -- --port 18789 --dir ~/.imclaw/app
```

### Windows (PowerShell)

Run PowerShell as Administrator or regular user:

```powershell
iex (irm https://raw.githubusercontent.com/Elogic360/imClaw/main/install.ps1)
```

---

## 🛠 Manual Installation

### Prerequisites

- **Node.js** `>= 24.16.0` or `>= 26.1.0` (Verify with `node -v`)
- **pnpm** (Install via `npm install -g pnpm`)
- **Git**

### Step-by-Step

1. Clone the repository:

   ```bash
   git clone https://github.com/Elogic360/imClaw.git
   cd imClaw
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build UI assets:

   ```bash
   pnpm ui:build
   ```

4. Launch the Autonomous Gateway & Control UI:
   ```bash
   ./openclaw.mjs gateway run --port 18789 --allow-unconfigured --auth none --bind loopback
   ```

---

## 🏢 Interactive Agent Office 3D & Web Interfaces

Once started, access the interfaces:

- **3D Isometric Interactive Office UI/UX:** [http://127.0.0.1:18789/imclaw/office/3d](http://127.0.0.1:18789/imclaw/office/3d)
- **Organization Dashboard:** [http://127.0.0.1:18789/imclaw/office](http://127.0.0.1:18789/imclaw/office)
- **Control UI & Chat:** [http://127.0.0.1:18789/](http://127.0.0.1:18789/)
- **Model Providers Config:** [http://127.0.0.1:18789/settings/model-providers](http://127.0.0.1:18789/settings/model-providers)

---

## 🤖 Universal Model Provider Integration

imClaw connects to any provider:

- **Google Antigravity & Gemini API** (`gemini-2.5-flash`, `gemini-2.5-pro`)
- **Nous Research & Hermes** (`hermes-agent`, `Nous Portal`)
- **OpenAI / Claude / DeepSeek / Ollama / Local Endpoints**

Configure providers via CLI:

```bash
imclaw model set-provider
```
