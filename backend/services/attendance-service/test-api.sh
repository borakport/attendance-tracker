#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

AUTH_API="http://localhost:3001/api/v1/auth"
API_URL="http://localhost:3002/api/v1"

echo -e "${BLUE}Testing Attendance Service API${NC}"
echo "=============================="

# Step 1: Get Instructor Token
echo -e "\n${GREEN}1. Getting Instructor Auth Token...${NC}"
INSTRUCTOR_RESPONSE=$(curl -s -X POST $AUTH_API/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@attendance.com",
    "password": "Instructor@123"
  }')

INSTRUCTOR_TOKEN=$(echo "$INSTRUCTOR_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo -e "${YELLOW}Instructor token obtained!${NC}"

# Step 2: Get Student Token
echo -e "\n${GREEN}2. Getting Student Auth Token...${NC}"
STUDENT_RESPONSE=$(curl -s -X POST $AUTH_API/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@attendance.com",
    "password": "Student@123"
  }')

STUDENT_TOKEN=$(echo "$STUDENT_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo -e "${YELLOW}Student token obtained!${NC}"

# Step 3: Test Health Check
echo -e "\n${GREEN}3. Testing Health Check...${NC}"
curl -s http://localhost:3002/health | json_pp

# Step 4: Get Courses
echo -e "\n${GREEN}4. Getting Instructor's Courses...${NC}"
curl -s -X GET $API_URL/courses \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" | json_pp

# Step 5: Get Active Sessions
echo -e "\n${GREEN}5. Getting Active Sessions...${NC}"
curl -s -X GET $API_URL/sessions/active \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" | json_pp

echo -e "\n${BLUE}Test Complete!${NC}"
