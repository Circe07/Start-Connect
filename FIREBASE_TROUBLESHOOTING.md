# Firebase Firestore "Unavailable" Error - Troubleshooting Guide

## The Problem
You're getting persistent `firestore/unavailable` errors even though:
- ✅ Network is connected
- ✅ Firebase Auth works
- ✅ Firebase project is configured
- ✅ Security rules are correct

## Root Cause
The `firestore/unavailable` error on Android typically means:
1. **Android Emulator does NOT have Google Play Services** (MOST COMMON)
2. Network connectivity issues between emulator and Firebase servers
3. Firebase project configuration issue

## Solutions

### Solution 1: Use Emulator WITH Google Play Services (RECOMMENDED)

1. **Open Android Studio**
2. **Go to AVD Manager** (Tools → Device Manager)
3. **Create a new Virtual Device** or edit existing one
4. **IMPORTANT**: When selecting a system image, choose one that says **"Google Play"** (not just "Google APIs")
   - Example: "Pixel 5 API 33" with "Google Play" icon
5. **Finish setup and use this emulator**

### Solution 2: Test on Physical Android Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Run: `npm run android`
5. Select your physical device when prompted

Physical devices always have Google Play Services, so this will work.

### Solution 3: Verify Firebase Configuration

1. **Check `google-services.json`**:
   - Located at: `android/app/google-services.json`
   - Verify `package_name` matches your `applicationId` in `android/app/build.gradle`
   - Current package: `com.sencillo`

2. **Check Firebase Console**:
   - Go to: https://console.firebase.google.com
   - Select project: `startandconnect-c44b2`
   - Go to **Firestore Database**
   - Verify it's **enabled** (you should see a database)

3. **Check Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Solution 4: Clean and Rebuild

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Clear Metro bundler cache
npm start -- --reset-cache

# Rebuild app
npm run android
```

## What We've Fixed

1. ✅ Added explicit Firestore dependency to `android/app/build.gradle`
2. ✅ Added Google Play Services GCM dependency
3. ✅ Enhanced Firebase debugging utilities
4. ✅ Improved error logging and diagnostics
5. ✅ Added network security configuration

## Diagnostic Commands

The app now includes comprehensive debugging. When you run the app, check the console for:
- 🔍 Firebase debug information
- 📡 Network connectivity status
- 🔥 Firestore instance details
- 🧪 Connection test results

## Still Having Issues?

If the error persists after trying all solutions:

1. **Check the debug logs** - Look for the detailed Firebase debug output
2. **Verify emulator type** - Make absolutely sure it has Google Play Services
3. **Try a different emulator** - Create a fresh one with Google Play
4. **Test on physical device** - This will confirm if it's an emulator issue

## Important Notes

- **Firebase Auth works** because it doesn't require Google Play Services
- **Firestore requires Google Play Services** to connect to Firebase servers
- **This is a known limitation** of Android emulators without Google Play Services
- **Physical devices always work** because they have Google Play Services installed



