# Frontend (React Native) - StartAndConnect

This folder contains the mobile app built with React Native.

## Requirements

- Node.js 20+
- Android Studio + Android SDK
- JDK 21+
- (iOS only) Xcode + CocoaPods on macOS

## Install

```bash
npm install
```

## API configuration

API base URL is set in `src/api/api-config.ts`.

- **Automatic mode (default):**
  - Development build (`__DEV__`) -> local backend
  - Release build -> production backend
- Local endpoints used in dev:
  - Android emulator: `http://10.0.2.2:5001/startandconnect-c44b2/europe-west1/api`
  - iOS simulator: `http://localhost:5001/startandconnect-c44b2/europe-west1/api`
- Production endpoint:
  - `https://europe-west1-startandconnect-c44b2.cloudfunctions.net/api`

If you need to force production while in dev, set `FORCE_PROD_IN_DEV = true`
in `src/api/api-config.ts`.

## Run app

### Android

```bash
npm start
npm run android
```

### iOS (macOS only)

```bash
npm start
npm run ios
```

## Quick verification

1. Open app and log in with:
   - email: `alehwebdev@gmail.com`
2. Validate core screens:
   - login
   - discover/activities
   - groups/chat
3. If activities do not load, verify API URL in `src/api/api-config.ts`.
