/**
 * This file is used to configure the express server
 * Author: Unai Villar
 */

const express = require('express');
const cors = require('cors');
const logger = require('firebase-functions/logger');
const helmet = require('helmet');
const app = express();
const errorHandler = require('./middleware/errorHandler');
const { requestContext } = require('./middleware/requestContext');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const { apiVersionV1 } = require('./middleware/apiVersionV1');
const { validateEnv } = require('./config/validateEnv');
const { readRateLimit, writeRateLimit } = require('./middleware/rateLimit');
const { observabilityLogger } = require('./middleware/observability');

// Required behind Firebase/Google proxy for correct client IP detection
// (e.g. express-rate-limit + X-Forwarded-For).
app.set('trust proxy', 1);

/**
 * Import all routes here
 * TODO: Add more routes in the future
 */
const contactsRoutes = require('./routes/contacts');
const groupsRoutes = require('./routes/groups');
const groupsRequestsRoutes = require('./routes/groupsRequests');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const hobbiesRoutes = require('./routes/hobbies');
const usersRoutes = require('./routes/users');
const mapsRoutes = require('./routes/maps');
const centersRoutes = require('./routes/centers');
const bookingsRoutes = require('./routes/bookings');
const experienceBookingsRoutes = require('./routes/experienceBookings');
const experiencesRoutes = require('./routes/experiences');
const feedbackRoutes = require('./routes/feedback');
const hostsRoutes = require('./routes/hosts');
const referralsRoutes = require('./routes/referrals');
const activitiesRoutes = require('./routes/activities');
const swipesRoutes = require('./routes/swipes');
const matchesRoutes = require('./routes/matches');

validateEnv();

/**
 * Global middleware here
 */
const corsOriginsRaw = process.env.CORS_ORIGINS || '';
const corsOrigins = corsOriginsRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Server-to-server / curl / postman without Origin header
      if (!origin) return callback(null, true);

      // If no allowlist configured, allow (dev-friendly default)
      if (corsOrigins.length === 0) return callback(null, true);

      if (corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS: origin not allowed'));
    },
  })
);
app.use(requestContext);
app.use(observabilityLogger);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());
app.use('/api/v1', apiVersionV1);

/**
 * Public routes
 * This routes don't need authentication
 */
app.use('/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/users', usersRoutes);
app.use('/api/v1/users', usersRoutes);

/**
 * Private routes
 * This routes need authentication
 */
app.use('/hobbies', hobbiesRoutes);
app.use('/api/v1/hobbies', hobbiesRoutes);
app.use('/contacts', contactsRoutes);
app.use('/api/v1/contacts', contactsRoutes);
app.use('/groups', groupsRoutes);
app.use('/api/v1/groups', writeRateLimit, groupsRoutes);
app.use('/groupsRequests', groupsRequestsRoutes);
app.use('/api/v1/groupsRequests', groupsRequestsRoutes);
app.use('/maps', mapsRoutes);
app.use('/api/v1/maps', mapsRoutes);
app.use('/centers', centersRoutes);
app.use('/api/v1/centers', centersRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/api/v1/bookings', bookingsRoutes);
app.use('/experience-bookings', experienceBookingsRoutes);
app.use('/api/v1/experience-bookings', experienceBookingsRoutes);
app.use('/experiences', experiencesRoutes);
app.use('/api/v1/experiences', experiencesRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/hosts', hostsRoutes);
app.use('/api/v1/hosts', hostsRoutes);
app.use('/referrals', referralsRoutes);
app.use('/api/v1/referrals', referralsRoutes);
app.use('/activities', activitiesRoutes);
app.use('/api/v1/activities', activitiesRoutes);
app.use('/swipes', swipesRoutes);
app.use('/api/v1/swipes', swipesRoutes);
app.use('/matches', matchesRoutes);
app.use('/api/v1/matches', matchesRoutes);

/**
 * Default route to check if API is working
 */
app.get('/', (_, res) => {
  logger.info('API Start&Connect in execution');
  res.status(200).json({
    status: 'ok',
    message: 'Start&Connect API (Firebase Functions v2) in execution',
  });
});

/**
 * Healthcheck endpoint
 */
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
  });
});

app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
