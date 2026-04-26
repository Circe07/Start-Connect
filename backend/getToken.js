/**
 * Script para obtener un ID Token válido de Firebase Auth (para pruebas en Postman).
 * Ejecutar con: node getToken.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// --- CONFIGURACIÓN DE TU PROYECTO FIREBASE ---
const firebaseConfig = {
  apiKey: 'AIzaSyASqdBdLa1OIRZaj9F3xgSuAgjf6qrfVb8',
  authDomain: 'startandconnect-c44b2.firebaseapp.com',
  projectId: 'startandconnect-c44b2',
};

// --- CREDENCIALES DE USUARIO DE PRUEBA ---
const USERS = [
  { email: 'startandconnect@gmail.com', password: 'A53838081a*' },
  { email: 'unaidevcoding@gmail.com', password: '993000' },
  { email: 'admin@gmail.com', password: '123455' },
  { email: 'test@gmail.com', password: 'A53838081a*' },
  { email: 'test2@gmail.com', password: '123456' },
];

// --- FUNCIÓN PRINCIPAL ---
(async () => {
  const { getIdToken } = await import('firebase/auth');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  for (const user of USERS) {
    try {
      console.log(`\n🔐 Iniciando sesión como ${user.email}...`);

      const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);

      const idToken = await userCredential.user.getIdToken(true);

      console.log('-----------------------------------------');
      console.log(`✅ TOKEN OBTENIDO PARA: ${user.email}`);
      console.log(`UID: ${userCredential.user.uid}`);
      console.log('\nCopia este token en Postman:');
      console.log(idToken);
      console.log('-----------------------------------------\n');
    } catch (error) {
      console.error(`❌ Error con ${user.email}:`, error.message);
      if (error.code === 'auth/invalid-login-credentials') {
        console.error('⚠️ Verifica email y contraseña en Firebase Authentication.');
      }
    }
  }

  process.exit(0);
})();
