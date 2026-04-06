$ErrorActionPreference = "Stop"

Write-Host "==> StartAndConnect full backend test run" -ForegroundColor Cyan

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

function Run-Step {
    param(
        [string]$Name,
        [string]$Command
    )

    Write-Host ""
    Write-Host "==> $Name" -ForegroundColor Yellow
    Write-Host "    $Command" -ForegroundColor DarkGray
    Invoke-Expression $Command
}

Run-Step -Name "Phase 1 (env + smoke + baseline tests)" -Command "npm run test:phase1"
Run-Step -Name "Contract tests" -Command "npm run test:contract"
Run-Step -Name "E2E MVP tests" -Command "npm run test:e2e"
Run-Step -Name "Security tests" -Command "npm run test:security"
Run-Step -Name "Performance smoke tests" -Command "npm run test:perf-smoke"
Run-Step -Name "All backend aggregate" -Command "npm run test:all-backend"
Run-Step -Name "Release gates validation" -Command "npm run test:release-gate"

Write-Host ""
Write-Host "All test stages passed." -ForegroundColor Green

