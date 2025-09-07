#!/usr/bin/env bash

# Test script for admin endpoints
# Make sure both auth-service and attendance-service are running

BASE_URL_AUTH="http://localhost:3001/api/auth"
BASE_URL_ATTENDANCE="http://localhost:3002/api/attendance"

echo "Testing Admin Endpoints..."
echo "=========================="

# First, get an admin token (you'll need to replace with actual admin credentials)
echo "1. Login as admin to get token..."
RESPONSE=$(curl -s -X POST "$BASE_URL_AUTH/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "Login response: $RESPONSE"

# Extract token (this will need to be adjusted based on your actual response format)
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo "Failed to get authentication token. Please check admin credentials."
  exit 1
fi

echo "Token: $TOKEN"
echo ""

# Test Auth Service Admin Endpoints
echo "2. Testing Auth Service Admin Endpoints..."
echo "==========================================="

echo "2.1. Get user statistics..."
curl -s -X GET "$BASE_URL_AUTH/admin/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "2.2. Get all users..."
curl -s -X GET "$BASE_URL_AUTH/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""

# Test Attendance Service Admin Endpoints
echo "3. Testing Attendance Service Admin Endpoints..."
echo "================================================"

echo "3.1. Get dashboard statistics..."
curl -s -X GET "$BASE_URL_ATTENDANCE/admin/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "3.2. Get all courses..."
curl -s -X GET "$BASE_URL_ATTENDANCE/admin/courses?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "3.3. Get all sessions..."
curl -s -X GET "$BASE_URL_ATTENDANCE/admin/sessions?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "Admin endpoints testing completed!"
