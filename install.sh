#!/usr/bin/env bash
# ==============================================================================
# imClaw Universal Installer & Self-Updating Bootstrap Script
# https://github.com/Elogic360/imClaw
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash -s -- --port 18789
#   curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash -s -- --update
# ==============================================================================

set -euo pipefail

BOLD='\033[1m'
CYAN='\033[38;2;0;229;204m'
PURPLE='\033[38;2;168;85;247m'
YELLOW='\033[38;2;250;204;21m'
GREEN='\033[38;2;52;211;153m'
RED='\033[38;2;239;68;68m'
NC='\033[0m'

IMCLAW_REPO="https://github.com/Elogic360/imClaw.git"
IMCLAW_DEFAULT_DIR="${HOME}/.imclaw/app"
IMCLAW_BIN_DIR="${HOME}/.local/bin"
GATEWAY_PORT="18789"
SKIP_GATEWAY_START="0"
FORCE_UPDATE="0"
TARGET_TAG=""

print_banner() {
  cat << "EOF"
  _            ____ _                 
 (_)_ __ ___  / ___| | __ ___      __ 
 | | '_ ` _ \| |   | |/ _` \ \ /\ / / 
 | | | | | | | |___| | (_| |\ V  V /  
 |_|_| |_| |_|\____|_|\__,_| \_/\_/   
EOF
  printf "${PURPLE}imClaw Autonomous Multi-Agent Command Centre & Gateway${NC}\n"
  printf "${CYAN}Repository: https://github.com/Elogic360/imClaw${NC}\n\n"
}

info() {
  printf "${CYAN}ℹ [imClaw]${NC} %s\n" "$1"
}

success() {
  printf "${GREEN}✔ [imClaw]${NC} %s\n" "$1"
}

warn() {
  printf "${YELLOW}⚠ [imClaw]${NC} %s\n" "$1"
}

error() {
  printf "${RED}✖ [imClaw]${NC} %s\n" "$1" >&2
}

# Parse options
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      GATEWAY_PORT="$2"
      shift 2
      ;;
    --dir)
      IMCLAW_DEFAULT_DIR="$2"
      shift 2
      ;;
    --tag)
      TARGET_TAG="$2"
      shift 2
      ;;
    --update)
      FORCE_UPDATE="1"
      shift
      ;;
    --no-start)
      SKIP_GATEWAY_START="1"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

print_banner

info "Checking system prerequisites (Node.js, Git, pnpm)..."

# 1. Check Node.js
if ! command -v node >/dev/null 2>&1; then
  error "Node.js (>=24.16.0 or >=26.1.0) is required but not installed."
  info "Install Node.js via NVM: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
  exit 1
fi

NODE_VERSION="$(node -v | sed 's/^v//')"
info "Found Node.js v${NODE_VERSION}"

# 2. Check Git
if ! command -v git >/dev/null 2>&1; then
  error "Git is required but not installed."
  exit 1
fi

# 3. Check / Install pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  warn "pnpm not found. Installing pnpm globally via npm..."
  npm install -g pnpm || corepack enable
fi

# 4. Determine latest release / tag from GitHub
info "Checking latest release from GitHub..."
LATEST_TAG=""
if command -v curl >/dev/null 2>&1; then
  LATEST_TAG="$(curl -fsSL https://api.github.com/repos/Elogic360/imClaw/releases/latest 2>/dev/null | grep '"tag_name":' | head -n 1 | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/' || true)"
fi
if [[ -n "${LATEST_TAG}" ]]; then
  info "Latest published release detected: ${LATEST_TAG}"
else
  info "Tracking upstream branch: origin/main"
fi

# 5. Clone or update repository
mkdir -p "${IMCLAW_BIN_DIR}"
if [[ -d "${IMCLAW_DEFAULT_DIR}/.git" ]]; then
  info "Existing imClaw installation found at ${IMCLAW_DEFAULT_DIR}. Syncing latest updates..."
  cd "${IMCLAW_DEFAULT_DIR}"
  git fetch --all --tags --prune || true
  if [[ -n "${TARGET_TAG}" ]]; then
    info "Checking out requested tag: ${TARGET_TAG}"
    git checkout "${TARGET_TAG}"
  elif [[ -n "${LATEST_TAG}" && "${FORCE_UPDATE}" == "1" ]]; then
    git checkout "${LATEST_TAG}" || git checkout main
  else
    git checkout main || true
    git pull --rebase origin main || git reset --hard origin/main || true
  fi
elif [[ -d "$(pwd)/.git" && -f "$(pwd)/openclaw.mjs" && -d "$(pwd)/src/imclaw" ]]; then
  info "Running inside local imClaw repository ($(pwd)). Using current checkout..."
  IMCLAW_DEFAULT_DIR="$(pwd)"
