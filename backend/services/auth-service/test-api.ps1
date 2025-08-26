# PowerShell script for testing Auth Service API

$API_URL = "http://localhost:3001/api/v1/auth"

Write-Host "Testing Auth Service API" -ForegroundColor Blue
Write-Host "========================" -ForegroundColor Blue

# Test Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Green
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get | ConvertTo-Json

# Test Signin
Write-Host "`n2. Testing Signin with Student Account..." -ForegroundColor Green
$signinBody = @{
    email = "student1@attendance.com"
    password = "Student@123"
} | ConvertTo-Json

$signinResponse = Invoke-RestMethod -Uri "$API_URL/signin" `
    -Method Post `
    -ContentType "application/json" `
    -Body $signinBody

$signinResponse | ConvertTo-Json -Depth 10

# Get tokens
$accessToken = $signinResponse.data.tokens.accessToken
$refreshToken = $signinResponse.data.tokens.refreshToken

if ($accessToken) {
    Write-Host "`n3. Testing Get Profile..." -ForegroundColor Green
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    Invoke-RestMethod -Uri "$API_URL/profile" `
        -Method Get `
        -Headers $headers | ConvertTo-Json
}

Write-Host "`nTesting Complete!" -ForegroundColor Blue
