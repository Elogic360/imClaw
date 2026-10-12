#!/usr/bin/env bash
# ==============================================================================
# imClaw Container Operations Script (Podman & Docker)
# https://github.com/Elogic360/imClaw
#
# Supports rootless Podman and Docker seamlessly on Linux, macOS, and Cloud VMs.
# ==============================================================================

set -euo pipefail

BOLD='\033[1m'
CYAN='\033[38;2;0;229;204m'
PURPLE='\033[38;2;168;85;247m'
YELLOW='\033[38;2;250;204;21m'
GREEN='\033[38;2;52;211;153m'
RED='\033[38;2;239;68;68m'
NC='\033[0m'

IMAGE_NAME="${IMCLAW_IMAGE:-imclaw:latest}"
CONTAINER_NAME="${IMCLAW_CONTAINER_NAME:-imclaw-gateway}"
GATEWAY_PORT="${IMCLAW_PORT:-18789}"
STATE_DIR="${IMCLAW_STATE_DIR:-${HOME}/.imclaw/data}"
WORKSPACE_DIR="${IMCLAW_WORKSPACE_DIR:-${HOME}/.imclaw/workspace}"

# Detect container engine: prefer podman if installed, fallback to docker
if command -v podman >/dev/null 2>&1; then
  ENGINE="podman"
elif command -v docker >/dev/null 2>&1; then
  ENGINE="docker"
else
  printf "${RED}✖ Neither podman nor docker found in PATH.${NC}\n"
  printf "  Install Podman (sudo apt-get install podman / sudo dnf install podman) or Docker.\n"
  exit 1
fi

ACTION="${1:-help}"

case "${ACTION}" in
  build)
    printf "${CYAN}Building imClaw container image using ${ENGINE} [${IMAGE_NAME}]...${NC}\n"
    ${ENGINE} build -t "${IMAGE_NAME}" -f Dockerfile .
    printf "${GREEN}✔ imClaw image built successfully: ${IMAGE_NAME}${NC}\n"
    ;;

  run|start)
    mkdir -p "${STATE_DIR}" "${WORKSPACE_DIR}"
    printf "${CYAN}Running imClaw container using ${ENGINE}...${NC}\n"
    printf "  Container: ${CONTAINER_NAME}\n"
    printf "  Port:      ${GATEWAY_PORT}\n"
    printf "  State Dir: ${STATE_DIR}\n"

    # Stop and remove existing container if running
    if ${ENGINE} ps -a --format "{{.Names}}" | grep -qx "${CONTAINER_NAME}"; then
      printf "${YELLOW}Stopping and replacing existing container ${CONTAINER_NAME}...${NC}\n"
      ${ENGINE} rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
    fi

    ${ENGINE} run -d \
      --name "${CONTAINER_NAME}" \
      --restart unless-stopped \
      -p "${GATEWAY_PORT}:18789" \
      -v "${STATE_DIR}:/home/node/.openclaw:Z" \
      -v "${WORKSPACE_DIR}:/home/node/.openclaw/workspace:Z" \
      -e OPENCLAW_GATEWAY_PORT="18789" \
      -e OPENWA_BASE_URL="${OPENWA_BASE_URL:-http://127.0.0.1:2785}" \
      -e OPENWA_API_KEY="${OPENWA_API_KEY:-}" \
      "${IMAGE_NAME}" \
      node openclaw.mjs gateway run --port 18789 --allow-unconfigured --auth none --bind lan

    printf "${GREEN}✔ imClaw container started!${NC}\n"
    printf "  Web Control UI:    ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/${NC}\n"
    printf "  3D Agent Office:   ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/imclaw/office/3d${NC}\n"
    printf "  WhatsApp API:      ${CYAN}http://127.0.0.1:${GATEWAY_PORT}/api/openwa/status${NC}\n"
    printf "  View Logs:         ${CYAN}${ENGINE} logs -f ${CONTAINER_NAME}${NC}\n"
    ;;

  stop)
    printf "${CYAN}Stopping imClaw container [${CONTAINER_NAME}]...${NC}\n"
    ${ENGINE} stop "${CONTAINER_NAME}" || true
    ${ENGINE} rm "${CONTAINER_NAME}" || true
    printf "${GREEN}✔ Container stopped and removed.${NC}\n"
    ;;

  logs)
    ${ENGINE} logs -f "${CONTAINER_NAME}"
    ;;

  status)
    ${ENGINE} ps --filter "name=${CONTAINER_NAME}"
    ;;

  cli)
    shift
    ${ENGINE} exec -it "${CONTAINER_NAME}" imclaw "$@"
    ;;

  deploy)
    # Full one-click build and start flow
    "$0" build
    "$0" run
    ;;

  *)
    printf "${BOLD}${PURPLE}imClaw Container Manager (${ENGINE})${NC}\n"
    printf "Usage: %s [command]\n\n" "$0"
    printf "Commands:\n"
    printf "  ${CYAN}build${NC}    - Build the container image (${IMAGE_NAME})\n"
    printf "  ${CYAN}run${NC}      - Start the imClaw container in background\n"
    printf "  ${CYAN}deploy${NC}   - Build image and start container (one-click)\n"
    printf "  ${CYAN}stop${NC}     - Stop and remove the running container\n"
    printf "  ${CYAN}logs${NC}     - Stream real-time logs from the container\n"
    printf "  ${CYAN}status${NC}   - Check container status\n"
    printf "  ${CYAN}cli${NC}      - Execute imClaw CLI commands inside the container\n"
    printf "\nEnvironment variables:\n"
    printf "  IMCLAW_IMAGE           Image tag (default: imclaw:latest)\n"
    printf "  IMCLAW_PORT            Port mapping on host (default: 18789)\n"
    printf "  IMCLAW_CONTAINER_NAME  Container name (default: imclaw-gateway)\n"
    printf "  IMCLAW_STATE_DIR       Persistent state directory\n"
    ;;
esac
