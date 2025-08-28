# PowerShell script for testing Attendance Service API
Write-Host "Testing Attendance Service API" -ForegroundColor Blue
Write-Host "==============================" -ForegroundColor Blue

$AUTH_API = "http://localhost:3001/api/v1/auth"
$API_URL = "http://localhost:3002/api/v1"

# Step 1: Get Instructor Token
Write-Host "`n1. Getting Instructor Auth Token..." -ForegroundColor Green
$instructorCreds = @{
    email = "instructor@attendance.com"
    password = "Instructor@123"
} | ConvertTo-Json

$instructorAuth = Invoke-RestMethod -Uri "$AUTH_API/signin" `
    -Method Post `
    -ContentType "application/json" `
    -Body $instructorCreds

$instructorToken = $instructorAuth.data.tokens.accessToken
Write-Host "Instructor token obtained!" -ForegroundColor Yellow

# Step 2: Get Student Token
Write-Host "`n2. Getting Student Auth Token..." -ForegroundColor Green
$studentCreds = @{
    email = "student1@attendance.com"
    password = "Student@123"
} | ConvertTo-Json

$studentAuth = Invoke-RestMethod -Uri "$AUTH_API/signin" `
    -Method Post `
    -ContentType "application/json" `
    -Body $studentCreds

$studentToken = $studentAuth.data.tokens.accessToken
Write-Host "Student token obtained!" -ForegroundColor Yellow

# Step 3: Test Health Check
Write-Host "`n3. Testing Health Check..." -ForegroundColor Green
Invoke-RestMethod -Uri "http://localhost:3002/health" | ConvertTo-Json

# Step 4: Get Courses
Write-Host "`n4. Getting Instructor's Courses..." -ForegroundColor Green
$headers = @{
    "Authorization" = "Bearer $instructorToken"
}

$courses = Invoke-RestMethod -Uri "$API_URL/courses" `
    -Method Get `
    -Headers $headers

$courses | ConvertTo-Json -Depth 10
$courseId = $courses.data[0].id
Write-Host "Using Course ID: $courseId" -ForegroundColor Yellow

# Step 5: Get Active Sessions
Write-Host "`n5. Getting Active Sessions..." -ForegroundColor Green
$sessions = Invoke-RestMethod -Uri "$API_URL/sessions/active" `
    -Method Get `
    -Headers $headers

$sessions | ConvertTo-Json -Depth 10

Write-Host "`nTest Complete!" -ForegroundColor Blue
