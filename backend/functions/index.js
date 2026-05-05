// src/index.js
// Load the same .env file the Firebase CLI uses for Gen2 (`backend/functions/.env`).
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2/options');
const { onRequest } = require('firebase-functions/v2/https');

const authApiKey = defineSecret('AUTH_API_KEY');

setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 11,
});

const app = require('./src/app');

exports.api = onRequest(
  {
    secrets: [authApiKey],
  },
  app
);
