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

    // Solicitar el ID Token (true fuerza la renovación si es necesario)
    user.getIdToken(true).then(idToken => {
      console.log("-----------------------------------------");
      console.log("¡TOKEN JWT OBTENIDO CON ÉXITO!");
      console.log(`UID del Usuario: ${user.uid}`);
      console.log("\nCOPIA EL SIGUIENTE TOKEN EN POSTMAN:");
      console.log(idToken); // <--- ESTE ES EL TOKEN QUE COPIARÁS A POSTMAN
      console.log("-----------------------------------------");
      process.exit(0);
    }).catch(error => {
      console.error("Error al obtener el ID Token:", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("Error de inicio de sesión:", error.message);
    console.error("Asegúrate de que el usuario exista y las credenciales sean correctas.");
    process.exit(1);
  });
