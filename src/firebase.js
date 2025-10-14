// src/firebase.js
const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require("./startandconnect-c44b2-firebase-adminsdk-fbsvc-e8f8647573.json");

// Inicializa la app de Firebase
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "startandconnect-c44b2",
});

// Usa getFirestore, pasándole la app inicializada y el ID de la base de datos
// (Asumiendo que "appbase" es el ID correcto de tu DB)
const db = getFirestore(firebaseApp, "appbase");

// ----------------------------------------------------------------------
// 🚨 SOLUCIÓN: Exportar tanto 'db' como el objeto 'admin' inicializado.
module.exports = { db, admin }; 
// ----------------------------------------------------------------------
