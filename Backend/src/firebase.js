import admin from "firebase-admin";
import dotenv from "dotenv";
import { getFirestore } from "firebase-admin/firestore";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
});

const db = getFirestore();
db.settings({ 
  databaseId: "appbasedate"  // nombre de tu base de datos
});

export default db;
