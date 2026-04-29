<img src="./banner.png" alt="StartAndConnect Logo" />

## 🔸 Overview

**StartAndConnect** is a REST API built with Node.js, Express, Firebase Cloud Functions (Gen2 → Cloud Run), and Firestore. It powers community features (groups, contacts, centers, maps), authentication, and the **experiences** domain (experiences, experience bookings, hosts, feedback, referrals, admin exports).

The **canonical backend** used for production deploy is **`backend/functions`** (see `backend/firebase.json`). An older root-level `functions/` tree was **moved to [`archive/legacy-root-functions-layered`](archive/legacy-root-functions-layered)** for reference only—do not deploy or install from there.

### Documentation (operations & production)

| Topic | Location |
|-------|-----------|
| **Operations, secrets, monitoring, rollback, checklist** | [`backend/functions/docs/operations-and-production.md`](backend/functions/docs/operations-and-production.md) |
| **Index of `docs/` folder** | [`backend/functions/docs/README.md`](backend/functions/docs/README.md) |
| **Incident runbook (includes Cloud Run rollback commands)** | [`backend/functions/docs/incident-runbook.md`](backend/functions/docs/incident-runbook.md) |
| **Hardening baseline & smoke references** | [`backend/functions/docs/production-hardening-baseline.md`](backend/functions/docs/production-hardening-baseline.md) |

Production highlights (details in the docs above):

- **Node.js 22**, **`firebase-functions` v7**, auth API key via **`defineSecret('AUTH_API_KEY')`** + Secret Manager (no legacy `functions.config()`).
- **Firestore** composite indexes: `backend/firestore.indexes.json` (use `gcloud` if CLI index deploy fails).
- **Cloud Monitoring**: dashboard + alert policy JSON under `backend/functions/docs/`; notification channels configured in GCP.
- **Rollback**: route Cloud Run traffic for service `api` in `europe-west1` (see runbook).

---

## Getting started (local)

### Prerequisites

- **Node.js 22** for Cloud Functions (`backend/functions/package.json` → `engines.node`). Use the same or compatible for local runs.
- Firebase CLI (`npm i -g firebase-tools`)

### Environment variables

- Copy **`backend/functions/.env.example`** to **`backend/functions/.env`** and fill values (never commit real secrets).
- Required for auth (login / refresh against Firebase Identity Toolkit):
  - `AUTH_API_KEY` (Firebase Web API key)
