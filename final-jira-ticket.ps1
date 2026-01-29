# Final JIRA ticket creation with correct format
$JIRA_BASE_URL = "https://galagames.atlassian.net"
$EMAIL = "Skhalil@gala.games"
$API_TOKEN = $env:JIRA_API_TOKEN  # Set via environment variable
$PROJECT_KEY = "GW"

# Create authentication header
$AUTH_STRING = "$EMAIL" + ":" + "$API_TOKEN"
$AUTH_BYTES = [System.Text.Encoding]::UTF8.GetBytes($AUTH_STRING)
$AUTH_HEADER = [System.Convert]::ToBase64String($AUTH_BYTES)

Write-Host "Creating JIRA ticket..."

try {
    # Create ticket with simple text description (fallback format)
    $ticketData = @{
        fields = @{
            project = @{
                key = $PROJECT_KEY
            }
            summary = "Test Failure: Token Symbol Validation Test Timeout - Website Missing Validation Implementation"
            description = "The 'should test token symbol validation rules' test is failing due to timeout. Investigation reveals the Gala DeFi website doesn't implement the required form validation rules.

TEST RESULTS:
- 6 tests PASSED (85.7% success rate)  
- 1 test FAILED - Token Symbol Validation
- Duration: 33.6 seconds (exceeded 30s timeout)

ROOT CAUSE ANALYSIS:
1. Test Timeout: Test exceeded 30-second timeout at line 259
2. Missing Validation: Website doesn't implement real-time form validation  
3. Expected vs Actual: Test expects validation errors that don't exist

VALIDATION RULES NOT IMPLEMENTED:
- Token Name: 2-25 characters, alphanumeric, no spaces/special chars
- Token Symbol: 1-8 characters, alphabets only, no spaces/numbers
- Description: 2-250 characters validation
- Image Upload: JPG/JPEG/PNG format, <4MB size validation

TECHNICAL DETAILS:
Test File: tests/launch-page-simple.spec.ts
Failed Test: 'should test token symbol validation rules'
Error Location: Line 259 - await page.waitForTimeout(1000)
Error Message: Test timeout of 30000ms exceeded

RECOMMENDATIONS:
1. Update Website (Recommended) - Implement required form validation rules
2. Update Tests - Remove validation expectations, focus on functionality  
3. Hybrid Approach - Test current functionality, document missing validation"
            issuetype = @{
                name = "Bug"
            }
            priority = @{
                name = "Medium"
            }
            labels = @("form-validation", "launch-page", "test-failure", "website-limitation", "web3", "defi")
        }
    } | ConvertTo-Json -Depth 5
    
    $ticketResponse = Invoke-RestMethod -Uri "$JIRA_BASE_URL/rest/api/3/issue" -Method POST -Headers @{
        "Authorization" = "Basic $AUTH_HEADER"
        "Content-Type" = "application/json"
    } -Body $ticketData
    
    Write-Host "SUCCESS: JIRA Ticket Created!"
    Write-Host "Ticket Key: $($ticketResponse.key)"
    Write-Host "Ticket URL: https://galagames.atlassian.net/browse/$($ticketResponse.key)"
    Write-Host ""
    Write-Host "Ticket Details:"
    Write-Host "- Project: Gala Wallet (GW)"
    Write-Host "- Summary: Test Failure: Token Symbol Validation Test Timeout"
    Write-Host "- Type: Bug"
    Write-Host "- Priority: Medium"
    Write-Host "- Labels: form-validation, launch-page, test-failure, website-limitation, web3, defi"
}
catch {
    Write-Host "FAILED: Could not create JIRA ticket"
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode"
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody"
        }
        catch {
            Write-Host "Could not read response details"
        }
    }
}

