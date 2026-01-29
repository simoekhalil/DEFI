# Setup Script for Token Creation with Wallet
# This script helps you set up your environment and create tokens

Write-Host "GALA WALLET TOKEN CREATION SETUP" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env exists
Write-Host "STEP 1: Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
    
    # Check if it has the required values
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "TEST_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE") {
        Write-Host "[WARNING] .env file still has placeholder values!" -ForegroundColor Red
        Write-Host "   Please edit .env and add your actual private key" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Do you want to edit it now? (yes/no)"
        if ($continue -eq "yes") {
            notepad .env
            Write-Host "[OK] Please save the file and press Enter to continue..." -ForegroundColor Yellow
            Read-Host
        } else {
            Write-Host "[ERROR] Cannot continue without valid credentials" -ForegroundColor Red
            exit
        }
    } else {
        Write-Host "[OK] .env file appears to be configured" -ForegroundColor Green
    }
} else {
    Write-Host "[WARNING] .env file not found. Creating from template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "[OK] Created .env from .env.example" -ForegroundColor Green
        Write-Host ""
        Write-Host "Opening .env file for editing..." -ForegroundColor Yellow
        Write-Host "   Please replace YOUR_PRIVATE_KEY_HERE with your actual private key" -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 2
        notepad .env
        Write-Host ""
        Write-Host "[OK] Please save the file and press Enter to continue..." -ForegroundColor Yellow
        Read-Host
    } else {
        Write-Host "[ERROR] .env.example not found!" -ForegroundColor Red
        Write-Host "   Creating a basic .env file..." -ForegroundColor Yellow
        
        $envContent = @"
# Gala Wallet Configuration
TEST_WALLET_ADDRESS=client|618ae395c1c653111d3315be
TEST_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
TEST_SITE_URL=https://lpad-frontend-dev1.defi.gala.com
"@
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "[OK] Created basic .env file" -ForegroundColor Green
        Write-Host ""
        notepad .env
        Write-Host "[OK] Please save the file and press Enter to continue..." -ForegroundColor Yellow
        Read-Host
    }
}

Write-Host ""

# Step 2: Verify extension exists
Write-Host "STEP 2: Checking Gala wallet extension..." -ForegroundColor Yellow
$extensionPath = "extensions\testnet-wallet\build"
if (Test-Path $extensionPath) {
    Write-Host "[OK] Extension found at: $extensionPath" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Extension not found at: $extensionPath" -ForegroundColor Red
    Write-Host "   Please ensure the extension is extracted to this location" -ForegroundColor Yellow
    exit
}

Write-Host ""

# Step 3: Verify Node.js and dependencies
Write-Host "STEP 3: Checking Node.js and dependencies..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit
}

if (Test-Path "node_modules") {
    Write-Host "[OK] node_modules found" -ForegroundColor Green
} else {
    Write-Host "[WARNING] node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
}

Write-Host ""

# Step 4: Verify credentials
Write-Host "STEP 4: Verifying credentials..." -ForegroundColor Yellow
$verifyScript = @'
require('dotenv').config();
const address = process.env.TEST_WALLET_ADDRESS;
const key = process.env.TEST_PRIVATE_KEY;
console.log('Wallet Address:', address);
console.log('Private Key:', key && key !== 'YOUR_PRIVATE_KEY_HERE' ? '[OK] Set (hidden)' : '[ERROR] Missing or not configured');
if (!key || key === 'YOUR_PRIVATE_KEY_HERE') {
  console.log('ERROR: Please configure your private key in .env file');
  process.exit(1);
}
'@

try {
    $verifyScript | node -
    Write-Host "[OK] Credentials verified" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Credential verification failed!" -ForegroundColor Red
    Write-Host "   Please edit your .env file and add valid credentials" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   [OK] .env file configured" -ForegroundColor White
Write-Host "   [OK] Gala wallet extension found" -ForegroundColor White
Write-Host "   [OK] Node.js and dependencies ready" -ForegroundColor White
Write-Host "   [OK] Credentials verified" -ForegroundColor White
Write-Host ""
Write-Host "Ready to create a token!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To create a token, run:" -ForegroundColor Yellow
Write-Host "   node create-token-with-wallet.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or run this script will do it for you now:" -ForegroundColor Yellow
$runNow = Read-Host "Do you want to create a token now? (yes/no)"

if ($runNow -eq "yes") {
    Write-Host ""
    Write-Host "Starting token creation..." -ForegroundColor Cyan
    Write-Host ""
    node create-token-with-wallet.js
} else {
    Write-Host ""
    Write-Host "[OK] Setup complete. Run the token creation script when ready." -ForegroundColor Green
    Write-Host ""
}
