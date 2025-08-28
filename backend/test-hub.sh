#!/bin/bash

# GPS Attendance Tracker - Backend Test Hub
# Author: borakport
# Updated: 2025-08-27 17:42:24 UTC

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service URLs
AUTH_API="http://localhost:3001/api/v1/auth"
ATTENDANCE_API="http://localhost:3002/api/v1"
REALTIME_URL="http://localhost:3003"

# Global variables
INSTRUCTOR_TOKEN=""
STUDENT_TOKEN=""
ADMIN_TOKEN=""
COURSE_ID=""
SESSION_ID=""

# Function to show main menu
show_main_menu() {
    clear
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}    GPS ATTENDANCE TRACKER - BACKEND TEST HUB   ${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo ""
    echo -e "${CYAN}1. Service Health Checks${NC}"
    echo -e "${CYAN}2. Authentication Tests${NC}"
    echo -e "${CYAN}3. Course Management Tests${NC}"
    echo -e "${CYAN}4. Session Management Tests${NC}"
    echo -e "${CYAN}5. Attendance Marking Tests (GPS Only)${NC}"
    echo -e "${CYAN}6. WebSocket Real-time Tests${NC}"
    echo -e "${CYAN}7. Full Workflow Test${NC}"
    echo -e "${CYAN}8. Get Seeded Data IDs${NC}"
    echo -e "${CYAN}9. Show Current Tokens & IDs${NC}"
    echo -e "${CYAN}0. Exit${NC}"
    echo ""
    echo -n "Select an option: "
}

# Service health checks
test_service_health() {
    clear
    echo -e "${BLUE}=== SERVICE HEALTH CHECKS ===${NC}"
    
    echo -e "\n${YELLOW}Checking Auth Service (Port 3001)...${NC}"
    if curl -s http://localhost:3001/health | jq . 2>/dev/null; then
        echo -e "${GREEN}✓ Auth Service: Running${NC}"
    else
        echo -e "${RED}✗ Auth Service: Not responding${NC}"
    fi
    
    echo -e "\n${YELLOW}Checking Attendance Service (Port 3002)...${NC}"
    if curl -s http://localhost:3002/health | jq . 2>/dev/null; then
        echo -e "${GREEN}✓ Attendance Service: Running${NC}"
    else
        echo -e "${RED}✗ Attendance Service: Not responding${NC}"
    fi
    
    echo -e "\n${YELLOW}Checking Realtime Service (Port 3003)...${NC}"
    echo "Open http://localhost:3003 in browser to check Socket.io status"
    
    echo -e "\nPress any key to continue..."
    read -n 1
}

