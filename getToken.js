/**
 * Script para obtener un ID Token válido de Firebase Auth (para pruebas en Postman).
 * Ejecutar con: node getToken.js
 */

const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getIdToken } = require("firebase/auth");

// --- CONFIGURACIÓN DEL PROYECTO ---
const firebaseConfig = {
  apiKey: "AIzaSyASqdBdLa1OIRZaj9F3xgSuAgjf6qrfVb8",
  authDomain: "startandconnect-c44b2.firebaseapp.com",
  projectId: "startandconnect-c44b2",
};

// --- CREDENCIALES DE USUARIO DE PRUEBA ---
const USER_EMAIL = "test@gmail.com"; // Usuario existente en Firebase Authentication
const USER_PASSWORD = "A53838081a*"; // Contraseña correcta

// --- AUTENTICACIÓN Y TOKEN ---
(async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log("Iniciando sesión...");

    const userCredential = await signInWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD);
    const user = userCredential.user;

    // Forzamos actualización del token
    const idToken = await user.getIdToken(true);

    console.log("-----------------------------------------");
    console.log("¡TOKEN JWT OBTENIDO CON ÉXITO!");
    console.log(`UID del Usuario: ${user.uid}`);
    console.log("\nCOPIA ESTE TOKEN EN POSTMAN (Authorization: Bearer ...):");
    console.log(idToken);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Error al obtener el token:", error.message);
    if (error.code === "auth/invalid-login-credentials") {
      console.error("Verifica email y contraseña en Firebase Authentication.");
    }
    process.exit(1);
  }
})();
