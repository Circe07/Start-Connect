const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// --- 1. CONFIGURACIÓN DE TU PROYECTO ---
// Obtén esta configuración desde la Consola de Firebase -> Configuración del proyecto -> Tus apps
const firebaseConfig = {
  apiKey: "AIzaSyASqdBdLa1OIRZaj9F3xgSuAgjf6qrfVb8",
  authDomain: "startandconnect-c44b2.firebaseapp.com",
  projectId: "startandconnect-c44b2",
  // ... otros campos
};

// --- 2. CREDENCIALES DEL USUARIO DE PRUEBA ---
const USER_EMAIL = "test@gmail.com"; // Debe ser un usuario existente en Firebase Auth
const USER_PASSWORD = "A53838081a*";

// --- 3. PROCESO DE AUTENTICACIÓN ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD)
  .then((userCredential) => {
    const user = userCredential.user;

    // Solicitar el ID Token
    user.getIdToken(true).then(idToken => {
      console.log("-----------------------------------------");
      console.log("¡TOKEN JWT OBTENIDO CON ÉXITO!");
      console.log(idToken); // <--- ESTE ES EL TOKEN QUE COPIARÁS A POSTMAN
      console.log("-----------------------------------------");
      process.exit();
    }).catch(error => {
      console.error("Error al obtener el ID Token:", error);
    });
  })
  .catch((error) => {
    console.error("Error de inicio de sesión:", error.message);
  });