# Authentication tests
test_authentication() {
    clear
    echo -e "${BLUE}=== AUTHENTICATION TESTS ===${NC}"
    
    echo -e "\n${CYAN}1. Sign in as Instructor${NC}"
    echo -e "${CYAN}2. Sign in as Student${NC}"
    echo -e "${CYAN}3. Sign in as Admin${NC}"
    echo -e "${CYAN}4. Test Sign up (new user)${NC}"
    echo -e "${CYAN}5. Get User Profile${NC}"
    echo -e "${CYAN}0. Back to Main Menu${NC}"
    
    echo -n "Select option: "
    read choice
    
    case $choice in
        1)
            echo -e "\n${YELLOW}Signing in as Instructor...${NC}"
            RESPONSE=$(curl -s -X POST $AUTH_API/signin \
                -H "Content-Type: application/json" \
                -d '{"email":"instructor@attendance.com","password":"Instructor@123"}')
            if [[ $? -eq 0 ]]; then
                INSTRUCTOR_TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')
                echo -e "${GREEN}✓ Instructor signed in successfully!${NC}"
                echo -e "${YELLOW}Token saved to INSTRUCTOR_TOKEN${NC}"
                echo $RESPONSE | jq '.data.user'
            else
                echo -e "${RED}Failed to sign in${NC}"
            fi
            ;;
        2)
            echo -e "\n${YELLOW}Signing in as Student...${NC}"
            RESPONSE=$(curl -s -X POST $AUTH_API/signin \
                -H "Content-Type: application/json" \
                -d '{"email":"student1@attendance.com","password":"Student@123"}')
            if [[ $? -eq 0 ]]; then
                STUDENT_TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')
                echo -e "${GREEN}✓ Student signed in successfully!${NC}"
                echo -e "${YELLOW}Token saved to STUDENT_TOKEN${NC}"
                echo $RESPONSE | jq '.data.user'
            else
                echo -e "${RED}Failed to sign in${NC}"
            fi
            ;;
        3)
            echo -e "\n${YELLOW}Signing in as Admin...${NC}"
            RESPONSE=$(curl -s -X POST $AUTH_API/signin \
                -H "Content-Type: application/json" \
                -d '{"email":"admin@attendance.com","password":"Admin@123"}')
            if [[ $? -eq 0 ]]; then
                ADMIN_TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')
                echo -e "${GREEN}✓ Admin signed in successfully!${NC}"
                echo -e "${YELLOW}Token saved to ADMIN_TOKEN${NC}"
                echo $RESPONSE | jq '.data.user'
            else
                echo -e "${RED}Failed to sign in${NC}"
            fi
            ;;
        4)
            echo -e "\n${YELLOW}Creating new user...${NC}"
            echo -n "Enter email: "
            read email
            echo -n "Enter password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special): "
            read -s password
            echo
            
            RESPONSE=$(curl -s -X POST $AUTH_API/signup \
                -H "Content-Type: application/json" \
                -d "{\"email\":\"$email\",\"password\":\"$password\",\"confirmPassword\":\"$password\",\"firstName\":\"Test\",\"lastName\":\"User\",\"phoneNumber\":\"+1234567890\"}")
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ User created successfully!${NC}"
                echo $RESPONSE | jq .
            else
                echo -e "${RED}Failed to create user${NC}"
            fi
            ;;
        5)
            if [[ -n "$INSTRUCTOR_TOKEN" || -n "$STUDENT_TOKEN" ]]; then
                TOKEN=${INSTRUCTOR_TOKEN:-$STUDENT_TOKEN}
                RESPONSE=$(curl -s -X GET $AUTH_API/profile \
                    -H "Authorization: Bearer $TOKEN")
                if [[ $? -eq 0 ]]; then
                    echo -e "${GREEN}✓ Profile retrieved!${NC}"
                    echo $RESPONSE | jq '.data'
                else
                    echo -e "${RED}Failed to get profile${NC}"
                fi
            else
                echo -e "${RED}Please sign in first!${NC}"
            fi
            ;;
    esac
    
    if [[ $choice != "0" ]]; then
        echo -e "\nPress any key to continue..."
        read -n 1
    fi
}

# Course management tests
test_course_management() {
    clear
    echo -e "${BLUE}=== COURSE MANAGEMENT TESTS ===${NC}"
    
    echo -e "\n${CYAN}1. Get All Courses${NC}"
    echo -e "${CYAN}2. Create New Course (Instructor)${NC}"
    echo -e "${CYAN}3. Get Course by ID${NC}"
    echo -e "${CYAN}4. Join Course (Student) - Using Code${NC}"
    echo -e "${CYAN}0. Back to Main Menu${NC}"
    
    echo -n "Select option: "
    read choice
    
    case $choice in
        1)
            if [[ -z "$INSTRUCTOR_TOKEN" ]]; then
                echo -e "${RED}Please sign in as instructor first!${NC}"
                return
            fi
            
            RESPONSE=$(curl -s -X GET $ATTENDANCE_API/courses \
                -H "Authorization: Bearer $INSTRUCTOR_TOKEN")
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ Courses retrieved!${NC}"
                COURSE_ID=$(echo $RESPONSE | jq -r '.data[0].id')
                echo -e "${YELLOW}First course ID saved to COURSE_ID${NC}"
                echo $RESPONSE | jq '.data[]' | while read -r line; do
                    echo -e "\n------------------------"
                    echo $line | jq -r '"ID: " + .id'
                    echo $line | jq -r '"Name: " + .name'
                    echo $line | jq -r '"Code: " + .code'
                    echo $line | jq -r '"Owner: " + .owner.firstName + " " + .owner.lastName'
                done
            else
                echo -e "${RED}Failed to get courses${NC}"
            fi
            ;;
        2)
            if [[ -z "$INSTRUCTOR_TOKEN" ]]; then
                echo -e "${RED}Please sign in as instructor first!${NC}"
                return
            fi
            
            echo -n "Enter course name: "
            read course_name
            
            START_DATE=$(date -d "+1 day" '+%Y-%m-%d')
            END_DATE=$(date -d "+3 months" '+%Y-%m-%d')
            
            RESPONSE=$(curl -s -X POST $ATTENDANCE_API/courses \
                -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"name\": \"$course_name\",
                    \"description\": \"Test course created via Test Hub\",
                    \"startDate\": \"$START_DATE\",
                    \"endDate\": \"$END_DATE\",
                    \"settings\": {
                        \"gpsRadius\": 100,
                        \"allowLateEntry\": true,
                        \"lateEntryMinutes\": 15,
                        \"requireSelfie\": false
                    }
                }")
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ Course created!${NC}"
                COURSE_CODE=$(echo $RESPONSE | jq -r '.data.code')
                COURSE_ID=$(echo $RESPONSE | jq -r '.data.id')
                echo -e "${YELLOW}Course Code: $COURSE_CODE${NC}"
                echo -e "${GREEN}Students can join using this code!${NC}"
                echo -e "${YELLOW}Course ID saved to COURSE_ID${NC}"
            else
                echo -e "${RED}Failed to create course${NC}"
            fi
            ;;
        4)
            if [[ -z "$STUDENT_TOKEN" ]]; then
                echo -e "${RED}Please sign in as student first!${NC}"
                return
            fi
            
            echo -n "Enter course code (e.g., CS101XXXX): "
            read code
            
            RESPONSE=$(curl -s -X POST $ATTENDANCE_API/courses/join \
                -H "Authorization: Bearer $STUDENT_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{\"code\": \"$code\"}")
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ Successfully joined course!${NC}"
                echo $RESPONSE | jq '.data'
            else
                echo -e "${RED}Failed to join course${NC}"
            fi
            ;;
    esac
    
    if [[ $choice != "0" ]]; then
        echo -e "\nPress any key to continue..."
        read -n 1
    fi
}

