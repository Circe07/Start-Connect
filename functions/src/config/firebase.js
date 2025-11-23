const admin = require("firebase-admin");
const {
  getFirestore,
  FieldValue
} = require("firebase-admin/firestore");

const PROJECT_ID = "startandconnect-c44b2";
const DATABASE_ID = "startandconnect-eur3";

// Inicializar Admin SOLO una vez
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
  });
  console.log("🔥 Admin SDK Inicializado (Producción/Local)");
}

const db = getFirestore(admin.app(), DATABASE_ID);

console.log(`🔥 Conectado a Firestore database: ${DATABASE_ID}`);
console.log("🔥 FieldValue en firebase.js:", FieldValue);

module.exports = { admin, db, FieldValue };
