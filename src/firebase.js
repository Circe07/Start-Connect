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
  // Verifica que el archivo JSON esté en la ruta correcta:
  const serviceAccount = require("./startandconnect-c44b2-firebase-adminsdk-fbsvc-84e3a7bf95.json");

  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: PROJECT_ID,
    });
    console.log(`🔥 Admin SDK Inicializado (Local/Desarrollo con Clave).`);
  } else {
    firebaseApp = admin.app();
  }
}

const db = getFirestore(firebaseApp);


console.log(`🔥 Conectado al proyecto: ${PROJECT_ID} con ID de Base de Datos por defecto`);

module.exports = { db, admin };