# Session management tests
test_session_management() {
    clear
    echo -e "${BLUE}=== SESSION MANAGEMENT TESTS ===${NC}"
    
    echo -e "\n${CYAN}1. Get Active Sessions${NC}"
    echo -e "${CYAN}2. Create New Session (Instructor)${NC}"
    echo -e "${CYAN}3. Start Session (Instructor)${NC}"
    echo -e "${CYAN}4. End Session (Instructor)${NC}"
    echo -e "${CYAN}0. Back to Main Menu${NC}"
    
    echo -n "Select option: "
    read choice
    
    case $choice in
        1)
            TOKEN=${INSTRUCTOR_TOKEN:-$STUDENT_TOKEN}
            if [[ -z "$TOKEN" ]]; then
                echo -e "${RED}Please sign in first!${NC}"
                return
            fi
            
            RESPONSE=$(curl -s -X GET $ATTENDANCE_API/sessions/active \
                -H "Authorization: Bearer $TOKEN")
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ Active sessions retrieved!${NC}"
                echo $RESPONSE | jq '.data'
            else
                echo -e "${RED}Failed to get active sessions${NC}"
            fi
            ;;
        2)
            if [[ -z "$INSTRUCTOR_TOKEN" ]]; then
                echo -e "${RED}Please sign in as instructor first!${NC}"
                return
            fi
            
            if [[ -z "$COURSE_ID" ]]; then
                echo -n "Enter Course ID: "
                read COURSE_ID
            fi
            
            echo -n "Enter session name: "
            read session_name
            
            START_TIME=$(date -u -d "+5 minutes" '+%Y-%m-%dT%H:%M:%SZ')
            END_TIME=$(date -u -d "+2 hours" '+%Y-%m-%dT%H:%M:%SZ')
            
            RESPONSE=$(curl -s -X POST $ATTENDANCE_API/sessions \
                -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"courseId\": \"$COURSE_ID\",
                    \"name\": \"$session_name\",
                    \"description\": \"Test session from Test Hub\",
                    \"startTime\": \"$START_TIME\",
                    \"endTime\": \"$END_TIME\",
                    \"latitude\": 37.7749,
                    \"longitude\": -122.4194,
                    \"radiusMeters\": 100,
                    \"locationName\": \"Test Location\",
                    \"allowLateEntry\": true,
                    \"lateMinutes\": 15,
                    \"requireSelfie\": false
                }")
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ Session created!${NC}"
                SESSION_ID=$(echo $RESPONSE | jq -r '.data.id')
                echo -e "${YELLOW}Session ID: $SESSION_ID${NC}"
                echo -e "${YELLOW}Location: 37.7749, -122.4194${NC}"
                echo -e "${YELLOW}GPS Radius: 100 meters${NC}"
                echo -e "${GREEN}NO ACCESS CODE NEEDED - GPS Verification Only!${NC}"
                echo -e "${YELLOW}Session ID saved to SESSION_ID${NC}"
            else
                echo -e "${RED}Failed to create session${NC}"
            fi
            ;;
        3)
            if [[ -z "$INSTRUCTOR_TOKEN" ]]; then
                echo -e "${RED}Please sign in as instructor first!${NC}"
                return
            fi
            
            if [[ -z "$SESSION_ID" ]]; then
                echo -n "Enter Session ID: "
                read SESSION_ID
            fi
            
            RESPONSE=$(curl -s -X POST $ATTENDANCE_API/sessions/$SESSION_ID/start \
                -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
                -H "Content-Type: application/json" \
                -d '{}')
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ Session started!${NC}"
                echo -e "${GREEN}Students can now mark attendance using GPS verification${NC}"
                echo -e "${YELLOW}💡 Real-time events will be broadcast to WebSocket clients:${NC}"
                echo -e "${CYAN}   - session:started event sent to course room${NC}"
                echo -e "${CYAN}   - Use WebSocket test panel to monitor events${NC}"
                echo $RESPONSE | jq '.data'
            else
                echo -e "${RED}Failed to start session${NC}"
            fi
            ;;
    esac
    
    if [[ $choice != "0" ]]; then
        echo -e "\nPress any key to continue..."
        read -n 1
    fi
}

