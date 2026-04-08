/**
 * This file is used to configure the express server
 * Author: Unai Villar
 */

const express = require('express');
const cors = require('cors');
const logger = require('firebase-functions/logger');
const app = express();
const errorHandler = require('./middleware/errorHandler');

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
const activitiesRoutes = require('./routes/activities');
const swipesRoutes = require('./routes/swipes');
const matchesRoutes = require('./routes/matches');
const { createAuthV1Router } = require('./transport/http/authV1Router');
const { createRefreshSessionUseCase } = require('./domain/auth/refreshSessionUseCase');
const { createLoginSessionUseCase } = require('./domain/auth/loginSessionUseCase');
const { createGetMeUseCase } = require('./domain/auth/getMeUseCase');
const { createLogoutUseCase } = require('./domain/auth/logoutUseCase');
const { createFirebaseTokenGateway } = require('./data/auth/firebaseTokenGateway');
const { createFirebaseAuthGateway } = require('./data/auth/firebaseAuthGateway');
const { createUsersV1Router } = require('./transport/http/usersV1Router');
const { createGetMyProfileUseCase } = require('./domain/users/getMyProfileUseCase');
const { createFirestoreUserRepository } = require('./data/users/firestoreUserRepository');

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
app.use(express.json());

/**
 * Public routes
 * This routes don't need authentication
 */
app.use('/auth', authRoutes);
app.use(
  '/api/v1/auth',
  createAuthV1Router({
    loginSession: createLoginSessionUseCase({
      tokenGateway: createFirebaseTokenGateway(),
    }),
    refreshSession: createRefreshSessionUseCase({
      tokenGateway: createFirebaseTokenGateway(),
    }),
    getMe: createGetMeUseCase({
      authGateway: createFirebaseAuthGateway(),
    }),
    logoutSession: createLogoutUseCase({
      authGateway: createFirebaseAuthGateway(),
    }),
  })
);
app.use('/admin', adminRoutes);
app.use('/users', usersRoutes);
app.use(
  '/api/v1/users',
  createUsersV1Router({
    getMyProfile: createGetMyProfileUseCase({
      userRepository: createFirestoreUserRepository(),
    }),
  })
);

/**
 * Private routes
 * This routes need authentication
 */
app.use('/hobbies', hobbiesRoutes);
app.use('/contacts', contactsRoutes);
app.use('/groups', groupsRoutes);
app.use('/groupsRequests', groupsRequestsRoutes);
app.use('/maps', mapsRoutes);
app.use('/centers', centersRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/activities', activitiesRoutes);
app.use('/swipes', swipesRoutes);
app.use('/matches', matchesRoutes);

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

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
