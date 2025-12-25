/**
 * Firebase configuration
 * This file is used to configure Firebase...
 * Is use with MultiDB (don't use data base default)
 * @author Unai Villar
 *
 */

const admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Credentials from Firebase
 * PROJECT_ID: Project ID from Firebase
 * DATABASE_ID: Database ID from Firebase
 */
const PROJECT_ID = "startandconnect-c44b2";
const DATABASE_ID = "startandconnect-eur3";
const STORAGE_BUCKET = "startandconnect-c44b2.firebasestorage.app";

// Initialize Firebase in production
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
  });
  console.log("🔥 Admin SDK Inicializado (Producción)");
}

const db = getFirestore(admin.app(), DATABASE_ID);

console.log(`🔥 Conectado a Firestore database: ${DATABASE_ID}`);
console.log(`🔥 Storage bucket configurado: ${STORAGE_BUCKET}`);
console.log("🔥 FieldValue en firebase.js:", FieldValue);

module.exports = { admin, db, FieldValue };
