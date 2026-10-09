#!/usr/bin/env bash
# ==============================================================================
# imClaw Universal Installer & Local Bootstrap Script
# https://github.com/Elogic360/imClaw
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/Elogic360/imClaw/main/install.sh | bash -s -- --port 18789
# ==============================================================================

set -euo pipefail

BOLD='\033[1m'
CYAN='\033[38;2;0;229;204m'
PURPLE='\033[38;2;168;85;247m'
YELLOW='\033[38;2;250;204;21m'
RED='\033[38;2;239;68;68m'
NC='\033[0m'

IMCLAW_REPO="https://github.com/Elogic360/imClaw.git"
IMCLAW_DEFAULT_DIR="${HOME}/.imclaw/app"
IMCLAW_BIN_DIR="${HOME}/.local/bin"
GATEWAY_PORT="18789"
SKIP_GATEWAY_START="0"

print_banner() {
  cat << "EOF"
  _            ____ _                 
 (_)_ __ ___  / ___| | __ ___      __ 
 | | '_ ` _ \| |   | |/ _` \ \ /\ / / 
 | | | | | | | |___| | (_| |\ V  V /  
 |_|_| |_| |_|\____|_|\__,_| \_/\_/   
EOF
  printf "${PURPLE}imClaw Autonomous Multi-Agent Platform & Social Gateway v1.0.0${NC}\n"
  printf "${CYAN}Repository: https://github.com/Elogic360/imClaw${NC}\n\n"
}

info() {
  printf "${CYAN}ℹ [imClaw]${NC} %s\n" "$1"
}

success() {
  printf "${CYAN}✔ [imClaw]${NC} %s\n" "$1"
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

# 4. Clone or update repository
mkdir -p "${IMCLAW_BIN_DIR}"
if [[ -d "${IMCLAW_DEFAULT_DIR}/.git" ]]; then
  info "Existing imClaw installation found at ${IMCLAW_DEFAULT_DIR}. Updating repository..."
  cd "${IMCLAW_DEFAULT_DIR}"
  git fetch origin main || true
  git checkout main || true
  git pull origin main || true
elif [[ -d "$(pwd)/.git" && -f "$(pwd)/openclaw.mjs" && -d "$(pwd)/src/imclaw" ]]; then
  info "Running inside local imClaw development repository ($(pwd)). Reusing current checkout..."
  IMCLAW_DEFAULT_DIR="$(pwd)"
else
  info "Cloning imClaw into ${IMCLAW_DEFAULT_DIR}..."
  mkdir -p "$(dirname "${IMCLAW_DEFAULT_DIR}")"
  git clone "${IMCLAW_REPO}" "${IMCLAW_DEFAULT_DIR}"
  cd "${IMCLAW_DEFAULT_DIR}"
  git checkout main
fi

cd "${IMCLAW_DEFAULT_DIR}"

# 5. Install dependencies and build
info "Installing dependencies with pnpm..."
pnpm install --frozen-lockfile || pnpm install

info "Building imClaw production UI assets..."
if [[ -f "scripts/ui.js" ]]; then
  node scripts/ui.js build || warn "UI build finished with warnings, continuing..."
fi

# 6. Create binary wrapper
info "Creating imClaw executable wrapper at ${IMCLAW_BIN_DIR}/imclaw..."
cat > "${IMCLAW_BIN_DIR}/imclaw" << WRAPPER_EOF
#!/usr/bin/env bash
set -euo pipefail
NODE_EXEC="\$(command -v node)"
REPO_DIR="${IMCLAW_DEFAULT_DIR}"
exec "\${NODE_EXEC}" "\${REPO_DIR}/openclaw.mjs" "\$@"
WRAPPER_EOF

chmod +x "${IMCLAW_BIN_DIR}/imclaw"

# Also symlink openclaw for full compatibility
if [[ ! -f "${IMCLAW_BIN_DIR}/openclaw" ]]; then
  ln -sf "${IMCLAW_BIN_DIR}/imclaw" "${IMCLAW_BIN_DIR}/openclaw" || true
fi

success "Installed executable wrapper to ${IMCLAW_BIN_DIR}/imclaw"

# 7. Check PATH
case ":${PATH}:" in
  *":${IMCLAW_BIN_DIR}:"*) ;;
  *)
    warn "${IMCLAW_BIN_DIR} is not in your current PATH."
    printf "   Add it with: export PATH=\"%s:\$PATH\"\n\n" "${IMCLAW_BIN_DIR}"
    ;;
esac

# 8. Start / verify gateway
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

printf "\n${BOLD}${CYAN}================================================================${NC}\n"
printf "${BOLD}🎉 imClaw v1.0.0 is ready on your PC!${NC}\n"
printf "   - Web Control UI:    ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/${NC}\n"
printf "   - Model Providers:   ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/settings/model-providers${NC}\n"
printf "   - CLI Access:        ${CYAN}imclaw --help${NC} or ${CYAN}imclaw gateway status${NC}\n"
printf "${BOLD}${CYAN}================================================================${NC}\n\n"
