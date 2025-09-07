# Automatic Token Refresh Test Guide

## What's Implemented

### 🔄 Automatic Token Refresh
- When an API request receives a 401 (Unauthorized) response
- The API service automatically attempts to refresh the access token
- If successful, it retries the original request transparently
- Multiple concurrent requests are queued and all retry with the new token

### ⏰ Token Expiry Handling
- **Access Token (1 hour)**: Automatically refreshed in background
- **Refresh Token (7 days)**: When expired, user is automatically logged out

### 🔐 Enhanced Security
- No more "Token expired" error messages for users
- Seamless experience when access token expires
- Automatic logout when refresh token expires (7 days)
- Redux state properly updated on logout

## How to Test

### Test 1: Normal Operation
1. Login as lecturer
2. Create a session - should work normally
3. Use the app for a while - token refresh happens transparently

### Test 2: Simulate Token Expiry
1. Login as lecturer
2. In browser dev tools, go to: http://localhost:3001/health
3. Wait for access token to expire (or manually expire it in backend)
4. Try to create a session
5. **Expected**: Session creation succeeds (token refreshed automatically)
6. **Should NOT see**: "Token expired" error message

### Test 3: Refresh Token Expiry
1. Login as lecturer
2. Manually expire both access and refresh tokens in backend
3. Try to create a session
4. **Expected**: 
   - User automatically logged out
   - Redirected to login screen
   - Toast message: "Session Expired - Please login again to continue"

## Implementation Details

### API Service Improvements
- Enhanced response interceptor with proper error handling
- Queue system for concurrent requests during token refresh
- Better error messages and logging
- Automatic Redux state updates on logout

### Files Modified
- `mobile/src/services/api.service.ts`: Enhanced token refresh logic
- `mobile/src/store/slices/authSlice.ts`: Added synchronous logout action
- `mobile/App.tsx`: Set up navigation and store references

### Benefits
- ✅ No more token expired interruptions
- ✅ Seamless user experience
- ✅ Proper session management
- ✅ Enhanced security with automatic logout after 7 days
- ✅ Better error handling and logging
