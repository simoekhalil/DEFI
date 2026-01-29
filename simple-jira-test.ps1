# Simple JIRA connection test
$JIRA_BASE_URL = "https://galagames.atlassian.net"
$EMAIL = "Skhalil@gala.games"
$API_TOKEN = $env:JIRA_API_TOKEN  # Set via environment variable
$PROJECT_KEY = "GW"

# Create authentication header
$AUTH_STRING = "$EMAIL" + ":" + "$API_TOKEN"
$AUTH_BYTES = [System.Text.Encoding]::UTF8.GetBytes($AUTH_STRING)
$AUTH_HEADER = [System.Convert]::ToBase64String($AUTH_BYTES)

Write-Host "🔍 Testing JIRA connection..."
Write-Host "Base URL: $JIRA_BASE_URL"
Write-Host "Project Key: $PROJECT_KEY"
Write-Host "Email: $EMAIL"

try {
    # Test connection by getting project info
    $response = Invoke-RestMethod -Uri "$JIRA_BASE_URL/rest/api/3/project/$PROJECT_KEY" -Method GET -Headers @{
        "Authorization" = "Basic $AUTH_HEADER"
        "Content-Type" = "application/json"
    }

    Write-Host "✅ JIRA Connection Successful!"
    Write-Host "Project Name: $($response.name)"
    Write-Host "Project Key: $($response.key)"
    Write-Host "Project ID: $($response.id)"
}
catch {
    Write-Host "❌ JIRA Connection Failed"
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode"
    }
}

