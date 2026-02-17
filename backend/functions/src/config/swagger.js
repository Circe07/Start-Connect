/**
 * Swagger/OpenAPI configuration for Start&Connect API
 * This file configures the Swagger UI documentation
 */

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Start&Connect API",
            version: "1.0.0",
            description: "API documentation for Start&Connect - A platform to connect people with shared hobbies and interests",
            contact: {
                name: "Start&Connect Team",
                email: "support@startconnect.com"
            }
        },
        servers: [
            {
                url: "http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api",
                description: "Local Firebase Emulator"
            },
            {
                url: "https://europe-west1-startandconnect-c44b2.cloudfunctions.net/api",
                description: "Production Server"
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT token for authentication"
                }
            },
            schemas: {
                User: {
                    type: "object",
                    required: ["uid", "email", "displayName"],
                    properties: {
                        uid: {
                            type: "string",
                            description: "User unique identifier from Firebase"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "User email address"
                        },
                        displayName: {
                            type: "string",
                            description: "User display name"
                        },
                        photoURL: {
                            type: "string",
                            description: "User profile picture URL"
                        },
                        bio: {
                            type: "string",
                            description: "User biography"
                        },
                        age: {
                            type: "integer",
                            description: "User age"
                        },
                        location: {
                            type: "string",
                            description: "User location/city"
                        },
                        hobbies: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Array of hobby IDs"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Account creation timestamp"
                        }
                    }
                },
                Hobby: {
                    type: "object",
                    required: ["id", "name"],
                    properties: {
                        id: {
                            type: "string",
                            description: "Hobby unique identifier"
                        },
                        name: {
                            type: "string",
                            description: "Hobby name"
                        },
                        icon: {
                            type: "string",
                            description: "Hobby icon URL or emoji"
                        },
                        description: {
                            type: "string",
                            description: "Hobby description"
                        }
                    }
                },
                Group: {
                    type: "object",
                    required: ["id", "name", "creatorId"],
                    properties: {
                        id: {
                            type: "string",
                            description: "Group unique identifier"
                        },
                        name: {
                            type: "string",
                            description: "Group name"
                        },
                        description: {
                            type: "string",
                            description: "Group description"
                        },
                        creatorId: {
                            type: "string",
                            description: "User ID of group creator"
                        },
                        members: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            description: "Array of member user IDs"
                        },
                        hobby: {
                            type: "string",
                            description: "Associated hobby ID"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Group creation timestamp"
                        }
                    }
                },
                Chat: {
                    type: "object",
                    required: ["id", "participants"],
                    properties: {
                        id: {
                            type: "string",
                            description: "Chat unique identifier"
                        },
                        participants: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            minItems: 2,
                            description: "Array of participant user IDs"
                        },
                        lastMessage: {
                            type: "string",
                            description: "Last message content"
                        },
                        lastMessageTime: {
                            type: "string",
                            format: "date-time",
                            description: "Timestamp of last message"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Chat creation timestamp"
                        }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false
                        },
                        message: {
                            type: "string",
                            description: "Error message"
                        },
                        error: {
                            type: "string",
                            description: "Error details"
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: "Authentication",
                description: "Authentication endpoints for user login/registration"
            },
            {
                name: "Users",
                description: "User profile management endpoints"
            },
            {
                name: "Hobbies",
                description: "Hobby management and retrieval endpoints"
            },
            {
                name: "Groups",
                description: "Group creation and management endpoints"
            },
            {
                name: "Chat",
                description: "Chat messaging endpoints"
            },
            {
                name: "Contacts",
                description: "User contacts/friends management"
            },
            {
                name: "Bookings",
                description: "Center booking management"
            },
            {
                name: "Centers",
                description: "Recreation centers information"
            },
            {
                name: "Posts",
                description: "User posts and feed"
            },
            {
                name: "Admin",
                description: "Admin operations"
            }
        ]
    },
    apis: [
        "./src/routes/auth.js",
        "./src/routes/users.js",
        "./src/routes/hobbies.js",
        "./src/routes/groups.js",
        "./src/routes/chat.js",
        "./src/routes/contacts.js",
        "./src/routes/bookings.js",
        "./src/routes/centers.js",
        "./src/routes/posts.js",
        "./src/routes/admin.js",
        "./src/routes/friends.js",
        "./src/routes/maps.js",
        "./src/routes/groupsRequests.js"
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
