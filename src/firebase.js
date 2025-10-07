// src/firebase.js
const admin = require("firebase-admin");
// ¡Importa getFirestore directamente desde el submódulo de firestore!
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require("./startandconnect-c44b2-firebase-adminsdk-fbsvc-e8f8647573.json");

// Inicializa la app de Firebase, y guarda la referencia
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "startandconnect-c44b2",
});

// Usa getFirestore, pasándole la app inicializada y el ID de la base de datos
const db = getFirestore(firebaseApp, "appbase");

module.exports = { db };
