const functions = require("firebase-functions");
const app = require("./app"); // Importa tu aplicación Express

// Determina si estamos en un entorno de desarrollo local
const isLocal = process.env.NODE_ENV !== 'production' && process.env.FUNCTIONS_EMULATOR !== 'true';

if (isLocal) {
  // 🚨 INICIALIZACIÓN LOCAL: Inicia el servidor Express directamente
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local Express escuchando en http://localhost:${PORT}`);
  });
}

// 🚨 EXPORTACIÓN DE CLOUD FUNCTION: Solo se usa cuando Firebase lo despliega
// Exporta la aplicación Express bajo el nombre 'api' para Firebase Hosting/Functions
exports.api = functions.https.onRequest(app);

// Este console.log es opcional, pero ayuda a confirmar que el script termina si no es local
console.log("Índice de funciones cargado."); 