- Optional (Firestore DB selection):
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_DATABASE_ID`
- Recommended:
  - `CORS_ORIGINS` (comma-separated allowlist for prod)
  - `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`
- Payments (when integrated): `STRIPE_*` — use Secret Manager in production, not committed `.env`.

### Install

```bash
cd backend/functions
npm install
```

### Run (emulators)

From `backend/functions`:

```bash
npm run serve
```

### Deploy (API function)

From the **`backend`** directory (where `firebase.json` lives):

```bash
firebase deploy --only functions:api
```

### Tests (functions package)

```bash
cd backend/functions
npm test
```

### Production readiness testing

Run from the **`backend`** directory (see `backend/package.json`):

```bash
cd backend
npm run test:phase1
npm run test:contract
npm run test:e2e
npm run test:security
npm run test:perf-smoke
npm run test:all-backend
```

### End-to-end smoke (experiences)

Postman collection and environment (refresh JWTs before running):

- `testing/backend/experiences-e2e-smoke.postman_collection.json`
- `testing/backend/experiences-e2e-smoke.postman_environment.json`

```bash
cd <repo-root>
npx newman run testing/backend/experiences-e2e-smoke.postman_collection.json -e testing/backend/experiences-e2e-smoke.postman_environment.json
```

### Automation tooling

- Pre-commit hook (Husky + lint-staged): configured under **`backend/`**; formats staged files with Prettier.
- Dependabot: `backend/.github/dependabot.yml`
- Security scanning: `backend/.github/workflows/codeql.yml`
- Backend release gates (lint/format/smoke): `backend/.github/workflows/backend-release-gates.yml`
- Newman smoke workflow: `backend/.github/workflows/newman-smoke.yml`

Testing artifacts:

- `testing/README.md`
- `testing/backend/` — experiences E2E smoke (above)
- `testing/frontend/api-integration-matrix.md`
- `testing/frontend/StartAndConnect.postman_collection.json`
- `testing/release/release-gates.md`

### API docs

- OpenAPI spec (maintained copy): [`backend/functions/docs/openapi.yaml`](backend/functions/docs/openapi.yaml) — may lag behind all `/api/v1` routes; prefer [`operations-and-production.md`](backend/functions/docs/operations-and-production.md) for production behavior.

### Experiences domain (`/api/v1`)

Routes are also registered without the `api/v1` prefix for backward compatibility; **prefer `/api/v1/...`** for new clients.

| Area | Endpoints (summary) |
|------|---------------------|
| Hosts | `POST/PATCH/GET /api/v1/hosts`, `GET /api/v1/hosts/:id` |
| Experiences | `POST/GET/PATCH /api/v1/experiences`, `PATCH .../publish`, `GET .../:id` |
| Experience bookings | `POST /api/v1/experience-bookings`, `GET /me`, `GET /experience/:id`, `PATCH .../:id/status`, `PATCH .../:id/cancel` |
| Feedback | `POST /api/v1/feedback`, `GET /experience/:experienceId` |
| Referrals | `POST /api/v1/referrals`, `GET /me` |
| Admin exports | `GET /api/v1/admin/experiences/export`, `.../experience-bookings/export`, `.../users/export` (query filters + pagination) |

See **`backend/functions/docs/production-hardening-baseline.md`** and **`operations-and-production.md`** for smoke expectations and operational checklist.

### 🔸 API Endpoint Summary

#### 🔸 Auth Module

| Method | Endpoint                | Auth | Description                     |
| ------ | ----------------------- | ---- | ------------------------------- |
| POST   | `/auth/register`        |      | Register a new user             |
| POST   | `/auth/login`           |      | Authenticate user and get token |
| POST   | `/auth/logout`          | ✅   | Log out the current user        |
| GET    | `/auth/me`              | ✅   | Get current user's profile      |
| POST   | `/auth/change-password` | ✅   | Change current user's password  |

```json
{
  "register": {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "username": "newuser"
  },
  "login": {
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }
}
```

#### 🔸 Users Module

| Method | Endpoint      | Auth | Description                   |
| ------ | ------------- | ---- | ----------------------------- |
| GET    | `/users/me`   | ✅   | Get current user's profile    |
| PATCH  | `/users/me`   | ✅   | Update current user's profile |
| GET    | `/users/:uid` | ✅   | Get user profile by ID        |

#### 🔸 Contacts Module

| Method | Endpoint        | Auth | Description                   |
| ------ | --------------- | ---- | ----------------------------- |
| GET    | `/contacts`     | ✅   | Retrieve all contacts         |
| POST   | `/contacts`     | ✅   | Create a new contact          |
| PATCH  | `/contacts/:id` | ✅   | Update a contact (owner only) |
| DELETE | `/contacts/:id` | ✅   | Delete a contact (owner only) |

#### Test Endpoints Contacts

To test the Contacts module endpoints, you can use tools like Postman or cURL. Below are examples of how to test the GET and POST requests:

#### Retrieve All Contacts

```http
GET /contacts
Authorization: Bearer <token>
```

#### Create a New Contact

```http
POST /contacts
Authorization: Bearer <token>

{
   "name": "John Doe",
   "email": "john.doe@example.com",
   "phone": "+123456789"
}
```

#### Update a Contact

```http
UPDATE /contacts/:id
Authorization: Bearer <token>

{
   "name": "new_name",
   "email": "new_email@email.com",
   "phone": "+5434343"
}
```

#### Delete a Contact

```http
UPDATE /contacts/:id
Authorization: Bearer <token>
```

Make sure to replace `<token>` with a valid Firebase ID Token.

#### 🔸 Groups Module

| Method | Endpoint                                    | Auth        | Description                                          |
| ------ | ------------------------------------------- | ----------- | ---------------------------------------------------- |
| GET    | /groups/public                              | ✅          | Get paginated list of public groups                  |
| GET    | /groups/my-groups                           | ✅          | List groups where the user is a member               |
| GET    | /groups/:id                                 | ✅          | Get group details (members only)                     |
| POST   | /groups/                                    | ✅          | Create a new group (creator becomes owner)           |
| POST   | /groups/:id/join                            | ✅          | Join a group                                         |
| POST   | /groups/:id/leave                           | ✅          | Leave a group (handles ownership transfer if needed) |
| POST   | /groups/:id/post                            | ✅          | Create a post inside a group                         |
| PATCH  | /groups/:id                                 | ✅ (Owner)  | Update group information                             |
| PATCH  | /groups/:groupId/transfer-owner/:newOwnerId | ✅ (Owner)  | Transfer group ownership to another member           |
| DELETE | /groups/:groupId/remove-member/:memberId    | ✅ (Owner)  | Remove a member from the group                       |
| DELETE | /groups/:id                                 | ✅ (Owner)  | Delete the group                                     |
| DELETE | /groups/:groupId/post/:postId               | ✅ (Author) | Delete a post from the group                         |

Examples to test each endpoint (replace <FIREBASE_ID_TOKEN>, ids and values):

GET Public Groups

```http
GET /groups/public?limit=10 HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

