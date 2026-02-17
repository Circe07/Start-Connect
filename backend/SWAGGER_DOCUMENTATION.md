# Swagger UI Documentation - Start&Connect API

## Overview

Swagger UI has been integrated into the Start&Connect backend API to provide comprehensive API documentation and interactive testing capabilities. This allows developers to explore and test all available API endpoints directly from a user-friendly interface.

## Installation

The following packages have been added to the project:

```bash
npm install swagger-ui-express swagger-jsdoc
```

**Versions used:**

- `swagger-ui-express`: ^5.0.0
- `swagger-jsdoc`: ^6.2.8

## Configuration

### Swagger Configuration File

A new configuration file has been created at:

```
backend/functions/src/config/swagger.js
```

This file contains:

- OpenAPI 3.0 specification
- API metadata (title, version, description)
- Server configurations (local emulator and production)
- Security schemes (Bearer token/JWT)
- Common schema definitions (User, Hobby, Group, Chat, Error)
- Tag definitions for endpoint organization

### Integration with Express

The Swagger UI has been integrated into the Express application in:

```
backend/functions/src/app.js
```

Swagger UI is exposed at the `/api-docs` endpoint.

## Accessing Swagger UI

Once the application is running, access the interactive API documentation at:

**Local Emulator:**

```
http://localhost:5001/start-connect-13b69/us-central1/api/api-docs
```

**Production:**

```
https://us-central1-start-connect-13b69.cloudfunctions.net/api/api-docs
```

## API Documentation

All API routes have been documented with JSDoc/Swagger comments. Each endpoint includes:

- **Summary**: Brief description of what the endpoint does
- **Tags**: Category for organization
- **Parameters**: Query, path, or header parameters
- **Request Body**: Schema and examples (if applicable)
- **Responses**: Possible response codes and schemas
- **Security**: Authentication requirements (if applicable)

### Documented Endpoints by Module

#### Authentication (`/auth`)

- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- POST `/auth/change-password` - Change password
- POST `/auth/logout` - Logout user
- GET `/auth/me` - Get current user info

#### Users (`/users`)

- GET `/users` - Search users
- GET `/users/me` - Get current user profile
- PATCH `/users/me` - Update current user profile
- GET `/users/{uid}` - Get specific user profile

#### Hobbies (`/hobbies`)

- GET `/hobbies` - Get all hobbies
- GET `/hobbies/me` - Get user's hobbies
- POST `/hobbies/me` - Add hobbies to user
- GET `/hobbies/{hobbyId}/users` - Get users with specific hobby
- DELETE `/hobbies/{hobbyId}` - Remove hobby from user

#### Groups (`/groups`)

- GET `/groups/public` - Get public groups
- GET `/groups/my-groups` - Get user's groups
- GET `/groups/{id}` - Get group details
- POST `/groups` - Create new group
- POST `/groups/{id}/join` - Join a group
- POST `/groups/{id}/leave` - Leave a group
- PATCH `/groups/{id}` - Update group info
- DELETE `/groups/{id}` - Delete group
- POST `/groups/{id}/post` - Create group post
- POST `/groups/{id}/messages` - Send message
- And more...

#### Chat (`/chats`)

- GET `/chats` - Get all chats
- POST `/chats` - Create new chat
- GET `/chats/{chatId}/messages` - Get chat messages
- POST `/chats/{chatId}/messages` - Send message
- POST `/chats/{chatId}/read` - Mark chat as read

#### Contacts (`/contacts`)

- GET `/contacts` - Get all contacts
- POST `/contacts` - Create new contact
- PATCH `/contacts/{id}` - Update contact
- DELETE `/contacts/{id}` - Delete contact

#### Bookings (`/bookings`)

- POST `/bookings` - Create booking
- GET `/bookings/me` - Get user's bookings
- GET `/bookings/{venueId}/{facilityId}/{date}` - Get availability

#### Centers (`/centers`)

- GET `/centers` - Get all centers
- GET `/centers/search` - Search centers
- POST `/centers` - Create center (Admin)
- PATCH `/centers/{id}` - Update center (Admin)
- DELETE `/centers/{id}` - Delete center (Admin)

#### Posts (`/posts`)

- GET `/posts` - Get feed
- GET `/posts/{postId}` - Get specific post
- POST `/posts` - Create post
- DELETE `/posts/{postId}` - Delete post
- POST `/posts/{postId}/like` - Like post
- POST `/posts/{postId}/comments` - Add comment
- And more...

#### Friends (`/friends`)

- GET `/friends` - List friends
- POST `/friends` - Add friend
- DELETE `/friends/{friendId}` - Remove friend

#### Maps (`/maps`)

- GET `/maps/nearby` - Get nearby places
- GET `/maps/search` - Search places

#### Group Requests (`/groupsRequests`)

- POST `/groupsRequests/{groupId}` - Send join request
- GET `/groupsRequests/{groupId}` - Get join requests
- PATCH `/groupsRequests/{requestId}/approve` - Approve request
- PATCH `/groupsRequests/{requestId}/reject` - Reject request

#### Admin (`/admin`)

- POST `/admin/seed-hobbies` - Seed hobbies data
- POST `/admin/seed-venues` - Seed venues data
- POST `/admin/make-admin` - Grant admin privileges

## Security

All protected endpoints require a Bearer token (JWT) in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

In Swagger UI, you can:

1. Click the "Authorize" button at the top
2. Enter your JWT token
3. Click "Authorize" to add it to all subsequent requests

## Features

### Interactive Testing

Swagger UI allows you to:

- View detailed endpoint documentation
- Test endpoints directly from the browser
- See request/response examples
- Try different parameters
- View response schemas

### Schema Definitions

Common data models are defined in the Swagger configuration:

- **User**: User profile information
- **Hobby**: Hobby details
- **Group**: Group information
- **Chat**: Chat conversation
- **Error**: Standard error response

These schemas are referenced throughout the API documentation.

## Adding Documentation to New Routes

When adding new endpoints to the API:

1. Import JSDoc comments with Swagger annotations
2. Describe the endpoint with tags, parameters, and responses
3. Reference schemas from the Swagger configuration

Example:

```javascript
/**
 * @swagger
 * /route/{id}:
 *   get:
 *     summary: Description of endpoint
 *     tags: [TagName]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 */
router.get("/:id", handler);
```

## Best Practices

1. **Always document new endpoints**: Add Swagger comments to all new routes
2. **Use consistent tags**: Keep endpoint organization consistent
3. **Include examples**: Provide realistic request/response examples
4. **Document security**: Clearly mark authenticated endpoints
5. **Version your API**: Update documentation when making breaking changes

## Troubleshooting

### Swagger UI not loading

- Ensure all route files are properly referenced in `swagger.js`
- Check that JSDoc comments are properly formatted
- Verify that swagger-ui-express is installed

### Endpoints not appearing

- Confirm JSDoc comments exist in the route file
- Check that the file path is included in swagger.js `apis` array
- Ensure Swagger syntax is valid

### Authentication issues

- Verify Bearer token is correctly formatted
- Ensure JWT token hasn't expired
- Check that the token corresponds to a valid user

## Resources

- [Swagger/OpenAPI Documentation](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)

## Next Steps

1. Test all endpoints using Swagger UI
2. Gather feedback from team members
3. Continue updating documentation as new features are added
4. Consider adding post-man collection export if needed

---

**Last Updated**: February 17, 2026
**Swagger Version**: OpenAPI 3.0.0