# Attendance tests
test_attendance() {
    clear
    echo -e "${BLUE}=== ATTENDANCE MARKING TESTS (GPS ONLY) ===${NC}"
    echo -e "${YELLOW}Note: No access codes required - GPS verification only!${NC}"
    
    echo -e "\n${CYAN}1. Mark Attendance - Within GPS Range (Should Succeed + Trigger Real-time Event)${NC}"
    echo -e "${CYAN}2. Mark Attendance - Outside GPS Range (Should Fail)${NC}"
    echo -e "${CYAN}3. Get Session Attendance Report${NC}"
    echo -e "${CYAN}0. Back to Main Menu${NC}"
    
    echo -n "Select option: "
    read choice
    
    case $choice in
        1)
            if [[ -z "$STUDENT_TOKEN" ]]; then
                echo -e "${RED}Please sign in as student first!${NC}"
                return
            fi
            
            if [[ -z "$SESSION_ID" ]]; then
                echo -n "Enter Active Session ID: "
                read SESSION_ID
            fi
            
            echo -e "${YELLOW}Marking attendance with GPS coordinates within range...${NC}"
            RESPONSE=$(curl -s -X POST $ATTENDANCE_API/attendance/mark \
                -H "Authorization: Bearer $STUDENT_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"sessionId\": \"$SESSION_ID\",
                    \"latitude\": 37.7749,
                    \"longitude\": -122.4194,
                    \"deviceInfo\": {
                        \"platform\": \"linux\",
                        \"model\": \"Desktop\",
                        \"osVersion\": \"Ubuntu 22.04\",
                        \"appVersion\": \"1.0.0\"
                    }
                }")
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ Attendance marked successfully!${NC}"
                STATUS=$(echo $RESPONSE | jq -r '.data.status')
                DISTANCE=$(echo $RESPONSE | jq -r '.data.distanceFromSession')
                echo -e "${YELLOW}Status: $STATUS${NC}"
                echo -e "${YELLOW}Distance from session: $DISTANCE meters${NC}"
                echo ""
                echo -e "${GREEN}🔄 Real-time Event Triggered!${NC}"
                echo -e "${CYAN}   • Check WebSocket panel for 'attendance:update' event${NC}"
                echo -e "${CYAN}   • Instructors monitoring this session will see instant notification${NC}"
                echo -e "${CYAN}   • Event includes user name, status, distance, and timestamp${NC}"
            else
                echo -e "${RED}Failed to mark attendance${NC}"
            fi
            ;;
        2)
            if [[ -z "$STUDENT_TOKEN" ]]; then
                echo -e "${RED}Please sign in as student first!${NC}"
                return
            fi
            
            if [[ -z "$SESSION_ID" ]]; then
                echo -n "Enter Active Session ID: "
                read SESSION_ID
            fi
            
            echo -e "${YELLOW}Attempting to mark attendance from outside GPS range...${NC}"
            RESPONSE=$(curl -s -X POST $ATTENDANCE_API/attendance/mark \
                -H "Authorization: Bearer $STUDENT_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"sessionId\": \"$SESSION_ID\",
                    \"latitude\": 37.8000,
                    \"longitude\": -122.4500,
                    \"deviceInfo\": {
                        \"platform\": \"linux\",
                        \"model\": \"Desktop\",
                        \"osVersion\": \"Ubuntu 22.04\",
                        \"appVersion\": \"1.0.0\"
                    }
                }")
            if [[ $? -eq 0 ]]; then
                echo -e "${RED}Unexpected success - should have failed!${NC}"
            else
                echo -e "${GREEN}✓ Correctly rejected - outside GPS range!${NC}"
                echo -e "${YELLOW}This is expected behavior - students must be within GPS range${NC}"
            fi
            ;;
        3)
            if [[ -z "$INSTRUCTOR_TOKEN" ]]; then
                echo -e "${RED}Please sign in as instructor first!${NC}"
                return
            fi
            
            if [[ -z "$SESSION_ID" ]]; then
                echo -n "Enter Session ID: "
                read SESSION_ID
            fi
            
            RESPONSE=$(curl -s -X GET $ATTENDANCE_API/attendance/session/$SESSION_ID \
                -H "Authorization: Bearer $INSTRUCTOR_TOKEN")
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✓ Attendance report retrieved!${NC}"
                echo -e "\n${YELLOW}Attendance Statistics:${NC}"
                echo $RESPONSE | jq -r '.data.stats | "Total Students: " + (.total | tostring)'
                echo $RESPONSE | jq -r '.data.stats | "Present: " + (.present | tostring)'
                echo $RESPONSE | jq -r '.data.stats | "Late: " + (.late | tostring)'
                echo $RESPONSE | jq -r '.data.stats | "Absent: " + (.absent | tostring)'
            else
                echo -e "${RED}Failed to get attendance report${NC}"
            fi
            ;;
    esac
    
    if [[ $choice != "0" ]]; then
        echo -e "\nPress any key to continue..."
        read -n 1
    fi
}