GET My Groups

```http
GET /groups/my-groups HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

GET Group by ID

```http
GET /groups/abc123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

POST Create Group

```http
POST /groups/ HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
   "name": "Local Developers",
   "description": "Group for sharing resources and events.",
   "city": "Madrid",
   "isPublic": true
}
```

POST Join Group

```http
POST /groups/abc123/join HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

POST Leave Group

```http
POST /groups/abc123/leave HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

POST New Post

```http
POST /groups/abc123/post HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
   "content": "Welcome to the group!",
   "imageUrl": "https://example.com/image.jpg"
}
```

PATCH Update Group

```http
PATCH /groups/abc123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
   "name": "New Group Name",
   "description": "Updated description",
   "isPublic": false
}
```

PATCH Transfer Owner

```http
PATCH /groups/abc123/transfer-owner/user456 HTTP/1.1
Host: api.example.com
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

#### 🔸 Centers Module (Admin)

| Method | Endpoint          | Auth       | Description                        |
| ------ | ----------------- | ---------- | ---------------------------------- |
| GET    | `/centers`        | Public     | List all centers                   |
| GET    | `/centers/search` | Public     | Search centers by name or location |
| POST   | `/centers`        | ✅ (Admin) | Create a new center                |
| PATCH  | `/centers/:id`    | ✅ (Admin) | Update an existing center          |
| DELETE | `/centers/:id`    | ✅ (Admin) | Delete a center                    |

#### 🔸 Maps Module

| Method | Endpoint       | Auth | Description                                     |
| ------ | -------------- | ---- | ----------------------------------------------- |
| GET    | `/maps/nearby` | ✅   | Find centers near a location (lat, lng, radius) |

```http
GET /maps/nearby?lat=41.3896&lng=2.1706&radius=5000
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

#### 🔸 Social Module (Groups)

| Method | Endpoint                                        | Auth | Description                                       |
| ------ | ----------------------------------------------- | ---- | ------------------------------------------------- |
| POST   | `/groups/:id/messages`                          | ✅   | Send a message to the group chat                  |
| GET    | `/groups/:id/messages`                          | ✅   | Get messages from the group chat                  |
| DELETE | `/groups/:id/messages/:messageId`               | ✅   | Delete a message (Author/Owner only)              |
| POST   | `/groups/:id/posts/:postId/like`                | ✅   | Toggle Like on a post                             |
| POST   | `/groups/:id/posts/:postId/comments`            | ✅   | Add a comment to a post                           |
| GET    | `/groups/:id/posts/:postId/comments`            | ✅   | Get comments of a post                            |
| DELETE | `/groups/:id/posts/:postId/comments/:commentId` | ✅   | Delete a comment (Author/Post Author/Group Owner) |

#### 🔸 Admin Module

| Method | Endpoint            | Auth | Description                                  |
| ------ | ------------------- | ---- | -------------------------------------------- |
| POST   | `/admin/make-admin` |      | Assign admin role to a user (Dev/Setup only) |

### 🔸 Usage Examples

#### Search Nearby Centers

```http
GET /maps/nearby?lat=40.416&lng=-3.703&radius=5000
Authorization: Bearer <token>
```

#### Create Center (Admin)

```http
POST /centers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "name": "Mega Gym",
    "address": "Main St 123",
    "location": { "lat": 40.4, "lng": -3.7 },
    "services": ["Gym", "Pool"],
    "prices": { "monthly": 50 }
}
```

#### Social Interactions

**Like a Post:**

```http
POST /groups/group123/posts/post456/like
Authorization: Bearer <token>
```

**Comment on a Post:**

```http
POST /groups/group123/posts/post456/comments
Authorization: Bearer <token>
Content-Type: application/json

{ "content": "Great post!" }
```

**Delete a Comment:**

```http
DELETE /groups/group123/posts/post456/comments/comment789
Authorization: Bearer <token>
```

# 🔸 How to initialize Frontend

## Download dev tools

```
npm install
```

## First Step

1. Configuration android path sdk -> "frontend/android/local.properties"

2. Example -> sdk.dir=C:\\Users\\your_user\\AppData\\Local\\Android\\Sdk

## Second Step

```cmd
npm start // start metro
npm run android // start app and download in android emulator
npm run ios // start app and download in ios emulator
```

## Errors

If you have this -> java.lang.String cannot be cast to java.lang.Boolean

### 1. Check your JDK version -> >= 21

### 2. Check your NodeJS version -> LTS (e.g. 20 or 22 per tooling requirements)

If you have this -> white screen

### 1. Close App -> Emulator

### 2. Restart metro server -> terminal(recommend: install warp)

### 3. When Metro is run -> open app
