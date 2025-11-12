// functions/src/config/firebase.js
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const PROJECT_ID = "startandconnect-c44b2"; // proyecto
const DATABASE_ID = "startandconnect-eur3"; // bd

let app;

// Inicializa Admin SDK según el entorno
if (admin.apps.length === 0) {
  app = admin.initializeApp();
  console.log("🔥 Admin SDK Inicializado (Producción)");
} else {
  app = admin.app();
}

// Conectar a la base Firestore específica
const db = getFirestore(app, DATABASE_ID);

console.log(`🔥 Conectado a Firestore del proyecto: ${PROJECT_ID} (DB: ${DATABASE_ID})`);

module.exports = { db, admin };
