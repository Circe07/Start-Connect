# Firestore "Unavailable" Error - Troubleshooting Guide

## ✅ Fixed: Collection Name
- Changed from `'user'` (singular) to `'users'` (plural) to match your database

## 🔍 Additional Checks Needed

### 1. Verify Firestore API is Enabled in Google Cloud Console

Even if the database exists, the API might not be enabled:

1. Go to: https://console.cloud.google.com/apis/library
2. Select your project: **startandconnect-c44b2**
3. Search for: **"Cloud Firestore API"**
4. If it shows "API enabled" - ✅ Good
5. If it shows "Enable" - Click it to enable

### 2. Update Security Rules for `users` Collection

Your current rules might be for `user` (singular) but database has `users` (plural).

Go to Firebase Console → Firestore Database → Rules tab and use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection (plural) - users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Important:** Notice `match /users/{userId}` (plural) not `match /user/{userId}` (singular)

### 3. Check Database Region

Your database shows: `startandconnect-eur3` (Europe region)

Make sure your app can connect to this region. If you're testing from a different region, there might be latency issues.

### 4. Verify User Document Structure

Your database shows a user document with:
- `hobbies`
- `createdAt`
- `email`

But your code expects:
- `name`
- `first_surname`
- `email_address`
- etc.

**This mismatch might cause issues when reading the document!**

### 5. Test with Simple Query

Try accessing the document directly in Firebase Console to verify:
- The document exists
- Security rules allow access
- The document structure matches what your code expects

## Next Steps

1. ✅ Code updated to use `'users'` collection
2. ⚠️ Check if Firestore API is enabled in Google Cloud Console
3. ⚠️ Update security rules to use `users` (plural)
4. ⚠️ Verify document structure matches your User interface

