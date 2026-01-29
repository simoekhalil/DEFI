# Simple JIRA connection test
$JIRA_BASE_URL = "https://galagames.atlassian.net"
$EMAIL = "Skhalil@gala.games"
$API_TOKEN = $env:JIRA_API_TOKEN  # Set via environment variable
$PROJECT_KEY = "GW"

# Create authentication header
$AUTH_STRING = "$EMAIL" + ":" + "$API_TOKEN"
$AUTH_BYTES = [System.Text.Encoding]::UTF8.GetBytes($AUTH_STRING)
$AUTH_HEADER = [System.Convert]::ToBase64String($AUTH_BYTES)

Write-Host "Testing JIRA connection..."
Write-Host "Base URL: $JIRA_BASE_URL"
Write-Host "Project Key: $PROJECT_KEY"
Write-Host "Email: $EMAIL"

try {
    # Test connection by getting project info
    $response = Invoke-RestMethod -Uri "$JIRA_BASE_URL/rest/api/3/project/$PROJECT_KEY" -Method GET -Headers @{
        "Authorization" = "Basic $AUTH_HEADER"
        "Content-Type" = "application/json"
    }

    Write-Host "JIRA Connection Successful!"
    Write-Host "Project Name: $($response.name)"
    Write-Host "Project Key: $($response.key)"
    Write-Host "Project ID: $($response.id)"
    
    # Now try to create a simple ticket
    Write-Host "Creating JIRA ticket..."
    
    $ticketData = @{
        fields = @{
            project = @{
                key = $PROJECT_KEY
            }
            summary = "Test Failure: Token Symbol Validation Test Timeout - Website Missing Validation Implementation"
            description = "The 'should test token symbol validation rules' test is failing due to timeout, but investigation reveals the actual issue is that the Gala DeFi website doesn't implement the required form validation rules.`n`nTest Results:`n- 6 tests PASSED (85.7% success rate)`n- 1 test FAILED - Token Symbol Validation`n- Duration: 33.6 seconds (exceeded 30s timeout)`n`nRoot Cause Analysis:`n1. Test Timeout: Test exceeded 30-second timeout at line 259`n2. Missing Validation: Website doesn't implement real-time form validation`n3. Expected vs Actual: Test expects validation errors that don't exist on the website`n`nValidation Rules Not Implemented:`n- Token Name: 2-25 characters, alphanumeric, no spaces/special chars`n- Token Symbol: 1-8 characters, alphabets only, no spaces/numbers`n- Description: 2-250 characters validation`n- Image Upload: JPG/JPEG/PNG format, <4MB size validation`n`nTechnical Details:`nTest File: tests/launch-page-simple.spec.ts`nFailed Test: 'should test token symbol validation rules'`nError Location: Line 259 - await page.waitForTimeout(1000)`nError Message: Test timeout of 30000ms exceeded`n`nRecommendations:`n1. Option 1: Update Website (Recommended) - Implement the required form validation rules`n2. Option 2: Update Tests - Remove validation expectations, focus on form functionality`n3. Option 3: Hybrid Approach - Test current functionality, document missing validation"
            issuetype = @{
                name = "Bug"
            }
            priority = @{
                name = "Medium"
            }
        }
    } | ConvertTo-Json -Depth 5
    
    $ticketResponse = Invoke-RestMethod -Uri "$JIRA_BASE_URL/rest/api/3/issue" -Method POST -Headers @{
        "Authorization" = "Basic $AUTH_HEADER"
        "Content-Type" = "application/json"
    } -Body $ticketData
    
    Write-Host "JIRA Ticket Created Successfully!"
    Write-Host "Ticket Key: $($ticketResponse.key)"
    Write-Host "Ticket URL: https://galagames.atlassian.net/browse/$($ticketResponse.key)"
}
catch {
    Write-Host "JIRA Operation Failed"
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode"
        
        # Try to get response content
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody"
        }
        catch {
            Write-Host "Could not read response body"
        }
    }
}

