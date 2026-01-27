<img src="./banner.png" alt="StartAndConnect Logo" />

## 🔸 Overview

**StartAndConnect** is a RESTful API for managing users, community groups, and posts. Built with Node.js, Express, Firebase Cloud Functions, and Cloud Firestore.

### 🔸 API Endpoint Summary

#### 🔸 Auth Module

| Method | Endpoint                | Auth | Description                     |
| ------ | ----------------------- | ---- | ------------------------------- |
| POST   | `/auth/register`        |      | Register a new user             |
| POST   | `/auth/login`           |      | Authenticate user and get token |
| POST   | `/auth/logout`          | ✅   | Log out the current user        |
| GET    | `/auth/me`              | ✅   | Get current user's profile      |
| POST   | `/auth/change-password` | ✅   | Change current user's password  |

**Request Examples:**

Register:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "username": "newuser"
}
```

Login:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

#### 🔸 Users Module

| Method | Endpoint      | Auth | Description                   |
| ------ | ------------- | ---- | ----------------------------- |
| GET    | `/users/me`   | ✅   | Get current user's profile    |
| PATCH  | `/users/me`   | ✅   | Update current user's profile |
| GET    | `/users/:uid` | ✅   | Get user profile by ID        |
| GET    | `/users`      | ✅   | Search users                  |

#### 🔸 Friends Module

| Method | Endpoint             | Auth | Description         |
| ------ | -------------------- | ---- | ------------------- |
| GET    | `/friends`           | ✅   | List user's friends |
| POST   | `/friends`           | ✅   | Add a friend        |
| DELETE | `/friends/:friendId` | ✅   | Remove a friend     |

#### 🔸 Hobbies Module

| Method | Endpoint                  | Auth | Description                     |
| ------ | ------------------------- | ---- | ------------------------------- |
| GET    | `/hobbies`                | ✅   | Get all available hobbies       |
| GET    | `/hobbies/me`             | ✅   | Get current user's hobbies      |
| POST   | `/hobbies/me`             | ✅   | Add hobbies to current user     |
| GET    | `/hobbies/:hobbyId/users` | ✅   | Get users with a specific hobby |
| DELETE | `/hobbies/:hobbyId`       | ✅   | Remove hobby from current user  |

#### 🔸 Contacts Module

| Method | Endpoint        | Auth | Description           |
| ------ | --------------- | ---- | --------------------- |
| GET    | `/contacts`     | ✅   | Retrieve all contacts |
| POST   | `/contacts`     | ✅   | Create a new contact  |
| PATCH  | `/contacts/:id` | ✅   | Update a contact      |
| DELETE | `/contacts/:id` | ✅   | Delete a contact      |

**Examples:**

Create Contact:

```http
POST /contacts
Authorization: Bearer <token>
Content-Type: application/json

