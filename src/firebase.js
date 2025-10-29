// src/firebase.js
const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');

let firebaseApp;

// 🚨 INICIALIZACIÓN CONDICIONAL: Detecta el entorno
if (process.env.NODE_ENV === 'production' || process.env.FUNCTIONS_EMULATOR === 'true') {
  // ENTORNO DE PRODUCCIÓN (Cloud Functions) o EMULADOR: Inicialización automática
  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp(); 
    console.log("🔥 Admin SDK Inicializado (Automático/Producción).");
  } else {
    firebaseApp = admin.app();
  }
} else {
  // ENTORNO LOCAL (npm run dev): Usar clave de servicio
  // Asegúrate de que el archivo JSON esté en la ruta correcta
  // NOTA: Asegúrate de que este archivo NO esté en tu repositorio Git.
  const serviceAccount = require("./startandconnect-c44b2-firebase-adminsdk-fbsvc-e6b1757d38.json"); 
  
  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "startandconnect-c44b2", // Opcional si está en el JSON
    });
    console.log("🔥 Admin SDK Inicializado (Local/Desarrollo con Clave).");
  } else {
    firebaseApp = admin.app();
  }
}

// 🚨 CORRECCIÓN CLAVE: Inicializa Firestore usando la base de datos por defecto.
// Hemos eliminado el argumento "appbase" que causaba el error 5 NOT_FOUND.
const db = getFirestore(firebaseApp); 

module.exports = { db, admin };




