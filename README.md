# 🔸 StartAndConnect

## 🔸 Overview

**StartAndConnect** is a RESTful API for managing users, community groups, and posts. Built with Node.js, Express, Firebase Cloud Functions, and Cloud Firestore.

### 🔸 API Endpoint Summary

#### 🔸 Users Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | ❌ | Retrieve all contacts |
| POST | `/new-contact` | ✅ | Create a new contact |
| PATCH | `/update-contact/:id` | ✅ | Update a contact (owner only) |
| DELETE | `/delete-contact/:id` | ✅ | Delete a contact (owner only) |

#### 🔸 Groups Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/groups/public` | ❌ | Get public groups with pagination |
| GET | `/groups/myGroups` | ✅ | Get all groups where the user is a member |
| GET | `/groups/:groupId` | ✅ | Get group details (member only) |
| POST | `/groups/create-group` | ✅ | Create a new group (user becomes owner) |
| POST | `/groups/:groupId/join` | ✅ | Join a group |
| POST | `/groups/:groupId/leave` | ✅ | Leave a group (handles ownership transfer) |
| PATCH | `/groups/:groupId` | ✅ (Owner) | Update group information |
| DELETE | `/groups/:groupId` | ✅ (Owner) | Delete a group |
| POST | `/groups/:groupId/new-post` | ✅ | Create a post in a group |
| DELETE | `/groups/:groupId/post/:postId` | ✅ (Author) | Delete a post |

## 🔸 Base URLs

| Environment | Base URL |
|------------|----------|
| Local | `http://localhost:3000` |
| Firebase | `https://api-ma5t57vzsq-ew.a.run.app` |

## 🔸 Features

* Firebase Authentication with Bearer tokens
* Group Management (create, join, leave, update, delete)
* Post System within groups
* Pagination for public groups
* Real-time Firestore NoSQL database

## 🔸 Authentication

Protected routes require Firebase ID Token:

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

## 🔸 Groups API

### Create Group
```http
POST /groups/create-group
Authorization: Bearer <token>

{
   "name": "Developers Hub",
   "description": "Community for engineers.",
   "city": "Barcelona",
   "isPublic": true
}
```

### Join Group
```http
POST /groups/:groupId/join
Authorization: Bearer <token>
```

### List My Groups
```http
GET /groups/myGroups
Authorization: Bearer <token>
```

### Public Groups
```http
GET /groups/public?limit=5&startAfterId=abc123
```

## 🔸 Posts API

### Create Post
```http
POST /groups/:groupId/new-post
Authorization: Bearer <token>

{
   "content": "Hello everyone!",
   "imageUrl": "https://example.com/image.jpg"
}
```

### Delete Post
```http
DELETE /groups/:groupId/post/:postId
Authorization: Bearer <token>
```

## 🔸 Development
```bash
# Install dependencies
npm install

# Deploy to Firebase
firebase deploy --only functions

# Run tests
npm install jest
npm test
```