# WebSocket tests
test_websocket() {
    clear
    echo -e "${BLUE}=== WEBSOCKET REAL-TIME TESTS ===${NC}"
    
    echo -e "\n${YELLOW}To test WebSocket connections:${NC}"
    echo -e "1. Copy the realtime service test file path:"
    echo -e "${CYAN}   $(pwd)/services/realtime-service/test-websocket.html${NC}"
    echo -e "2. Open it in your browser (file:// protocol)"
    echo -e "3. Use these tokens to connect:"
    
    if [[ -n "$INSTRUCTOR_TOKEN" ]]; then
        echo -e "\n${GREEN}Instructor Token:${NC}"
        echo "$INSTRUCTOR_TOKEN"
    fi
    if [[ -n "$STUDENT_TOKEN" ]]; then
        echo -e "\n${GREEN}Student Token:${NC}"
        echo "$STUDENT_TOKEN"
    fi
    
    if [[ -n "$COURSE_ID" ]]; then
        echo -e "\n${YELLOW}Course ID to test:${NC}"
        echo "$COURSE_ID"
    fi
    if [[ -n "$SESSION_ID" ]]; then
        echo -e "\n${YELLOW}Session ID to test:${NC}"
        echo "$SESSION_ID"
    fi
    
    echo -e "\n${BLUE}🔧 WebSocket Test Instructions:${NC}"
    echo -e "${NC}   • Paste JWT token in auth field and click 'Save'${NC}"
    echo -e "${NC}   • Click 'Connect' to establish WebSocket connection${NC}"
    echo -e "${NC}   • Use Course ID and Session ID from this test hub${NC}"
    echo -e "${NC}   • Click 'Join Course Room' to monitor course events${NC}"
    echo -e "${NC}   • Start session here (option 4) and watch real-time notifications${NC}"
    echo -e "${NC}   • Mark attendance via API (option 5) and watch real-time updates${NC}"
    echo -e "${NC}   • All events show in real-time log with timestamps${NC}"
    
    echo -e "\nPress any key to continue..."
    read -n 1
}

