/**
 * This file is used to configure the express server
 * Author: Unai Villar
 */

const express = require("express");
const cors = require("cors");
const logger = require("firebase-functions/logger");
const app = express();

/**
 * Import all routes here
 * TODO: Add more routes in the future
 */
const contactsRoutes = require("./routes/contacts");
const groupsRoutes = require("./routes/groups");
const groupsRequestsRoutes = require("./routes/groupsRequests");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const hobbiesRoutes = require("./routes/hobbies");
const usersRoutes = require("./routes/users");
const mapsRoutes = require("./routes/maps");
const centersRoutes = require("./routes/centers");
const bookingsRoutes = require("./routes/bookings");
const chatRoutes = require("./routes/chat");
const friendsRoutes = require("./routes/friends");
const postsRoutes = require("./routes/posts");

/**
 * Global middleware here
 */
app.use(cors({ origin: true }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

/**
 * Swagger API Documentation
 */
let swaggerSpecs;
try {
  swaggerSpecs = require("./config/swagger");
  logger.info("✅ Swagger specs loaded successfully");
} catch (error) {
  logger.warn("⚠️  Warning: Could not load Swagger specs:", error.message);
  swaggerSpecs = {};
}

// Simple health check endpoint for Swagger
app.get("/swagger-health", (req, res) => {
  res.json({ status: "ok", message: "Swagger is ready" });
});

// Serve Swagger specs as JSON
app.get("/swagger.json", (req, res) => {
  res.json(swaggerSpecs);
});

// Serve Swagger UI from CDN with simple inline HTML
app.get("/swagger-ui", (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Start&Connect API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.52.0/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.52.0/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.52.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "./swagger.json",
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    }
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

/**
 * Public routes
 * This routes don't need authentication
 */
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/users", usersRoutes);

/**
 * Private routes
 * This routes need authentication
 */
app.use("/hobbies", hobbiesRoutes);
app.use("/contacts", contactsRoutes);
app.use("/groups", groupsRoutes);
app.use("/groupsRequests", groupsRequestsRoutes);
app.use("/maps", mapsRoutes);
app.use("/centers", centersRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/chats", chatRoutes);
app.use("/friends", friendsRoutes);
app.use("/posts", postsRoutes);

/**
 * Default route to check if API is working
 */
app.get("/", (_, res) => {
  logger.info("API Start&Connect in execution");
  res.status(200).json({
    status: "ok",
    message: "Start&Connect API (Firebase Functions v2) in execution",
  });
});

/**
 * Swagger API Documentation endpoint
 */
app.get("/docs", (_, res) => {
  res.status(200).json({
    swagger: "Swagger UI is configured",
    url: "/api-docs",
    accessUrl: "http://127.0.0.1:5001/start-connect-13b69/europe-west1/api/api-docs"
  });
});

module.exports = app;
