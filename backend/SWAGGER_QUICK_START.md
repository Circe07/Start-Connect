# Swagger UI Quick Start Guide

## 📖 **What is Swagger UI?**

Swagger UI is an interactive tool that displays your API documentation in a beautiful, easy-to-use interface. It allows you to:

- ✅ Browse all available API endpoints
- ✅ Test endpoints directly from the browser
- ✅ View request/response schemas
- ✅ Authenticate with JWT tokens
- ✅ Generate client code

## 🚀 **Getting Started**

### Step 1: Start the Backend Server

```bash
cd backend/functions
npm install  # Make sure dependencies are installed
firebase emulators:start --only functions
```

### Step 2: Open Swagger UI

Open your browser and go to:

```
http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api/swagger-ui
```

You should see a beautiful interface with all API endpoints listed.

## 🔐 **Authentication**

### Add Your JWT Token

1. Click the **"Authorize"** button at the top-right
2. Paste your JWT token in the dialog:
   ```
   <your_jwt_token>
   ```
3. Click **"Authorize"**
4. Click **"Close"**

Now all your requests will include the authentication token.

## 🧪 **Testing Endpoints**

### Example: Get Your Profile

1. Find the **"Authentication"** section
2. Click **"GET /auth/me"**
3. Click **"Try it out"**
4. Click **"Execute"**
5. View the response below

### Example: Create a Post

1. Find the **"Posts"** section
2. Click **"POST /posts"**
3. Click **"Try it out"**
4. Modify the request body:

```json
{
  "content": "My first post!",
  "image": "https://example.com/image.jpg"
}
```

5. Click **"Execute"**
6. Scroll down to see the response

## 📋 **Common Tasks**

### View All Available Endpoints

Scroll through the left sidebar or use the search function. Each endpoint is organized by tag (Auth, Users, Groups, etc.).

### See Request/Response Schema

Click on an endpoint and scroll down to see:

- **Request body schema** (what to send)
- **Response schema** (what you'll get back)
- **Error responses** (what can go wrong)

### Copy a Curl Command

1. Expand an endpoint
2. Click **"Try it out"**
3. Scroll down and find "Curl"
4. Copy the command to use in terminal

## 🏷️ **Key Features**

| Feature                 | How to Use                        |
| ----------------------- | --------------------------------- |
| **Filter by Tag**       | Use dropdown menu at top          |
| **Search Endpoints**    | Ctrl+F in browser                 |
| **See Response Models** | Scroll to "Schemas" at bottom     |
| **Copy Example Values** | Hover over examples and click     |
| **View Raw JSON**       | Click "Model" at response section |

## 🛠️ **Advanced Usage**

### Export API Definition

1. At the bottom, you can find the `/swagger.json` endpoint
2. You can use this to generate client libraries or import to Postman

### Import to Postman

1. In Postman, click **"File" → "Import"**
2. Go to **"Link"** tab
3. Enter: `http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api/swagger.json`
4. Click **"Import"**

## 📌 **Important Endpoints**

### Before Testing Anything

```bash
# Check if API is running
GET /
```

### Authentication Flow

```bash
# 1. Register
POST /auth/register

# 2. Login
POST /auth/login

# 3. Get your profile (requires token)
GET /auth/me
```

### User Data

```bash
GET /users/me           # Your profile
PATCH /users/me         # Update profile
GET /hobbies            # Get all hobbies
POST /hobbies/me        # Add hobbies
```

### Create Content

```bash
POST /posts             # Create post
POST /groups            # Create group
POST /chats             # Create chat
POST /bookings          # Make reservation
```

## ❓ **Troubleshooting**

### "401 Unauthorized" Error

- ✅ Make sure you clicked "Authorize" and pasted your token
- ✅ Check that token hasn't expired
- ✅ Try logging in again to get a fresh token

### "Network Error" or "Cannot Connect"

- ✅ Verify backend server is running
- ✅ Check the URL: `http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api/swagger-ui`
- ✅ Make sure Firefox/Chrome aren't blocking requests

### Endpoint Not Listed

- ✅ Refresh the page (Ctrl+R)
- ✅ Check the server logs for Swagger errors
- ✅ Verify the route file has proper JSDoc comments

## 📚 **Documentation Structure**

All endpoints are organized by feature:

- **Authentication** - Login/Register/Password
- **Users** - Profile management
- **Hobbies** - Interest management
- **Groups** - Group operations
- **Chat** - Messaging
- **Friends** - Friend list
- **Posts** - Create/share posts
- **Bookings** - Reserve facilities
- **Centers** - Browse recreation centers
- **Maps** - Location features
- **Admin** - Admin operations

## 🤝 **Contributing**

When adding new endpoints:

1. Add JSDoc comments above the route:

```javascript
/**
 * @swagger
 * /myendpoint:
 *   get:
 *     summary: What this does
 *     tags: [MyTag]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/myendpoint", handler);
```

2. The documentation will update automatically!

## 📞 **Support**

If you encounter issues:

1. Check [Swagger Documentation](https://swagger.io/docs/)
2. Review `SWAGGER_DOCUMENTATION.md` in the backend folder
3. Check the JSDoc comments in route files
4. Run the backend with debug logs: `DEBUG=* npm start`

---

**Happy Testing!** 🎉
