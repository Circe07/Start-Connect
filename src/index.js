 functions = require("firebase-functions");
const app = require("./app"); // Importa tu aplicación Express desde app.js

// La función debe exportarse con el mismo nombre ('api') que se usa
// en la sección 'rewrites' de firebase.json.
// functions.https.onRequest(app) es el adaptador que convierte Express
// en una Cloud Function HTTP.
exports.api = functions.https.onRequest(app);