# Wallet Setup Script for Testing

Write-Host "GALA WALLET SETUP FOR TESTING" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "WARNING: .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (yes/no)"
    if ($overwrite -ne "yes") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
}

# Create .env file content
$envContent = @"
# CRITICAL SECURITY WARNING
# NEVER commit this file to version control!
# This file contains sensitive wallet credentials.

# Your Gala Wallet Address (safe to see)
TEST_WALLET_ADDRESS=client|618ae395c1c653111d3315be

# Your Private Key (KEEP THIS SECRET!)
# Replace YOUR_PRIVATE_KEY_HERE with your actual private key
TEST_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# Wallet Configuration
WALLET_MODE=automated
TEST_ENVIRONMENT=local

# Optional: Set to 'real' for real wallet testing, 'mock' for simulated testing
WALLET_TYPE=mock
"@

# Write .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8

Write-Host ""
Write-Host "SUCCESS: Created .env file" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open the .env file:" -ForegroundColor White
Write-Host "   notepad .env" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Replace YOUR_PRIVATE_KEY_HERE with your actual private key" -ForegroundColor White
Write-Host ""
Write-Host "3. Check your balance:" -ForegroundColor White
Write-Host "   npm run balance" -ForegroundColor Cyan
Write-Host ""
Write-Host "SECURITY REMINDER:" -ForegroundColor Red
Write-Host "   - NEVER commit .env to git" -ForegroundColor Yellow
Write-Host "   - NEVER share your private key" -ForegroundColor Yellow
Write-Host "   - Use a dedicated testing wallet" -ForegroundColor Yellow
Write-Host ""

# Create .env.example if it doesn't exist
if (-not (Test-Path ".env.example")) {
    $envExampleContent = @"
# Example Environment Configuration
# Copy this file to .env and fill in your actual values

# Your Gala Wallet Address
TEST_WALLET_ADDRESS=client|your_wallet_id_here

# Your Private Key (NEVER commit the real one!)
TEST_PRIVATE_KEY=your_private_key_here

# Wallet Configuration
WALLET_MODE=automated
TEST_ENVIRONMENT=local
WALLET_TYPE=mock
"@
    
    $envExampleContent | Out-File -FilePath ".env.example" -Encoding utf8
    Write-Host "SUCCESS: Created .env.example file" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup complete! Edit .env with your private key." -ForegroundColor Green