# Full workflow test
test_full_workflow() {
    clear
    echo -e "${BLUE}=== FULL WORKFLOW TEST ===${NC}"
    echo -e "${YELLOW}Testing complete attendance flow...${NC}"
    
    # Step 1: Sign in as instructor
    echo -e "\n${YELLOW}[Step 1] Signing in as Instructor...${NC}"
    RESPONSE=$(curl -s -X POST $AUTH_API/signin \
        -H "Content-Type: application/json" \
        -d '{"email":"instructor@attendance.com","password":"Instructor@123"}')
    INSTRUCTOR_TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')
    echo -e "${GREEN}✓ Instructor logged in${NC}"
    
    # Step 2: Get courses
    echo -e "\n${YELLOW}[Step 2] Getting instructor's courses...${NC}"
    RESPONSE=$(curl -s -X GET $ATTENDANCE_API/courses \
        -H "Authorization: Bearer $INSTRUCTOR_TOKEN")
    COURSE_ID=$(echo $RESPONSE | jq -r '.data[0].id')
    COURSE_NAME=$(echo $RESPONSE | jq -r '.data[0].name')
    echo -e "${GREEN}✓ Using course: $COURSE_NAME${NC}"
    
    # Step 3: Create session
    echo -e "\n${YELLOW}[Step 3] Creating new session...${NC}"
    START_TIME=$(date -u -d "+1 minute" '+%Y-%m-%dT%H:%M:%SZ')
    END_TIME=$(date -u -d "+2 hours" '+%Y-%m-%dT%H:%M:%SZ')
    
    RESPONSE=$(curl -s -X POST $ATTENDANCE_API/sessions \
        -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"courseId\": \"$COURSE_ID\",
            \"name\": \"Automated Test Session $(date '+%H:%M')\",
            \"description\": \"Full workflow test\",
            \"startTime\": \"$START_TIME\",
            \"endTime\": \"$END_TIME\",
            \"latitude\": 37.7749,
            \"longitude\": -122.4194,
            \"radiusMeters\": 100,
            \"locationName\": \"Test Hub Location\"
        }")
    SESSION_ID=$(echo $RESPONSE | jq -r '.data.id')
    echo -e "${GREEN}✓ Session created (GPS verification only, no access code)${NC}"
    
    # Step 4: Start session
    echo -e "\n${YELLOW}[Step 4] Starting session...${NC}"
    sleep 2
    curl -s -X POST $ATTENDANCE_API/sessions/$SESSION_ID/start \
        -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{}' > /dev/null
    echo -e "${GREEN}✓ Session is now active${NC}"
    
    # Step 5: Sign in as student
    echo -e "\n${YELLOW}[Step 5] Signing in as Student...${NC}"
    RESPONSE=$(curl -s -X POST $AUTH_API/signin \
        -H "Content-Type: application/json" \
        -d '{"email":"student1@attendance.com","password":"Student@123"}')
    STUDENT_TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')
    echo -e "${GREEN}✓ Student logged in${NC}"
    
    # Step 6: Mark attendance
    echo -e "\n${YELLOW}[Step 6] Student marking attendance (within GPS range)...${NC}"
    RESPONSE=$(curl -s -X POST $ATTENDANCE_API/attendance/mark \
        -H "Authorization: Bearer $STUDENT_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"sessionId\": \"$SESSION_ID\",
            \"latitude\": 37.7749,
            \"longitude\": -122.4194,
            \"deviceInfo\": {
                \"platform\": \"test\",
                \"model\": \"TestHub\",
                \"osVersion\": \"Linux\",
                \"appVersion\": \"1.0.0\"
            }
        }")
    STATUS=$(echo $RESPONSE | jq -r '.data.status')
    DISTANCE=$(echo $RESPONSE | jq -r '.data.distanceInMeters')
    echo -e "${GREEN}✓ Attendance marked: $STATUS${NC}"
    echo -e "${YELLOW}Distance from session: ${DISTANCE} meters${NC}"
    
    # Step 7: Get attendance report
    echo -e "\n${YELLOW}[Step 7] Getting attendance report...${NC}"
    RESPONSE=$(curl -s -X GET $ATTENDANCE_API/attendance/session/$SESSION_ID \
        -H "Authorization: Bearer $INSTRUCTOR_TOKEN")
    PRESENT=$(echo $RESPONSE | jq -r '.data.stats.present')
    LATE=$(echo $RESPONSE | jq -r '.data.stats.late')
    ABSENT=$(echo $RESPONSE | jq -r '.data.stats.absent')
    echo -e "${GREEN}✓ Attendance report retrieved${NC}"
    echo -e "${YELLOW}Present: $PRESENT, Late: $LATE, Absent: $ABSENT${NC}"
    
    echo -e "\n${GREEN}✅ Full workflow test completed successfully!${NC}"
    
    echo -e "\nPress any key to continue..."
    read -n 1
}

