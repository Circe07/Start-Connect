# API Setup Guide

This guide explains how to connect the app to the StartAndConnect REST API endpoints.

## Configuration

### 1. Set API Base URL

Open `src/config/api.ts` and update the `BASE_URL` to match your API server:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-actual-api-url.com', // Update this!
  TIMEOUT: 30000,
};
```

**Examples:**
- Local development: `'http://localhost:3000'`
- Production: `'https://api.startandconnect.com'`
- Firebase Cloud Functions: `'https://us-central1-startandconnect-c44b2.cloudfunctions.net'`

### 2. API Endpoints Implemented

The following endpoints are now integrated:

#### Authentication

- **POST /auth/register** - User registration
  - Used in: `SignUpScreen.tsx`
  - Payload: `{ email, password, username, ...additional fields }`

- **POST /auth/login** - User login
  - Used in: `LoginScreen.tsx`
  - Payload: `{ email, password }`
  - Returns: `{ success, token, user }`

- **POST /auth/logout** - User logout
  - Available via: `logoutUser()` from `src/services/api.ts`

- **GET /auth/me** - Get current user profile
  - Used in: `LoginScreen.tsx` (after login)
  - Returns: `{ success, user }`

- **POST /auth/change-password** - Change password
  - Available via: `changePassword()` from `src/services/api.ts`

## Files Modified

### New Files
- `src/config/api.ts` - API configuration (BASE_URL, timeout)
- `src/services/api.ts` - API service with all endpoint functions

### Updated Files
- `src/screens/LoginScreen.tsx` - Now uses `loginUser()` API endpoint
- `src/screens/SignUpScreen.tsx` - Now uses `registerUser()` API endpoint

## How It Works

### Registration Flow
1. User fills out the signup form
2. `SignUpScreen` calls `registerUser()` from `src/services/api.ts`
3. API returns token and user data
4. Token is stored (in-memory for now)
5. User is redirected to Login screen

### Login Flow
1. User enters email and password
2. `LoginScreen` calls `loginUser()` from `src/services/api.ts`
3. API returns token
4. Token is stored
5. `getCurrentUser()` is called to fetch user profile
6. User is redirected to Home screen

## Token Storage

Currently, tokens are stored in-memory only. For production, you should:

1. Install AsyncStorage:
   ```bash
   npm install @react-native-async-storage/async-storage
   ```

2. Update `src/services/api.ts` to use AsyncStorage (see TODO comments in the file)

## Testing

### Test Registration
1. Navigate to Sign Up screen
2. Fill in the form (at minimum: name, first surname, email, password)
3. Submit the form
4. Check console logs for API requests/responses

### Test Login
1. Navigate to Login screen
2. Enter email and password from a registered user
3. Click Sign In
4. Check console logs for API requests/responses

## Troubleshooting

### "Network error" or "Failed to connect"
- Check that `BASE_URL` in `src/config/api.ts` is correct
- Ensure the API server is running and accessible
- Check network security config (Android) if using HTTP (not HTTPS)

### "Invalid email or password"
- Verify the API endpoint is returning the expected format
- Check API server logs for errors
- Verify the request payload matches what the API expects

### Token not persisting after app restart
- Install and configure AsyncStorage (see Token Storage section above)

## Next Steps

1. ✅ Update `BASE_URL` in `src/config/api.ts`
2. ✅ Test registration endpoint
3. ✅ Test login endpoint
4. ⏳ Add AsyncStorage for token persistence
5. ⏳ Implement other endpoints (Users, Contacts modules)
6. ⏳ Add error handling and retry logic
7. ⏳ Add loading states and better UX feedback

