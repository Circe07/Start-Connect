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
const paymentRoutes = require("./routes/payment");

/**
 * Global middleware here
 */
app.use(cors({ origin: true }));
app.use(express.json({
  limit: "15mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

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
app.use("/payment", paymentRoutes);

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

module.exports = app;