else
  info "Cloning imClaw into ${IMCLAW_DEFAULT_DIR}..."
  mkdir -p "$(dirname "${IMCLAW_DEFAULT_DIR}")"
  git clone "${IMCLAW_REPO}" "${IMCLAW_DEFAULT_DIR}"
  cd "${IMCLAW_DEFAULT_DIR}"
  if [[ -n "${TARGET_TAG}" ]]; then
    git checkout "${TARGET_TAG}"
  elif [[ -n "${LATEST_TAG}" ]]; then
    git checkout "${LATEST_TAG}" || git checkout main
  else
    git checkout main
  fi
fi

cd "${IMCLAW_DEFAULT_DIR}"

CURRENT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
info "imClaw tree at commit: ${CURRENT_COMMIT}"

# 6. Install dependencies
info "Installing dependencies with pnpm..."
pnpm install --frozen-lockfile || pnpm install

# 7. Check or build dist artifacts
if [[ ! -f "dist/index.js" || ! -f "dist/control-ui/index.html" || "${FORCE_UPDATE}" == "1" ]]; then
  info "Building imClaw production UI & gateway assets..."
  if [[ -f "scripts/ui.js" ]]; then
    node scripts/ui.js build || warn "UI build finished with warnings, continuing..."
  fi
else
  info "Verified existing production build artifacts in dist/"
fi

# 8. Create binary wrappers
info "Creating imClaw executable wrapper at ${IMCLAW_BIN_DIR}/imclaw..."
cat > "${IMCLAW_BIN_DIR}/imclaw" << WRAPPER_EOF
#!/usr/bin/env bash
set -euo pipefail
NODE_EXEC="\$(command -v node)"
REPO_DIR="${IMCLAW_DEFAULT_DIR}"

# Built-in updater command shortcut: "imclaw update-all"
if [[ "\${1:-}" == "update-all" ]]; then
  echo "Updating imClaw from GitHub repository..."
  cd "\${REPO_DIR}"
  git fetch --all --tags --prune
  LATEST_RELEASE="\$(curl -fsSL https://api.github.com/repos/Elogic360/imClaw/releases/latest 2>/dev/null | grep '"tag_name":' | head -n 1 | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/' || true)"
  if [[ -n "\${LATEST_RELEASE}" ]]; then
    git checkout "\${LATEST_RELEASE}" || git checkout main
  else
    git checkout main && git pull origin main
  fi
  pnpm install
  if [[ -f "scripts/ui.js" ]]; then
    node scripts/ui.js build || true
  fi
  echo "imClaw updated successfully to \$(git describe --tags --always)!"
  exit 0
fi

exec "\${NODE_EXEC}" "\${REPO_DIR}/openclaw.mjs" "\$@"
WRAPPER_EOF

chmod +x "${IMCLAW_BIN_DIR}/imclaw"

# Symlink openclaw for full OpenClaw CLI compatibility
ln -sf "${IMCLAW_BIN_DIR}/imclaw" "${IMCLAW_BIN_DIR}/openclaw" 2>/dev/null || true

success "Installed executable wrapper to ${IMCLAW_BIN_DIR}/imclaw"

# 9. Check PATH
case ":${PATH}:" in
  *":${IMCLAW_BIN_DIR}:"*) ;;
  *)
    warn "${IMCLAW_BIN_DIR} is not in your current PATH."
    printf "   Add it with: export PATH=\"%s:\$PATH\"\n\n" "${IMCLAW_BIN_DIR}"
    ;;
esac

# 10. Start / verify gateway
if [[ "${SKIP_GATEWAY_START}" == "0" ]]; then
  if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${GATEWAY_PORT}/" | grep -q "200"; then
    success "imClaw Gateway is already running and healthy at http://127.0.0.1:${GATEWAY_PORT}"
  else
    info "Starting imClaw Gateway in background on port ${GATEWAY_PORT}..."
    nohup "${IMCLAW_BIN_DIR}/imclaw" gateway run --port "${GATEWAY_PORT}" --allow-unconfigured --auth none --bind loopback > /tmp/imclaw-gateway.log 2>&1 &
    sleep 3
    if curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${GATEWAY_PORT}/" | grep -q "200"; then
      success "imClaw Gateway launched successfully at http://127.0.0.1:${GATEWAY_PORT}"
    else
      warn "Gateway started. Check logs: /tmp/imclaw-gateway.log"
    fi
  fi
fi

DISPLAY_VER="${LATEST_TAG:-v1.0.2}"

printf "\n${BOLD}${CYAN}================================================================${NC}\n"
printf "${BOLD}🎉 imClaw ${DISPLAY_VER} is ready on your machine!${NC}\n"
printf "   - 3D Agent Office:   ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/imclaw/office/3d${NC}\n"
printf "   - Web Control UI:    ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/${NC}\n"
printf "   - Departments API:   ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/api/imclaw/departments${NC}\n"
printf "   - Agents Roster API: ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/api/agents${NC}\n"
printf "   - Model Providers:   ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/settings/model-providers${NC}\n"
printf "   - Update Anytime:    ${CYAN}imclaw update-all${NC} or ${CYAN}curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash -s -- --update${NC}\n"
printf "${BOLD}${CYAN}================================================================${NC}\n\n"
