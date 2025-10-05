require("dotenv").config();
try {
    const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    console.log("Credenciales cargadas correctamente:", credentials.project_id);
} catch (e) {
    console.error("Error al analizar las credenciales JSON:", e);
}