{
   "name": "John Doe",
   "email": "john.doe@example.com",
   "phone": "+123456789"
}
```

Update Contact:

```http
PATCH /contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
   "name": "new_name",
   "email": "new_email@email.com",
   "phone": "+5434343"
}
```

Delete Contact:

```http
DELETE /contacts/:id
Authorization: Bearer <token>
```

#### 🔸 Groups Module

| Method | Endpoint                                        | Auth | Description                                |
| ------ | ----------------------------------------------- | ---- | ------------------------------------------ |
| GET    | `/groups/public`                                | ✅   | Get paginated list of public groups        |
| GET    | `/groups/my-groups`                             | ✅   | List groups where the user is a member     |
| GET    | `/groups/:id`                                   | ✅   | Get group details                          |
| POST   | `/groups/`                                      | ✅   | Create a new group (creator becomes owner) |
| POST   | `/groups/:id/join`                              | ✅   | Join a group                               |
| POST   | `/groups/:id/leave`                             | ✅   | Leave a group                              |
| POST   | `/groups/:id/post`                              | ✅   | Create a post inside a group               |
| PATCH  | `/groups/:id`                                   | ✅   | Update group information                   |
| PATCH  | `/groups/:id/transfer-owner/:newOwnerId`        | ✅   | Transfer group ownership to another member |
| DELETE | `/groups/:id/remove-member/:memberId`           | ✅   | Remove a member from the group             |
| DELETE | `/groups/:id`                                   | ✅   | Delete the group                           |
| DELETE | `/groups/:id/post/:postId`                      | ✅   | Delete a post from the group               |
| GET    | `/groups/:id/messages`                          | ✅   | Get group chat messages                    |
| POST   | `/groups/:id/messages`                          | ✅   | Send a message to group chat               |
| DELETE | `/groups/:id/messages/:messageId`               | ✅   | Delete a group chat message                |
| POST   | `/groups/:id/posts/:postId/like`                | ✅   | Toggle like on a post                      |
| POST   | `/groups/:id/posts/:postId/comments`            | ✅   | Add a comment to a post                    |
| GET    | `/groups/:id/posts/:postId/comments`            | ✅   | Get comments of a post                     |
| DELETE | `/groups/:id/posts/:postId/comments/:commentId` | ✅   | Delete a comment                           |

**Examples:**

Create Group:

```http
POST /groups/ HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "name": "Local Developers",
   "description": "Group for sharing resources and events.",
   "city": "Madrid",
   "isPublic": true
}
```

Join Group:

```http
POST /groups/:id/join HTTP/1.1
Authorization: Bearer <token>
```

Create Post in Group:

```http
POST /groups/:id/post HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "content": "Welcome to the group!",
   "imageUrl": "https://example.com/image.jpg"
}
```

Send Group Message:

```http
POST /groups/:id/messages HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "content": "Hello everyone!"
}
```

Update Group:

```http
PATCH /groups/:id HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "name": "New Group Name",
   "description": "Updated description",
   "isPublic": false
}
```

#### 🔸 Group Requests Module

| Method | Endpoint                             | Auth | Description                      |
| ------ | ------------------------------------ | ---- | -------------------------------- |
| POST   | `/group-requests/:groupId`           | ✅   | Send a group join request        |
| GET    | `/group-requests/:groupId`           | ✅   | Get pending requests for a group |
| PATCH  | `/group-requests/:requestId/approve` | ✅   | Approve a group join request     |
| PATCH  | `/group-requests/:requestId/reject`  | ✅   | Reject a group join request      |

#### 🔸 Posts Module

| Method | Endpoint                             | Auth | Description             |
| ------ | ------------------------------------ | ---- | ----------------------- |
| GET    | `/posts`                             | ✅   | List all posts          |
| GET    | `/posts/:postId`                     | ✅   | Get a specific post     |
| POST   | `/posts`                             | ✅   | Create a new post       |
| DELETE | `/posts/:postId`                     | ✅   | Delete a post           |
| POST   | `/posts/:postId/like`                | ✅   | Toggle like on a post   |
| POST   | `/posts/:postId/comments`            | ✅   | Add a comment to a post |
| GET    | `/posts/:postId/comments`            | ✅   | Get comments of a post  |
| DELETE | `/posts/:postId/comments/:commentId` | ✅   | Delete a comment        |
| POST   | `/posts/:postId/share`               | ✅   | Share a post            |

**Examples:**

Create Post:

```http
POST /posts HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "content": "Great post content!",
   "imageUrl": "https://example.com/image.jpg"
}
```

Toggle Like:

```http
POST /posts/:postId/like HTTP/1.1
Authorization: Bearer <token>
```

Add Comment:

```http
POST /posts/:postId/comments HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "content": "Great post!"
}
```

#### 🔸 Chat Module

| Method | Endpoint                 | Auth | Description       |
| ------ | ------------------------ | ---- | ----------------- |
| GET    | `/chat`                  | ✅   | Get user's chats  |
| POST   | `/chat`                  | ✅   | Create a new chat |
| GET    | `/chat/:chatId/messages` | ✅   | Get chat messages |
| POST   | `/chat/:chatId/messages` | ✅   | Send a message    |
| POST   | `/chat/:chatId/read`     | ✅   | Mark chat as read |

**Examples:**

Create Chat:

```http
POST /chat HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "participantIds": ["user123", "user456"]
}
```

Send Message:

```http
POST /chat/:chatId/messages HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "content": "Hello!"
}
```

#### 🔸 Bookings Module

| Method | Endpoint                               | Auth | Description                          |
| ------ | -------------------------------------- | ---- | ------------------------------------ |
| POST   | `/bookings`                            | ✅   | Create a new booking                 |
| GET    | `/bookings/me`                         | ✅   | Get user's bookings                  |
| GET    | `/bookings/:venueId/:facilityId/:date` |      | Get availability for a facility/date |

**Examples:**

Create Booking:

```http
POST /bookings HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
   "venueId": "venue123",
   "facilityId": "facility456",
   "date": "2024-02-15",
   "timeSlots": ["10:00", "11:00"]
}
```

Get Availability:

```http
GET /bookings/venue123/facility456/2024-02-15
```

#### 🔸 Centers Module

| Method | Endpoint          | Auth       | Description                        |
| ------ | ----------------- | ---------- | ---------------------------------- |
| GET    | `/centers`        | Public     | List all centers                   |
| GET    | `/centers/search` | Public     | Search centers by name or location |
| POST   | `/centers`        | ✅ (Admin) | Create a new center                |
| PATCH  | `/centers/:id`    | ✅ (Admin) | Update an existing center          |
| DELETE | `/centers/:id`    | ✅ (Admin) | Delete a center                    |

**Examples:**

List Centers:

```http
GET /centers HTTP/1.1
```

Search Centers:

```http
GET /centers/search?q=gym&city=Madrid HTTP/1.1
```

Create Center (Admin):

```http
POST /centers HTTP/1.1
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

