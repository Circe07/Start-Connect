# Firestore Database Setup Instructions

## The Problem
You're getting `firestore/unavailable` errors because **Firestore Database is not enabled** in your Firebase project.

## Solution: Enable Firestore Database

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com
2. Select your project: **startandconnect-c44b2**

### Step 2: Navigate to Firestore Database
1. In the left sidebar, click **"Firestore Database"** (or "Build" → "Firestore Database")
2. If you see a button that says **"Create database"** or **"Get started"**, click it

### Step 3: Choose Database Mode
1. You'll be asked to choose a mode:
   - **Start in test mode** (for development) - Recommended for now
   - **Start in production mode** (requires security rules)
2. Click **"Next"**

### Step 4: Choose Location
1. Select a location for your database (choose the closest to your users)
2. Click **"Enable"**

### Step 5: Set Security Rules (if you chose test mode)
After enabling, go to the **"Rules"** tab and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User collection - users can only read/write their own document
    match /user/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **"Publish"** to save the rules.

## After Enabling Firestore

1. **Rebuild your app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

2. **Test again** - The `firestore/unavailable` error should be resolved!

## Verification

After enabling, you should see:
- A Firestore Database dashboard in Firebase Console
- The ability to create collections and documents
- No more `firestore/unavailable` errors in your app

## Important Notes

- **Firestore is a separate service** from Firebase Auth - enabling Auth doesn't automatically enable Firestore
- **The database must be created** before you can read/write data
- **Security rules are required** - even in test mode, you should set proper rules

