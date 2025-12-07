<p align="center">
  <img src="./logo.png" alt="StartAndConnect Logo" width="200"/>
</p>

# 🔸 StartAndConnect

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