Update Center (Admin):

```http
PATCH /centers/:id HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
    "name": "Updated Gym",
    "prices": { "monthly": 60 }
}
```

Delete Center (Admin):

```http
DELETE /centers/:id HTTP/1.1
Authorization: Bearer <admin_token>
```

#### 🔸 Maps Module

| Method | Endpoint       | Auth | Description                           |
| ------ | -------------- | ---- | ------------------------------------- |
| GET    | `/maps/nearby` | ✅   | Find places near a location           |
| GET    | `/maps/search` | ✅   | Search for places by name or location |

**Examples:**

Find Nearby Places:

```http
GET /maps/nearby?lat=40.416&lng=-3.703&radius=5000 HTTP/1.1
Authorization: Bearer <token>
```

Search Places:

```http
GET /maps/search?q=gym&city=Madrid HTTP/1.1
Authorization: Bearer <token>
```

#### 🔸 Admin Module

| Method | Endpoint              | Auth | Description                             |
| ------ | --------------------- | ---- | --------------------------------------- |
| POST   | `/admin/seed-hobbies` |      | Seed the database with hobbies (Dev)    |
| POST   | `/admin/seed-venues`  |      | Seed the database with venues (Dev)     |
| POST   | `/admin/make-admin`   |      | Assign admin role to a user (Dev/Setup) |

**Examples:**

Make Admin:

```http
POST /admin/make-admin HTTP/1.1
Content-Type: application/json

{
    "uid": "user123"
}
```

Seed Hobbies:

```http
POST /admin/seed-hobbies HTTP/1.1
```

Seed Venues:

```http
POST /admin/seed-venues HTTP/1.1
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

### 2. Check your NodeJS version -> v.20

If you have this -> white screen

### 1. Close App -> Emulator

### 2. Restart metro server -> terminal(recommend: install warp)

### 3. When Metro is run -> open app
