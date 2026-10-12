# ==============================================================================
# imClaw Universal Installer for Windows PowerShell
# https://github.com/Elogic360/imClaw
#
# Usage (Run in PowerShell):
#   iex (irm https://raw.githubusercontent.com/Elogic360/imClaw/main/install.ps1)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  imClaw Autonomous Multi-Agent Platform & Social Gateway" -ForegroundColor Magenta
Write-Host "  Repository: https://github.com/Elogic360/imClaw" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js (>=24.16.0 or >=26.1.0) is required but not installed. Please install Node.js from https://nodejs.org/"
    exit 1
}

$nodeVer = node -v
Write-Host "[imClaw] Found Node.js $nodeVer" -ForegroundColor Green

# 2. Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is required but not installed. Please install Git from https://git-scm.com/"
    exit 1
}

# 3. Check or install pnpm
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "[imClaw] Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# 4. Clone or use local repo
$targetDir = "$env:USERPROFILE\.imclaw\app"
if (Test-Path "$targetDir\.git") {
    Write-Host "[imClaw] Updating existing repository at $targetDir..." -ForegroundColor Cyan
    Set-Location $targetDir
    git fetch origin main
    git checkout main
    git pull origin main
} elseif ((Test-Path "openclaw.mjs") -and (Test-Path "src\imclaw")) {
    $targetDir = (Get-Location).Path
    Write-Host "[imClaw] Using current repository at $targetDir" -ForegroundColor Cyan
} else {
    Write-Host "[imClaw] Cloning imClaw into $targetDir..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path (Split-Path $targetDir) | Out-Null
    git clone https://github.com/Elogic360/imClaw.git $targetDir
    Set-Location $targetDir
}

# 5. Install dependencies
Write-Host "[imClaw] Installing dependencies with pnpm..." -ForegroundColor Cyan
pnpm install

# 6. Build UI assets
if (Test-Path "scripts\ui.js") {
    Write-Host "[imClaw] Building UI assets..." -ForegroundColor Cyan
    node scripts\ui.js build
}

# 7. Create PowerShell launcher script in PATH
$binDir = "$env:USERPROFILE\.imclaw\bin"
New-Item -ItemType Directory -Force -Path $binDir | Out-Null
$launcherContent = @"
@echo off
node "$targetDir\openclaw.mjs" %*
"@
Set-Content -Path "$binDir\imclaw.cmd" -Value $launcherContent -Encoding ASCII
Set-Content -Path "$binDir\openclaw.cmd" -Value $launcherContent -Encoding ASCII

# Check PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$binDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$binDir;$userPath", "User")
    $env:Path = "$binDir;$env:Path"
    Write-Host "[imClaw] Added $binDir to user PATH." -ForegroundColor Yellow
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🎉 imClaw v1.0.0 is ready on Windows!" -ForegroundColor Green
Write-Host "   - Start Gateway:  imclaw gateway run --port 18789 --allow-unconfigured --auth none --bind loopback" -ForegroundColor White
Write-Host "   - 3D Office:      http://127.0.0.1:18789/imclaw/office/3d" -ForegroundColor White
Write-Host "   - Control UI:     http://127.0.0.1:18789/" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
