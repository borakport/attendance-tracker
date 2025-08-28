# Realtime Service Test Suite
# PowerShell script for comprehensive testing

param(
    [string]$RealtimeUrl = "http://localhost:3003",
    [string]$AuthUrl = "http://localhost:3001",
    [string]$AttendanceUrl = "http://localhost:3002"
)

Write-Host "🚀 Realtime Service Test Suite" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Realtime Service: $RealtimeUrl" -ForegroundColor Gray
Write-Host "Auth Service: $AuthUrl" -ForegroundColor Gray
Write-Host "Attendance Service: $AttendanceUrl" -ForegroundColor Gray
Write-Host ""

function Test-ServiceHealth {
    Write-Host "🏥 Testing Service Health..." -ForegroundColor Yellow
    
    # Test Realtime Service
    try {
        $response = Invoke-RestMethod -Uri "$RealtimeUrl/health" -Method GET -TimeoutSec 5
        if ($response.success) {
            Write-Host "✅ Realtime Service: HEALTHY" -ForegroundColor Green
        } else {
            Write-Host "❌ Realtime Service: UNHEALTHY" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Realtime Service: NOT RESPONDING" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test Auth Service
    try {
        $response = Invoke-RestMethod -Uri "$AuthUrl/health" -Method GET -TimeoutSec 5
        if ($response.success) {
            Write-Host "✅ Auth Service: HEALTHY" -ForegroundColor Green
        } else {
            Write-Host "❌ Auth Service: UNHEALTHY" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Auth Service: NOT RESPONDING" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test Attendance Service
    try {
        $response = Invoke-RestMethod -Uri "$AttendanceUrl/health" -Method GET -TimeoutSec 5
        if ($response.success) {
            Write-Host "✅ Attendance Service: HEALTHY" -ForegroundColor Green
        } else {
            Write-Host "❌ Attendance Service: UNHEALTHY" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Attendance Service: NOT RESPONDING" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Get-AuthToken {
    param(
        [string]$Email = "instructor@attendance.com",
        [string]$Password = "Instructor@123"
    )
    
    Write-Host "🔑 Getting auth token for $Email..." -ForegroundColor Yellow
    
    try {
        $body = @{
            email = $Email
            password = $Password
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$AuthUrl/api/v1/auth/signin" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success -and $response.data.accessToken) {
            Write-Host "✅ Auth token obtained successfully" -ForegroundColor Green
            return $response.data.accessToken
        } else {
            Write-Host "❌ Failed to get auth token" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "❌ Auth request failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Test-RealtimeConnection {
    Write-Host "🔌 Testing Realtime Connections..." -ForegroundColor Yellow
    Write-Host "Open these HTML files in your browser to test:" -ForegroundColor Cyan
    Write-Host "1. Client Auth Test: test-client.html" -ForegroundColor White
    Write-Host "2. Service Auth Test: test-service-auth.html" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Open test files automatically? (y/n)"
    if ($choice -eq "y" -or $choice -eq "Y") {
        $clientTestPath = Join-Path $PSScriptRoot "test-client.html"
        $serviceTestPath = Join-Path $PSScriptRoot "test-service-auth.html"
        
        if (Test-Path $clientTestPath) {
            Start-Process $clientTestPath
            Write-Host "✅ Opened client test in browser" -ForegroundColor Green
        }
        
        if (Test-Path $serviceTestPath) {
            Start-Process $serviceTestPath
            Write-Host "✅ Opened service test in browser" -ForegroundColor Green
        }
    }
}

function Test-SecuritySuite {
    Write-Host "🛡️ Running Security Test Suite..." -ForegroundColor Yellow
    
    $securityTestPath = Join-Path $PSScriptRoot "test-security.js"
    
    if (Test-Path $securityTestPath) {
        try {
            Write-Host "Starting Node.js security test..." -ForegroundColor Cyan
            node $securityTestPath
        } catch {
            Write-Host "❌ Failed to run security test: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Make sure Node.js is installed and socket.io-client is available" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Security test file not found: $securityTestPath" -ForegroundColor Red
    }
}

function Test-EndToEndFlow {
    param([string]$AuthToken)
    
    if (-not $AuthToken) {
        Write-Host "❌ No auth token provided for E2E test" -ForegroundColor Red
        return
    }
    
    Write-Host "🔄 Testing End-to-End Flow..." -ForegroundColor Yellow
    
    # Create a course
    Write-Host "Creating test course..." -ForegroundColor Cyan
    try {
        $courseBody = @{
            name = "E2E Test Course $(Get-Date -Format 'HHmm')"
            description = "End-to-end testing course"
            startDate = "2025-09-01"
            endDate = "2025-12-31"
            settings = @{
                gpsRadius = 50
                allowLateEntry = $true
                lateEntryMinutes = 15
            }
        } | ConvertTo-Json
        
        $headers = @{
            "Authorization" = "Bearer $AuthToken"
            "Content-Type" = "application/json"
        }
        
        $courseResponse = Invoke-RestMethod -Uri "$AttendanceUrl/api/v1/courses" -Method POST -Body $courseBody -Headers $headers
        
        if ($courseResponse.success) {
            $courseId = $courseResponse.data.id
            Write-Host "✅ Course created: $courseId" -ForegroundColor Green
            
            # Create a session
            Write-Host "Creating test session..." -ForegroundColor Cyan
            $sessionBody = @{
                courseId = $courseId
                name = "E2E Test Session"
                description = "End-to-end testing session"
                startTime = (Get-Date).AddMinutes(5).ToString("yyyy-MM-ddTHH:mm:ssZ")
                endTime = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ssZ")
                latitude = 37.7749
                longitude = -122.4194
                radiusMeters = 75
                locationName = "Test Location"
            } | ConvertTo-Json
            
            $sessionResponse = Invoke-RestMethod -Uri "$AttendanceUrl/api/v1/sessions" -Method POST -Body $sessionBody -Headers $headers
            
            if ($sessionResponse.success) {
                $sessionId = $sessionResponse.data.id
                Write-Host "✅ Session created: $sessionId" -ForegroundColor Green
                
                Write-Host "📡 Check realtime service logs for events!" -ForegroundColor Yellow
                Write-Host "   - course:created event should be emitted" -ForegroundColor White
                Write-Host "   - session:created event should be emitted" -ForegroundColor White
            } else {
                Write-Host "❌ Failed to create session" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Failed to create course" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ E2E test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-TestInstructions {
    Write-Host ""
    Write-Host "📋 Manual Testing Instructions:" -ForegroundColor Magenta
    Write-Host "================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "1. 🖥️ Browser Tests:" -ForegroundColor Cyan
    Write-Host "   • Open test-client.html to test JWT client authentication" -ForegroundColor White
    Write-Host "   • Open test-service-auth.html to test service token authentication" -ForegroundColor White
    Write-Host "   • Watch for realtime events in both interfaces" -ForegroundColor White
    Write-Host ""
    Write-Host "2. 🔧 Service Tests:" -ForegroundColor Cyan
    Write-Host "   • Run: node test-security.js for automated security testing" -ForegroundColor White
    Write-Host "   • Check server logs for authentication events" -ForegroundColor White
    Write-Host "   • Verify rate limiting and permission enforcement" -ForegroundColor White
    Write-Host ""
    Write-Host "3. 📡 Event Flow Tests:" -ForegroundColor Cyan
    Write-Host "   • Use attendance service API to create courses/sessions" -ForegroundColor White
    Write-Host "   • Monitor realtime events in client/service test pages" -ForegroundColor White
    Write-Host "   • Verify events reach appropriate namespaces" -ForegroundColor White
    Write-Host ""
    Write-Host "4. 🛡️ Security Verification:" -ForegroundColor Cyan
    Write-Host "   • Test expired tokens (should be rejected)" -ForegroundColor White
    Write-Host "   • Test unauthorized service names (should be rejected)" -ForegroundColor White
    Write-Host "   • Test rate limiting (>100 events/minute should be throttled)" -ForegroundColor White
    Write-Host "   • Test event permissions (wrong service emitting events)" -ForegroundColor White
    Write-Host ""
}

# Main execution
Write-Host ""
Test-ServiceHealth

$instructorToken = Get-AuthToken -Email "instructor@attendance.com" -Password "Instructor@123"
$studentToken = Get-AuthToken -Email "student1@attendance.com" -Password "Student@123"

if ($instructorToken) {
    Write-Host "✅ Instructor token available for testing" -ForegroundColor Green
} else {
    Write-Host "❌ Could not get instructor token" -ForegroundColor Red
}

if ($studentToken) {
    Write-Host "✅ Student token available for testing" -ForegroundColor Green
} else {
    Write-Host "❌ Could not get student token" -ForegroundColor Red
}

Write-Host ""
Write-Host "Choose test type:" -ForegroundColor Yellow
Write-Host "1. Realtime Connection Tests (Browser)" -ForegroundColor White
Write-Host "2. Security Test Suite (Node.js)" -ForegroundColor White
Write-Host "3. End-to-End Flow Test" -ForegroundColor White
Write-Host "4. Show Manual Testing Instructions" -ForegroundColor White
Write-Host "5. All Tests" -ForegroundColor White

$choice = Read-Host "Enter choice (1-5)"

switch ($choice) {
    "1" { Test-RealtimeConnection }
    "2" { Test-SecuritySuite }
    "3" { 
        if ($instructorToken) {
            Test-EndToEndFlow -AuthToken $instructorToken
        } else {
            Write-Host "❌ Cannot run E2E test without instructor token" -ForegroundColor Red
        }
    }
    "4" { Show-TestInstructions }
    "5" {
        Test-RealtimeConnection
        Start-Sleep -Seconds 2
        Test-SecuritySuite
        Start-Sleep -Seconds 2
        if ($instructorToken) {
            Test-EndToEndFlow -AuthToken $instructorToken
        }
        Show-TestInstructions
    }
    default { Show-TestInstructions }
}

Write-Host ""
Write-Host "🎯 Available Tokens for Manual Testing:" -ForegroundColor Magenta
if ($instructorToken) {
    Write-Host "Instructor Token: $instructorToken" -ForegroundColor Green
}
if ($studentToken) {
    Write-Host "Student Token: $studentToken" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Test suite completed!" -ForegroundColor Cyan
