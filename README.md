# StartAndConnect
![Logo](LOGO)
## 🔸 Project Description

This project delivers a robust RESTful API for centralized personal contact management and community group administration, built on **Node.js**, **Express**, and **Cloud Firestore**. It provides all the essential functionalities (CRUD) required for user interaction, ensuring security through **Firebase Authentication**.

---

## 🔸 Base URL for Frontend Consumption

The frontend should target the following base URL, which is the public entry point for the Firebase Cloud Function exposed in the deployment section:

| Environment | Base URL Structure | Example |
|-------------|--------------------|---------|
| Local Development | `http://localhost:3000` | `GET http://localhost:3000/ping` |
| Production/Staging | `[YOUR_FIREBASE_REGION]-[YOUR_PROJECT_ID].cloudfunctions.net/api` | `GET https://us-central1-myproject.cloudfunctions.net/api/publicGroups` |

---

## 🔸 Key Features

- **Secure Contact Management (Users):** Complete CRUD for contacts associated with a specific `userId`.
- **Atomic Group Administration (Groups):** Creation, joining, leaving, and ownership transfer logic.
- **Access Control:** Use of middleware to protect routes and verify resource ownership (contacts/groups).
- **Pagination:** Support for paginated queries of public groups (`/publicGroups`).

---

## 🔸 Authentication Flow (Crucial for Frontend)

All protected routes require a valid **Firebase ID Token** in the request headers.

1. **Client Action:** The user authenticates using Firebase Client SDK (e.g., Firebase Auth in React/Vue).
2. **Token Retrieval:** `firebase.auth().currentUser.getIdToken()` returns a fresh ID Token.
3. **API Request Header:**
   ```http
   Authorization: Bearer [FIREBASE_ID_TOKEN]
   ```
4. **Backend Verification:** `authMiddleware` verifies token validity and attaches `req.user.uid`.

---

## 🔸 API Endpoints

### 1. Contacts Module (Users Routes)

| Method | Path | Description | Auth Required | Parameters |
|--------|------|-------------|--------------|------------|
| GET | `/users` | Retrieves a list of all contacts. | ❌ Public | None |
| POST | `/new-contact` | Creates a new personal contact. | ✅ Auth | Body: `{ firstname, lastname, email, phone: }` |
| PATCH | `/update-contact/:id` | Updates a contact (ownership required). | ✅ Auth + Owner | Path: `:id`, Body: `{ field: value }` |
| DELETE | `/delete-contact/:id` | Deletes a contact (ownership required). | ✅ Auth + Owner | Path: `:id` |

### 2. Groups Module (Groups Routes)

| Method | Path | Description | Auth Required | Parameters |
|--------|------|-------------|--------------|------------|
| POST | `/createGroup` | Creates a new group; creator is owner. | ✅ Auth | Body: `{ name, description, isPublic, city  }` |
| POST | `/joinGroup` | Adds authenticated user to a group. | ✅ Auth | Body: `{ groupId: string }` |
| POST | `/leaveGroup` | Removes user, handles owner transfer/deletion. | ✅ Auth | Body: `{ groupId, [newOwnerId] }` |
| POST | `/groups/:groupId/removeMember` | Removes a member (owner only). | ✅ Auth + Owner | Path: `:groupId`, Body: `{ memberId }` |
| POST | `/groups/:groupId/transferOwnership` | Transfers ownership. | ✅ Auth + Owner | Path: `:groupId`, Body: `{ newOwnerId }` |
| PATCH | `/groups/:groupId` | Updates group details (owner only). | ✅ Auth + Owner | Path: `:groupId` |
| GET | `/groups/:groupId` | Retrieves full group details. | ✅ Auth + Member | Path: `:groupId` |
| GET | `/myGroups` | Lists all groups the user is a member of. | ✅ Auth | None |
| GET | `/publicGroups` | Paginated list of public groups. | ❌ Public | Query: `?limit=X&startAfterId=Y` |

---

## 🔸 Technologies and Requirements

Ensure you have the following installed:

- ✅ Node.js (LTS >= 20.x)
- ✅ npm
- ✅ Firebase CLI (optional but needed for deployment)

### Development Dependencies (Testing)
- `jest`
- `supertest`

---

## 🔸 Prerequisites and Security

### 1. Firebase Service Account Setup

1. Get your Firebase Admin SDK private key.
2. Rename it to `serviceAccountKey.json` and place it in the project root.
3. **⚠️ SECURITY:** Add this file to `.gitignore`.

### 2. Firestore Index (For `/publicGroups`)

Create a **composite index** for the `groups` collection:

| Field | Order |
|-------|--------|
| isPublic | asc |
| createdAt | desc |
| __name__ | asc |

---

## 🔸 Installation & Local Execution

```bash
git clone git@github.com:Circe07/Start-Connect.git
cd Start-Connect
npm install
npm start
```

API will run at: `http://localhost:3000`

---

## 🔸 Testing
### 1. Install Jest
```bash
npm npm i -D jest
```
### 2. Run All Tests
```bash
npm test
```

### 2. Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ping` | Returns `200 OK` with `Pong - API is Live!` |

---

## 🔸 Firebase Cloud Functions Deployment (Recommended)

1. Initialize Firebase:
```bash
firebase init functions
```

2. Export Express App in `functions/index.js`:
```js
const functions = require('firebase-functions');
const app = require('../src/app');
exports.api = functions.https.onRequest(app);
```

3. Deploy:
```bash
firebase deploy --only functions
```