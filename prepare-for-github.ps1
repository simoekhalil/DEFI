#!/usr/bin/env pwsh
# Script to prepare project for GitHub push
# This will stage all safe files for commit

Write-Host "🚀 Preparing project for GitHub..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify no sensitive data
Write-Host "Step 1: Checking for sensitive data..." -ForegroundColor Yellow
$tokenCheck = git grep -i "ATATT3xFfGF0" -- . ':!scripts/jira-config.mjs' ':!GITHUB-PREPARATION-COMPLETE.md' 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "❌ WARNING: Found API tokens in tracked files!" -ForegroundColor Red
    Write-Host $tokenCheck
    Write-Host "Please remove these before continuing." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ No API tokens found in tracked files" -ForegroundColor Green
}

# Step 2: Rename README
Write-Host ""
Write-Host "Step 2: Renaming README files..." -ForegroundColor Yellow
if (Test-Path "README.md") {
    git mv README.md README-INTERNAL.md
    Write-Host "✅ Renamed README.md -> README-INTERNAL.md" -ForegroundColor Green
}
if (Test-Path "README-PUBLIC.md") {
    git mv README-PUBLIC.md README.md
    Write-Host "✅ Renamed README-PUBLIC.md -> README.md" -ForegroundColor Green
}

# Update .gitignore to exclude internal README
$gitignoreContent = Get-Content .gitignore -Raw
if (-not ($gitignoreContent -match "README-INTERNAL.md")) {
    Add-Content .gitignore "`n# Internal documentation`nREADME-INTERNAL.md"
    git add .gitignore
    Write-Host "✅ Updated .gitignore to exclude README-INTERNAL.md" -ForegroundColor Green
}

# Step 3: Stage essential files
Write-Host ""
Write-Host "Step 3: Staging files for commit..." -ForegroundColor Yellow

# Core configuration
git add .gitignore
git add .env.example
git add LICENSE
git add CONTRIBUTING.md
git add README.md

# GitHub specific
git add .github/

# Scripts (updated with env var support)
git add scripts/*.mjs scripts/*.js

# Tests and configuration
git add tests/
git add playwright.config.ts
git add package.json
git add package-lock.json
git add tsconfig.json

# Public-safe documentation
$docs = @(
    "COMPREHENSIVE-TEST-SUITE-DOCUMENTATION.md",
    "COMPREHENSIVE-TEST-SUITE-QUICK-START.md",
    "COMPREHENSIVE-TEST-SUITE-IMPLEMENTATION-SUMMARY.md",
    "COMPLETE-GRADUATION-FLOW-DOCUMENTATION.md",
    "GRADUATION-FLOW-QUICK-START.md",
    "ENHANCED-REWARD-VALIDATION-GUIDE.md",
    "BONDING-CURVE-SPECIFICATION.md",
    "BONDING-CURVE-QUICK-REFERENCE.md",
    "TEST-EXECUTION-GUIDE.md",
    "TEST-SUITE-DOCUMENTATION.md",
    "E2E-TEST-DOCUMENTATION.md",
    "PERFORMANCE-MONITORING-GUIDE.md",
    "RESPONSIVE-TESTING-GUIDE.md",
    "DYNAMIC-RBC-FEE-TESTING-GUIDE.md",
    "START-HERE.md",
    "GITHUB-PREPARATION-COMPLETE.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        git add $doc
    }
}

# Add docs folder if it exists
if (Test-Path "docs") {
    git add docs/
}

Write-Host "✅ Files staged successfully" -ForegroundColor Green

# Step 4: Show status
Write-Host ""
Write-Host "Step 4: Current git status..." -ForegroundColor Yellow
git status --short

# Step 5: Instructions
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ PROJECT READY FOR GITHUB!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Review the staged changes:" -ForegroundColor White
Write-Host "   git status" -ForegroundColor Gray
Write-Host "   git diff --staged" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create the commit:" -ForegroundColor White
Write-Host "   git commit -m `"feat: Initial public release - Gala Launchpad QA Testing Suite`"" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push to GitHub:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Set up GitHub secrets (for CI):" -ForegroundColor White
Write-Host "   - Go to: Settings → Secrets → Actions" -ForegroundColor Gray
Write-Host "   - Add: METAMASK_PRIVATE_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 See GITHUB-PREPARATION-COMPLETE.md for detailed guide" -ForegroundColor Cyan
Write-Host ""

