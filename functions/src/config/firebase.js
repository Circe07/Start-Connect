// functions/src/config/firebase.js
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = "startandconnect-c44b2";
const DATABASE_ID = "startandconnect-eur3";  // Tu única database

let app;

// Inicializar Admin SDK
if (!admin.apps.length) {
  app = admin.initializeApp({
    projectId: PROJECT_ID,
  });
  console.log("🔥 Admin SDK Inicializado (Producción)");
} else {
  app = admin.app();
}

// Conectar a tu database real (MultiDB)
const db = getFirestore(app, DATABASE_ID);

console.log(`🔥 Conectado a Firestore database: ${DATABASE_ID}`);

module.exports = { admin, db };
