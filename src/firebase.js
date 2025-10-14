// src/firebase.js

const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');


let firebaseApp;

// 🚨 ESTA ES LA ÚNICA INICIALIZACIÓN VÁLIDA PARA CLOUD FUNCTIONS (AUTOMÁTICA):
if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp(); 
} else {
    firebaseApp = admin.app();
}

const db = getFirestore(firebaseApp, "appbase");

module.exports = { db, admin };