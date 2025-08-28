# GPS Attendance Tracker - Backend Test Hub
# Author: borakport
# Updated: 2025-08-28 UTC

$Host.UI.RawUI.WindowTitle = "GPS Attendance Tracker - Test Hub"

# Service URLs
$AUTH_API = "http://localhost:3001/api/v1/auth"
$ATTENDANCE_API = "http://localhost:3002/api/v1"
$REALTIME_URL = "http://localhost:3003"

# Colors
function Write-Menu { param($Text) Write-Host $Text -ForegroundColor Cyan }
function Write-Success { param($Text) Write-Host $Text -ForegroundColor Green }
function Write-Error { param($Text) Write-Host $Text -ForegroundColor Red }
function Write-Info { param($Text) Write-Host $Text -ForegroundColor Yellow }

# Global variables to store tokens and IDs
$global:instructorToken = ""
$global:studentToken = ""
$global:adminToken = ""
$global:courseId = ""
$global:sessionId = ""

# Function to display main menu
function Show-MainMenu {
    Clear-Host
    Write-Host "=================================================" -ForegroundColor Blue
    Write-Host "    GPS ATTENDANCE TRACKER - BACKEND TEST HUB   " -ForegroundColor Blue
    Write-Host "=================================================" -ForegroundColor Blue
    Write-Host ""
    Write-Menu "1. Service Health Checks"
    Write-Menu "2. Authentication Tests"
    Write-Menu "3. Course Management Tests"
    Write-Menu "4. Session Management Tests"
    Write-Menu "5. Attendance Marking Tests (GPS Only)"
    Write-Menu "6. WebSocket Real-time Tests"
    Write-Menu "7. Full Workflow Test"
    Write-Menu "8. Get Seeded Data IDs"
    Write-Menu "9. Show Current Tokens & IDs"
    Write-Menu "0. Exit"
    Write-Host ""
    Write-Host "Select an option: " -NoNewline
}

