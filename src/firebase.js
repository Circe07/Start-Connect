// src/firebase.js
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// Carga las credenciales directamente desde el archivo JSON
const serviceAccount = require("./start-and-connect-2-firebase-adminsdk-fbsvc-9aa7e9508b.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore();

module.exports = {
  db,
};