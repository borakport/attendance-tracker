#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001/api/v1/auth"

echo -e "${BLUE}Testing Auth Service API${NC}"
echo "========================="

# Test Health Check
echo -e "\n${GREEN}1. Testing Health Check...${NC}"
curl -s http://localhost:3001/health | json_pp

# Test Signin with Student Account
echo -e "\n${GREEN}2. Testing Signin with Student Account...${NC}"
RESPONSE=$(curl -s -X POST $API_URL/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@attendance.com",
    "password": "Student@123"
  }')

echo "$RESPONSE" | json_pp

# Extract tokens from response (requires jq)
if command -v jq &> /dev/null; then
  ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.tokens.accessToken')
  REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.data.tokens.refreshToken')
  
  if [ "$ACCESS_TOKEN" != "null" ]; then
    echo -e "\n${GREEN}3. Testing Get Profile...${NC}"
    curl -s -X GET $API_URL/profile \
      -H "Authorization: Bearer $ACCESS_TOKEN" | json_pp
  fi
else
  echo -e "\nInstall jq for automatic token extraction: apt-get install jq"
fi

echo -e "\n${BLUE}Testing Complete!${NC}"
