// src/index.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { setGlobalOptions } = require('firebase-functions/v2/options');
const { onRequest } = require('firebase-functions/v2/https');

setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 10,
});

const app = require('./src/app');

exports.api = onRequest(app);
