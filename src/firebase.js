const admin = require("firebase-admin");
// Importamos getFirestore sin opciones de base de datos extra aquí
const { getFirestore } = require('firebase-admin/firestore');

let firebaseApp;
const PROJECT_ID = "startandconnect-c44b2";

// INICIALIZACIÓN CONDICIONAL: Detecta el entorno
if (process.env.NODE_ENV === 'production' || process.env.FUNCTIONS_EMULATOR === 'true') {
  // ENTORNO DE PRODUCCIÓN (Cloud Functions) o EMULADOR: Inicialización automática
  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      projectId: PROJECT_ID,
    });
    console.log(`🔥 Admin SDK Inicializado (Automático/Producción).`);
  } else {
    firebaseApp = admin.app();
  }
} else {
  if (admin.apps.length === 0) {
    // Verifica que el archivo JSON esté en la ruta correcta:
    const serviceAccount = require("./startandconnect-c44b2-1e2ebf20fbce.json");
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: PROJECT_ID,
    });
    console.log(`🔥 Admin SDK Inicializado correctamente.`);
  } else {
    firebaseApp = admin.app();
  }
}

const db = getFirestore(firebaseApp, "appbase");


console.log(`🔥 Conectado al proyecto: ${PROJECT_ID} con ID de Base de Datos por defecto`);

module.exports = { db, admin };
