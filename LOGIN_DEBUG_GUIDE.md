# 🔍 Login Debug Guide

## Issue: Login Successful but User Profile Fails to Load

If login succeeds but user profile fails to load, follow these steps:

### Step 1: Check Console Logs

Look for these log messages in your React Native console:

1. **Login Phase:**
   - `🔐 Starting login request...`
   - `🌐 API Request: POST https://api-ma5t57vzsq-ew.a.run.app/auth/login`
   - `📥 Response status: 200`
   - `✅ Token found in response.token`
   - `🔑 Storing authentication token`

2. **Profile Fetch Phase:**
   - `🔍 Fetching user profile...`
   - `🔑 Token available, length: XXX`
   - `📡 Trying GET /auth/me...`
   - `🌐 API Request: GET https://api-ma5t57vzsq-ew.a.run.app/auth/me`
   - `📥 Response status: XXX`

### Step 2: Common Issues

#### Issue 1: Token Not Stored
**Symptoms:**
- Login succeeds but token is not stored
- Error: "No authentication token available"

**Solution:**
- Check if token is in login response
- Verify token storage function is called

#### Issue 2: Token Not Sent
**Symptoms:**
- Token is stored but not sent with /auth/me request
- Error: "Unauthorized" or 401 status

**Solution:**
- Verify Authorization header is set
- Check token is retrieved before API call

#### Issue 3: Wrong Endpoint
**Symptoms:**
- 404 error on /auth/me
- Error: "Not Found"

**Solution:**
- Check if endpoint path is correct
- Verify API base URL is correct

#### Issue 4: Response Format Mismatch
**Symptoms:**
- 200 status but no user data
- Error: "User data not found in response"

**Solution:**
- Check actual API response format
- Verify user data location in response

### Step 3: Debug Steps

1. **Enable Detailed Logging:**
   - All API requests/responses are logged
   - Check console for detailed error messages

2. **Check API Response:**
   - Look for `📥 Response preview` in logs
   - Verify JSON structure matches expectations

3. **Verify Token:**
   - Token should be stored after login
   - Token should be sent with Authorization header
   - Token format: `Bearer <token>`

### Step 4: Test API Directly

Test the endpoints directly:

```bash
# Test Login
curl -X POST https://api-ma5t57vzsq-ew.a.run.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test Get Profile (replace TOKEN with actual token)
curl -X GET https://api-ma5t57vzsq-ew.a.run.app/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Step 5: Check Error Messages

The app now shows detailed error messages via Alert:
- Check Alert popups for specific error details
- Error messages include status codes and error descriptions