# Get seeded data
get_seeded_data() {
    clear
    echo -e "${BLUE}=== GETTING SEEDED DATA IDS ===${NC}"
    
    # Sign in as instructor to get data
    echo -e "\n${YELLOW}Signing in to retrieve seeded data...${NC}"
    RESPONSE=$(curl -s -X POST $AUTH_API/signin \
        -H "Content-Type: application/json" \
        -d '{"email":"instructor@attendance.com","password":"Instructor@123"}')
    TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')
    
    # Get courses
    echo -e "\n${YELLOW}Fetching courses...${NC}"
    RESPONSE=$(curl -s -X GET $ATTENDANCE_API/courses \
        -H "Authorization: Bearer $TOKEN")
    
    echo -e "\n${GREEN}=== SEEDED COURSES ===${NC}"
    echo $RESPONSE | jq -c '.data[]' | while IFS= read -r course; do
        echo -e "\n${YELLOW}Course Name: $(echo $course | jq -r '.name')${NC}"
        echo "Course ID: $(echo $course | jq -r '.id')"
        echo -e "${CYAN}Course Code: $(echo $course | jq -r '.code')${NC}"
        echo "Members: $(echo $course | jq -r '._count.members')"
    done
    
    COURSE_ID=$(echo $RESPONSE | jq -r '.data[0].id')
    echo -e "\n${YELLOW}Note: Course codes are needed for students to join courses${NC}"
    
    echo -e "\nPress any key to continue..."
    read -n 1
}

# Show current tokens
show_current_tokens() {
    clear
    echo -e "${BLUE}=== CURRENT TOKENS & IDS ===${NC}"
    
    if [[ -n "$INSTRUCTOR_TOKEN" ]]; then
        echo -e "\n${GREEN}Instructor Token (truncated):${NC}"
        echo "${INSTRUCTOR_TOKEN:0:50}..."
    else
        echo -e "\n${RED}Instructor Token: Not set${NC}"
    fi
    
    if [[ -n "$STUDENT_TOKEN" ]]; then
        echo -e "\n${GREEN}Student Token (truncated):${NC}"
        echo "${STUDENT_TOKEN:0:50}..."
    else
        echo -e "\n${RED}Student Token: Not set${NC}"
    fi
    
    if [[ -n "$ADMIN_TOKEN" ]]; then
        echo -e "\n${GREEN}Admin Token (truncated):${NC}"
        echo "${ADMIN_TOKEN:0:50}..."
    else
        echo -e "\n${RED}Admin Token: Not set${NC}"
    fi
    
    echo -e "\n${BLUE}=== CURRENT IDS ===${NC}"
    if [[ -n "$COURSE_ID" ]]; then
        echo -e "${GREEN}Course ID: $COURSE_ID${NC}"
    else
        echo -e "${RED}Course ID: Not set${NC}"
    fi
    
    if [[ -n "$SESSION_ID" ]]; then
        echo -e "${GREEN}Session ID: $SESSION_ID${NC}"
    else
        echo -e "${RED}Session ID: Not set${NC}"
    fi
    
    echo -e "\nPress any key to continue..."
    read -n 1
}

# Main loop
while true; do
    show_main_menu
    read choice
    
    case $choice in
        1) test_service_health ;;
        2) test_authentication ;;
        3) test_course_management ;;
        4) test_session_management ;;
        5) test_attendance ;;
        6) test_websocket ;;
        7) test_full_workflow ;;
        8) get_seeded_data ;;
        9) show_current_tokens ;;
        0) 
            echo -e "\n${YELLOW}Exiting Test Hub...${NC}"
            exit 0
            ;;
        *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
    esac
done
