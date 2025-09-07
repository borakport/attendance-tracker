# Test script for admin endpoints (PowerShell version)
# Make sure both auth-service and attendance-service are running

$BASE_URL_AUTH = "http://localhost:3001/api/auth"
$BASE_URL_ATTENDANCE = "http://localhost:3002/api/attendance"

Write-Host "Testing Admin Endpoints..." -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

# First, get an admin token (you'll need to replace with actual admin credentials)
Write-Host "1. Login as admin to get token..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL_AUTH/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $response.data.token
    
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host ""
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Test Auth Service Admin Endpoints
    Write-Host "2. Testing Auth Service Admin Endpoints..." -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    
    Write-Host "2.1. Get user statistics..." -ForegroundColor Cyan
    try {
        $userStats = Invoke-RestMethod -Uri "$BASE_URL_AUTH/admin/stats" -Method GET -Headers $headers
        Write-Host ($userStats | ConvertTo-Json -Depth 3) -ForegroundColor White
    } catch {
        Write-Host "Error getting user stats: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "2.2. Get all users..." -ForegroundColor Cyan
    try {
        $users = Invoke-RestMethod -Uri "$BASE_URL_AUTH/admin/users?page=1&limit=5" -Method GET -Headers $headers
        Write-Host ($users | ConvertTo-Json -Depth 3) -ForegroundColor White
    } catch {
        Write-Host "Error getting users: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Test Attendance Service Admin Endpoints
    Write-Host "3. Testing Attendance Service Admin Endpoints..." -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    
    Write-Host "3.1. Get dashboard statistics..." -ForegroundColor Cyan
    try {
        $dashStats = Invoke-RestMethod -Uri "$BASE_URL_ATTENDANCE/admin/stats" -Method GET -Headers $headers
        Write-Host ($dashStats | ConvertTo-Json -Depth 3) -ForegroundColor White
    } catch {
        Write-Host "Error getting dashboard stats: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "3.2. Get all courses..." -ForegroundColor Cyan
    try {
        $courses = Invoke-RestMethod -Uri "$BASE_URL_ATTENDANCE/admin/courses?page=1&limit=5" -Method GET -Headers $headers
        Write-Host ($courses | ConvertTo-Json -Depth 3) -ForegroundColor White
    } catch {
        Write-Host "Error getting courses: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "3.3. Get all sessions..." -ForegroundColor Cyan
    try {
        $sessions = Invoke-RestMethod -Uri "$BASE_URL_ATTENDANCE/admin/sessions?page=1&limit=5" -Method GET -Headers $headers
        Write-Host ($sessions | ConvertTo-Json -Depth 3) -ForegroundColor White
    } catch {
        Write-Host "Error getting sessions: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Admin endpoints testing completed!" -ForegroundColor Green
    
} catch {
    Write-Host "Failed to login as admin: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check admin credentials and make sure auth service is running." -ForegroundColor Red
}