# 1. Service Health Checks
function Test-ServiceHealth {
    Clear-Host
    Write-Host "=== SERVICE HEALTH CHECKS ===" -ForegroundColor Blue
    
    Write-Info "`nChecking Auth Service (Port 3001)..."
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
        Write-Success "✓ Auth Service: Running"
        $response | ConvertTo-Json
    } catch {
        Write-Error "✗ Auth Service: Not responding"
    }
    
    Write-Info "`nChecking Attendance Service (Port 3002)..."
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method Get
        Write-Success "✓ Attendance Service: Running"
        $response | ConvertTo-Json
    } catch {
        Write-Error "✗ Attendance Service: Not responding"
    }
    
    Write-Info "`nChecking Realtime Service (Port 3003)..."
    Write-Info "Open http://localhost:3003 in browser to check Socket.io status"
    
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 2. Authentication Tests
function Test-Authentication {
    Clear-Host
    Write-Host "=== AUTHENTICATION TESTS ===" -ForegroundColor Blue
    
    Write-Menu "`n1. Sign in as Instructor"
    Write-Menu "2. Sign in as Student"
    Write-Menu "3. Sign in as Admin"
    Write-Menu "4. Test Sign up (new user)"
    Write-Menu "5. Get User Profile"
    Write-Menu "6. Refresh Token"
    Write-Menu "0. Back to Main Menu"
    
    $choice = Read-Host "`nSelect option"
    
    switch ($choice) {
        "1" {
            Write-Info "`nSigning in as Instructor..."
            $body = @{
                email = "instructor@attendance.com"
                password = "Instructor@123"
            } | ConvertTo-Json
            
            try {
                $response = Invoke-RestMethod -Uri "$AUTH_API/signin" -Method Post -ContentType "application/json" -Body $body
                $global:instructorToken = $response.data.tokens.accessToken
                Write-Success "✓ Instructor signed in successfully!"
                Write-Info "Token saved to global:instructorToken"
                $response.data.user | ConvertTo-Json
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "2" {
            Write-Info "`nSigning in as Student..."
            $body = @{
                email = "student1@attendance.com"
                password = "Student@123"
            } | ConvertTo-Json
            
            try {
                $response = Invoke-RestMethod -Uri "$AUTH_API/signin" -Method Post -ContentType "application/json" -Body $body
                $global:studentToken = $response.data.tokens.accessToken
                Write-Success "✓ Student signed in successfully!"
                Write-Info "Token saved to global:studentToken"
                $response.data.user | ConvertTo-Json
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "3" {
            Write-Info "`nSigning in as Admin..."
            $body = @{
                email = "admin@attendance.com"
                password = "Admin@123"
            } | ConvertTo-Json
            
            try {
                $response = Invoke-RestMethod -Uri "$AUTH_API/signin" -Method Post -ContentType "application/json" -Body $body
                $global:adminToken = $response.data.tokens.accessToken
                Write-Success "✓ Admin signed in successfully!"
                Write-Info "Token saved to global:adminToken"
                $response.data.user | ConvertTo-Json
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "4" {
            Write-Info "`nCreating new user..."
            $email = Read-Host "Enter email"
            $password = Read-Host "Enter password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special)"
            
            $body = @{
                email = $email
                password = $password
                confirmPassword = $password
                firstName = "Test"
                lastName = "User"
                phoneNumber = "+1234567890"
            } | ConvertTo-Json
            
            try {
                $response = Invoke-RestMethod -Uri "$AUTH_API/signup" -Method Post -ContentType "application/json" -Body $body
                Write-Success "✓ User created successfully!"
                $response | ConvertTo-Json
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "5" {
            if (-not $global:instructorToken -and -not $global:studentToken) {
                Write-Error "Please sign in first!"
            } else {
                $token = if ($global:instructorToken) { $global:instructorToken } else { $global:studentToken }
                $headers = @{ "Authorization" = "Bearer $token" }
                
                try {
                    $response = Invoke-RestMethod -Uri "$AUTH_API/profile" -Method Get -Headers $headers
                    Write-Success "✓ Profile retrieved!"
                    $response.data | ConvertTo-Json
                } catch {
                    Write-Error "Failed: $_"
                }
            }
        }
    }
    
    if ($choice -ne "0") {
        Write-Host "`nPress any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

# 3. Course Management Tests
function Test-CourseManagement {
    Clear-Host
    Write-Host "=== COURSE MANAGEMENT TESTS ===" -ForegroundColor Blue
    
    Write-Menu "`n1. Get All Courses"
    Write-Menu "2. Create New Course (Instructor)"
    Write-Menu "3. Get Course by ID"
    Write-Menu "4. Join Course (Student) - Using Code"
    Write-Menu "5. Leave Course (Student)"
    Write-Menu "6. Update Course (Instructor)"
    Write-Menu "0. Back to Main Menu"
    
    $choice = Read-Host "`nSelect option"
    
    switch ($choice) {
        "1" {
            if (-not $global:instructorToken) {
                Write-Error "Please sign in as instructor first!"
                return
            }
            
            $headers = @{ "Authorization" = "Bearer $global:instructorToken" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/courses" -Method Get -Headers $headers
                Write-Success "✓ Courses retrieved!"
                
                if ($response.data.Count -gt 0) {
                    $global:courseId = $response.data[0].id
                    Write-Info "First course ID saved to global:courseId"
                }
                
                $response.data | ForEach-Object {
                    Write-Host "`n------------------------"
                    Write-Host "ID: $($_.id)" -ForegroundColor Yellow
                    Write-Host "Name: $($_.name)"
                    Write-Host "Code: $($_.code)" -ForegroundColor Cyan
                    Write-Host "Owner: $($_.owner.firstName) $($_.owner.lastName)"
                    Write-Host "Members: $($_._count.members)"
                    Write-Host "Sessions: $($_._count.sessions)"
                }
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "2" {
            if (-not $global:instructorToken) {
                Write-Error "Please sign in as instructor first!"
                return
            }
            
            $courseName = Read-Host "Enter course name"
            $body = @{
                name = $courseName
                description = "Test course created via Test Hub"
                startDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
                endDate = (Get-Date).AddMonths(3).ToString("yyyy-MM-dd")
                settings = @{
                    gpsRadius = 100
                    allowLateEntry = $true
                    lateEntryMinutes = 15
                    requireSelfie = $false
                }
            } | ConvertTo-Json -Depth 3
            
            $headers = @{ "Authorization" = "Bearer $global:instructorToken" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/courses" -Method Post -Headers $headers -ContentType "application/json" -Body $body
                Write-Success "✓ Course created!"
                Write-Info "Course Code: $($response.data.code)" 
                Write-Host "Students can join using this code!" -ForegroundColor Green
                $global:courseId = $response.data.id
                Write-Info "Course ID saved to global:courseId"
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "4" {
            if (-not $global:studentToken) {
                Write-Error "Please sign in as student first!"
                return
            }
            
            $code = Read-Host "Enter course code (e.g., CS101XXXX)"
            $body = @{ code = $code } | ConvertTo-Json
            
            $headers = @{ "Authorization" = "Bearer $global:studentToken" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/courses/join" -Method Post -Headers $headers -ContentType "application/json" -Body $body
                Write-Success "✓ Successfully joined course!"
                $response.data | ConvertTo-Json
            } catch {
                Write-Error "Failed: $_"
            }
        }
    }
    
    if ($choice -ne "0") {
        Write-Host "`nPress any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

# 4. Session Management Tests
function Test-SessionManagement {
    Clear-Host
    Write-Host "=== SESSION MANAGEMENT TESTS ===" -ForegroundColor Blue
    
    Write-Menu "`n1. Get Active Sessions"
    Write-Menu "2. Create New Session (Instructor)"
    Write-Menu "3. Start Session (Instructor)"
    Write-Menu "4. End Session (Instructor)"
    Write-Menu "5. Get Session Details"
    Write-Menu "0. Back to Main Menu"
    
    $choice = Read-Host "`nSelect option"
    
    switch ($choice) {
        "1" {
            $token = if ($global:instructorToken) { $global:instructorToken } else { $global:studentToken }
            if (-not $token) {
                Write-Error "Please sign in first!"
                return
            }
            
            $headers = @{ "Authorization" = "Bearer $token" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/sessions/active" -Method Get -Headers $headers
                Write-Success "✓ Active sessions retrieved!"
                
                if ($response.data.Count -eq 0) {
                    Write-Info "No active sessions found"
                } else {
                    $response.data | ForEach-Object {
                        Write-Host "`n------------------------"
                        Write-Host "Session: $($_.name)" -ForegroundColor Yellow
                        Write-Host "Course: $($_.course.name)"
                        Write-Host "Started: $($_.startedAt)"
                        Write-Host "Attendances: $($_._count.attendances)"
                    }
                }
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "2" {
            if (-not $global:instructorToken) {
                Write-Error "Please sign in as instructor first!"
                return
            }
            
            if (-not $global:courseId) {
                $global:courseId = Read-Host "Enter Course ID"
            }
            
            $sessionName = Read-Host "Enter session name"
            $startTime = (Get-Date).AddMinutes(5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            $endTime = (Get-Date).AddHours(2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            
            $body = @{
                courseId = $global:courseId
                name = $sessionName
                description = "Test session from Test Hub"
                startTime = $startTime
                endTime = $endTime
                latitude = 37.7749
                longitude = -122.4194
                radiusMeters = 100
                locationName = "Test Location"
                allowLateEntry = $true
                lateMinutes = 15
                requireSelfie = $false
            } | ConvertTo-Json
            
            $headers = @{ "Authorization" = "Bearer $global:instructorToken" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/sessions" -Method Post -Headers $headers -ContentType "application/json" -Body $body
                Write-Success "✓ Session created!"
                Write-Info "Session ID: $($response.data.id)"
                Write-Info "Location: 37.7749, -122.4194"
                Write-Info "GPS Radius: 100 meters"
                Write-Host "NO ACCESS CODE NEEDED - GPS Verification Only!" -ForegroundColor Green
                $global:sessionId = $response.data.id
                Write-Info "Session ID saved to global:sessionId"
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "3" {
            if (-not $global:instructorToken) {
                Write-Error "Please sign in as instructor first!"
                return
            }
            
            if (-not $global:sessionId) {
                $global:sessionId = Read-Host "Enter Session ID"
            }
            
            $body = @{} | ConvertTo-Json
            
            $headers = @{ "Authorization" = "Bearer $global:instructorToken" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/sessions/$global:sessionId/start" -Method Post -Headers $headers -ContentType "application/json" -Body $body
                Write-Success "✓ Session started!"
                Write-Host "Students can now mark attendance using GPS verification" -ForegroundColor Green
                Write-Host "💡 Real-time events will be broadcast to WebSocket clients:" -ForegroundColor Yellow
                Write-Host "   - session:started event sent to course room" -ForegroundColor Cyan
                Write-Host "   - Use WebSocket test panel to monitor events" -ForegroundColor Cyan
                $response.data | ConvertTo-Json
            } catch {
                Write-Error "Failed: $_"
            }
        }
    }
    
    if ($choice -ne "0") {
        Write-Host "`nPress any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

# 5. Attendance Tests (GPS Only)
function Test-Attendance {
    Clear-Host
    Write-Host "=== ATTENDANCE MARKING TESTS (GPS ONLY) ===" -ForegroundColor Blue
    Write-Info "`nNote: No access codes required - GPS verification only!"
    
    Write-Menu "`n1. Mark Attendance - Within GPS Range (Should Succeed + Trigger Real-time Event)"
    Write-Menu "2. Mark Attendance - Outside GPS Range (Should Fail)"
    Write-Menu "3. Get Session Attendance Report"
    Write-Menu "4. Get My Attendance History"
    Write-Menu "0. Back to Main Menu"
    
    $choice = Read-Host "`nSelect option"
    
    switch ($choice) {
        "1" {
            if (-not $global:studentToken) {
                Write-Error "Please sign in as student first!"
                return
            }
            
            if (-not $global:sessionId) {
                $global:sessionId = Read-Host "Enter Active Session ID"
            }
            
            Write-Info "Marking attendance with GPS coordinates within range..."
            $body = @{
                sessionId = $global:sessionId
                latitude = 37.7749
                longitude = -122.4194
                deviceInfo = @{
                    platform = "windows"
                    model = "Desktop"
                    osVersion = "Windows 11"
                    appVersion = "1.0.0"
                }
            } | ConvertTo-Json -Depth 3
            
            $headers = @{ "Authorization" = "Bearer $global:studentToken" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/attendance/mark" -Method Post -Headers $headers -ContentType "application/json" -Body $body
                Write-Success "✓ Attendance marked successfully!"
                Write-Info "Status: $($response.data.status)"
                Write-Info "Distance from session: $($response.data.distanceFromSession) meters"
                Write-Host ""
                Write-Host "🔄 Real-time Event Triggered!" -ForegroundColor Green
                Write-Host "   • Check WebSocket panel for 'attendance:update' event" -ForegroundColor Cyan
                Write-Host "   • Instructors monitoring this session will see instant notification" -ForegroundColor Cyan
                Write-Host "   • Event includes user name, status, distance, and timestamp" -ForegroundColor Cyan
            } catch {
                Write-Error "Failed: $_"
            }
        }
        "2" {
            if (-not $global:studentToken) {
                Write-Error "Please sign in as student first!"
                return
            }
            
            if (-not $global:sessionId) {
                $global:sessionId = Read-Host "Enter Active Session ID"
            }
            
            Write-Info "Attempting to mark attendance from outside GPS range..."
            $body = @{
                sessionId = $global:sessionId
                latitude = 37.8000  # Far from session location
                longitude = -122.4500
                deviceInfo = @{
                    platform = "windows"
                    model = "Desktop"
                    osVersion = "Windows 11"
                    appVersion = "1.0.0"
                }
            } | ConvertTo-Json -Depth 3
            
            $headers = @{ "Authorization" = "Bearer $global:studentToken" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/attendance/mark" -Method Post -Headers $headers -ContentType "application/json" -Body $body
                Write-Error "Unexpected success - should have failed!"
            } catch {
                Write-Success "✓ Correctly rejected - outside GPS range!"
                Write-Info "This is expected behavior - students must be within GPS range"
            }
        }
        "3" {
            if (-not $global:instructorToken) {
                Write-Error "Please sign in as instructor first!"
                return
            }
            
            if (-not $global:sessionId) {
                $global:sessionId = Read-Host "Enter Session ID"
            }
            
            $headers = @{ "Authorization" = "Bearer $global:instructorToken" }
            try {
                $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/attendance/session/$global:sessionId" -Method Get -Headers $headers
                Write-Success "✓ Attendance report retrieved!"
                
                Write-Host "`nAttendance Statistics:" -ForegroundColor Yellow
                Write-Host "Total Students: $($response.data.stats.total)"
                Write-Host "Present: $($response.data.stats.present)" -ForegroundColor Green
                Write-Host "Late: $($response.data.stats.late)" -ForegroundColor Yellow
                Write-Host "Absent: $($response.data.stats.absent)" -ForegroundColor Red
                
                if ($response.data.attendances.Count -gt 0) {
                    Write-Host "`nAttended Students:" -ForegroundColor Green
                    $response.data.attendances | ForEach-Object {
                        Write-Host "- $($_.user.firstName) $($_.user.lastName): $($_.status) (Distance: $($_.distanceFromSession)m)"
                    }
                }
            } catch {
                Write-Error "Failed: $_"
            }
        }
    }
    
    if ($choice -ne "0") {
        Write-Host "`nPress any key to continue..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

# 6. WebSocket Tests
function Test-WebSocket {
    Clear-Host
    Write-Host "=== WEBSOCKET REAL-TIME TESTS ===" -ForegroundColor Blue
    
    Write-Info "`nTo test WebSocket connections:"
    Write-Host "1. Copy the realtime service test file path:" -ForegroundColor Yellow
    Write-Host "   $PWD\services\realtime-service\test-websocket.html" -ForegroundColor Cyan
    Write-Host "2. Open it in your browser (file:// protocol)" -ForegroundColor Yellow
    Write-Host "3. Use these tokens to connect:" -ForegroundColor Yellow
    
    if ($global:instructorToken) {
        Write-Host "`nInstructor Token:" -ForegroundColor Green
        Write-Host $global:instructorToken
    }
    if ($global:studentToken) {
        Write-Host "`nStudent Token:" -ForegroundColor Green
        Write-Host $global:studentToken
    }
    
    if ($global:courseId) {
        Write-Host "`nCourse ID to test:" -ForegroundColor Yellow
        Write-Host $global:courseId
    }
    if ($global:sessionId) {
        Write-Host "`nSession ID to test:" -ForegroundColor Yellow
        Write-Host $global:sessionId
    }
    
    Write-Host "`n🔧 WebSocket Test Instructions:" -ForegroundColor Blue
    Write-Host "   • Paste JWT token in auth field and click 'Save'" -ForegroundColor White
    Write-Host "   • Click 'Connect' to establish WebSocket connection" -ForegroundColor White
    Write-Host "   • Use Course ID and Session ID from this test hub" -ForegroundColor White
    Write-Host "   • Click 'Join Course Room' to monitor course events" -ForegroundColor White
    Write-Host "   • Start session here (option 4) and watch real-time notifications" -ForegroundColor White
    Write-Host "   • Mark attendance via API (option 5) and watch real-time updates" -ForegroundColor White
    Write-Host "   • All events show in real-time log with timestamps" -ForegroundColor White
    
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 7. Full Workflow Test
function Test-FullWorkflow {
    Clear-Host
    Write-Host "=== FULL WORKFLOW TEST ===" -ForegroundColor Blue
    Write-Info "This will test the complete attendance flow..."
    
    # Step 1: Sign in as instructor
    Write-Host "`n[Step 1] Signing in as Instructor..." -ForegroundColor Yellow
    $body = @{
        email = "instructor@attendance.com"
        password = "Instructor@123"
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$AUTH_API/signin" -Method Post -ContentType "application/json" -Body $body
    $global:instructorToken = $response.data.tokens.accessToken
    Write-Success "✓ Instructor logged in"
    
    # Step 2: Get courses
    Write-Host "`n[Step 2] Getting instructor's courses..." -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $global:instructorToken" }
    $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/courses" -Method Get -Headers $headers
    $global:courseId = $response.data[0].id
    Write-Success "✓ Using course: $($response.data[0].name)"
    
    # Step 3: Create session
    Write-Host "`n[Step 3] Creating new session..." -ForegroundColor Yellow
    $body = @{
        courseId = $global:courseId
        name = "Automated Test Session $(Get-Date -Format 'HH:mm')"
        description = "Full workflow test"
        startTime = (Get-Date).AddMinutes(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        endTime = (Get-Date).AddHours(2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        latitude = 37.7749
        longitude = -122.4194
        radiusMeters = 100
        locationName = "Test Hub Location"
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/sessions" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    $global:sessionId = $response.data.id
    Write-Success "✓ Session created (GPS verification only, no access code)"
    
    # Step 4: Start session
    Write-Host "`n[Step 4] Starting session..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    $body = @{} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/sessions/$global:sessionId/start" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    Write-Success "✓ Session is now active"
    
    # Step 5: Sign in as student
    Write-Host "`n[Step 5] Signing in as Student..." -ForegroundColor Yellow
    $body = @{
        email = "student1@attendance.com"
        password = "Student@123"
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$AUTH_API/signin" -Method Post -ContentType "application/json" -Body $body
    $global:studentToken = $response.data.tokens.accessToken
    Write-Success "✓ Student logged in"
    
    # Step 6: Mark attendance (within GPS range)
    Write-Host "`n[Step 6] Student marking attendance (within GPS range)..." -ForegroundColor Yellow
    $body = @{
        sessionId = $global:sessionId
        latitude = 37.7749
        longitude = -122.4194
        deviceInfo = @{
            platform = "test"
            model = "TestHub"
            osVersion = "Windows"
            appVersion = "1.0.0"
        }
    } | ConvertTo-Json -Depth 3
    $headers = @{ "Authorization" = "Bearer $global:studentToken" }
    $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/attendance/mark" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    Write-Success "✓ Attendance marked: $($response.data.status)"
    Write-Info "Distance from session: $($response.data.distanceInMeters) meters"
    
    # Step 7: Get attendance report
    Write-Host "`n[Step 7] Getting attendance report..." -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $global:instructorToken" }
    $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/attendance/session/$global:sessionId" -Method Get -Headers $headers
    Write-Success "✓ Attendance report retrieved"
    Write-Info "Present: $($response.data.stats.present), Late: $($response.data.stats.late), Absent: $($response.data.stats.absent)"
    
    Write-Success "`n✅ Full workflow test completed successfully!"
    
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 8. Get Seeded Data
function Get-SeededData {
    Clear-Host
    Write-Host "=== GETTING SEEDED DATA IDS ===" -ForegroundColor Blue
    
    # Sign in as instructor to get data
    Write-Info "`nSigning in to retrieve seeded data..."
    $body = @{
        email = "instructor@attendance.com"
        password = "Instructor@123"
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$AUTH_API/signin" -Method Post -ContentType "application/json" -Body $body
    $token = $response.data.tokens.accessToken
    
    # Get courses
    Write-Info "`nFetching courses..."
    $headers = @{ "Authorization" = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$ATTENDANCE_API/courses" -Method Get -Headers $headers
    
    Write-Host "`n=== SEEDED COURSES ===" -ForegroundColor Green
    $response.data | ForEach-Object {
        Write-Host "`nCourse Name: $($_.name)" -ForegroundColor Yellow
        Write-Host "Course ID: $($_.id)"
        Write-Host "Course Code: $($_.code)" -ForegroundColor Cyan
        Write-Host "Members: $($_._count.members)"
        
        if ($_.id -and -not $global:courseId) {
            $global:courseId = $_.id
        }
    }
    
    Write-Info "`nNote: Course codes are needed for students to join courses"
    
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 9. Show current tokens
function Show-CurrentTokens {
    Clear-Host
    Write-Host "=== CURRENT TOKENS & IDS ===" -ForegroundColor Blue
    
    if ($global:instructorToken) {
        Write-Host "`nInstructor Token (truncated):" -ForegroundColor Green
        Write-Host "$($global:instructorToken.Substring(0, 50))..."
    } else {
        Write-Host "`nInstructor Token: Not set" -ForegroundColor Red
    }
    
    if ($global:studentToken) {
        Write-Host "`nStudent Token (truncated):" -ForegroundColor Green
        Write-Host "$($global:studentToken.Substring(0, 50))..."
    } else {
        Write-Host "`nStudent Token: Not set" -ForegroundColor Red
    }
    
    if ($global:adminToken) {
        Write-Host "`nAdmin Token (truncated):" -ForegroundColor Green
        Write-Host "$($global:adminToken.Substring(0, 50))..."
    } else {
        Write-Host "`nAdmin Token: Not set" -ForegroundColor Red
    }
    
    Write-Host "`n=== CURRENT IDS ===" -ForegroundColor Blue
    Write-Host "Course ID: $(if ($global:courseId) { $global:courseId } else { 'Not set' })" -ForegroundColor $(if ($global:courseId) { 'Green' } else { 'Red' })
    Write-Host "Session ID: $(if ($global:sessionId) { $global:sessionId } else { 'Not set' })" -ForegroundColor $(if ($global:sessionId) { 'Green' } else { 'Red' })
    
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Main Loop
while ($true) {
    Show-MainMenu
    $choice = Read-Host
    
    switch ($choice) {
        "1" { Test-ServiceHealth }
        "2" { Test-Authentication }
        "3" { Test-CourseManagement }
        "4" { Test-SessionManagement }
        "5" { Test-Attendance }
        "6" { Test-WebSocket }
        "7" { Test-FullWorkflow }
        "8" { Get-SeededData }
        "9" { Show-CurrentTokens }
        "0" { 
            Write-Host "`nExiting Test Hub..." -ForegroundColor Yellow
            exit 
        }
        default { Write-Error "Invalid option. Please try again." }
    }
}