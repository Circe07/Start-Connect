# 🔍 How to Find Your API BASE_URL

Based on your Firebase backend configuration, here's how to find your API BASE_URL.

## 📋 What We Know

From your Firebase config:
- **Project ID**: `startandconnect-c44b2`
- **Database ID**: `startandconnect-eur3` (Europe region)
- **Backend uses**: Firebase Admin SDK (server-side)

## 🎯 Where is Your API Backend Deployed?

Your API BASE_URL depends on where your backend server is hosted. Here are the most common options:

### Option 1: Firebase Cloud Functions (Most Likely) ⭐

If your API is deployed on Firebase Cloud Functions, the BASE_URL format is:

```
https://<REGION>-<PROJECT_ID>.cloudfunctions.net
```

**Most likely URL based on your project:**
- `https://us-central1-startandconnect-c44b2.cloudfunctions.net` (US Central - most common)
- `https://europe-west1-startandconnect-c44b2.cloudfunctions.net` (Europe - since your DB is there)
- `https://europe-west3-startandconnect-c44b2.cloudfunctions.net` (Europe alternative)

**How to find the exact URL:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `startandconnect-c44b2`
3. Click **"Functions"** in the left sidebar
4. You'll see your deployed functions with their URLs
5. The BASE_URL is the base URL (without the function name)

**Example:**
If you have a function called `api` at:
```
https://us-central1-startandconnect-c44b2.cloudfunctions.net/api
```
Then your BASE_URL would be:
```
https://us-central1-startandconnect-c44b2.cloudfunctions.net
```

### Option 2: Local Development

If you're running the API locally:

```
http://localhost:3000
```
(Or whatever port your server runs on - check your backend code)

### Option 3: Custom Domain / Other Hosting

If you have a custom domain or other hosting service:
- Heroku: `https://your-app-name.herokuapp.com`
- Vercel: `https://your-app.vercel.app`
- AWS: `https://your-api.amazonaws.com`
- Custom domain: `https://api.startandconnect.com`

## 🔧 How to Find Out Where Your API is Deployed

### Check Your Backend Repository

Look for deployment configuration files:
- `firebase.json` - Firebase hosting/functions config
- `package.json` - Check for deploy scripts
- `.github/workflows/` - CI/CD deployment files
- `vercel.json`, `netlify.toml`, etc. - Other hosting configs

### Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `startandconnect-c44b2`
3. Check these sections:
   - **Functions** - Shows deployed Cloud Functions
   - **Hosting** - Shows deployed web apps
   - **Project Settings** - Shows project details

## 📝 Next Steps

1. **Find where your API backend code is stored**
   - Is it in a separate repository?
   - Is it in the same repo as this mobile app?

2. **Check the deployment configuration**
   - Look for `firebase.json` or deployment configs
   - Check if there are deploy scripts in `package.json`

3. **Test the BASE_URL**
   - Once you have a URL, test it in a browser or Postman
   - Try: `https://your-api-url/auth/login` (should return an error, but confirm it's the right server)

## 🚀 Quick Setup Options

### If Using Firebase Cloud Functions:

Update `src/config/api.ts`:
```typescript
BASE_URL: 'https://us-central1-startandconnect-c44b2.cloudfunctions.net'
```

### If Running Locally:

Update `src/config/api.ts`:
```typescript
BASE_URL: 'http://localhost:3000'
```

### If Using Custom Domain:

Update `src/config/api.ts`:
```typescript
BASE_URL: 'https://your-actual-api-domain.com'
```

## ❓ Still Not Sure?

1. **Do you have a separate backend repository?**
   - If yes, check its deployment configuration
   - Look for Firebase Functions deployment scripts

2. **Is your backend already deployed?**
   - If yes, where did you deploy it?
   - Check your deployment platform's dashboard

3. **Are you testing locally?**
   - If yes, use `http://localhost:3000` (or your local port)

Once you know where your API is deployed, we can update the BASE_URL accordingly!

