// ---PREPARACION DE MOCKS---

// IMPORTANTE: Usamos 'var' para el hoisting y evitar el "ReferenceError"
// Simulamos una instancia de una aplicacion Firebase ya inicializada
var mockApp = {};

// MOCK para firebase-admin/firestore
// Simulamos el submódulo que exporta 'getFirestore'
var mockFirestore = {
    getFirestore: jest.fn(() => ({})), // getFirestore devuelve un objeto vacío (simulando la DB)
};

// MOCK para firebase-admin
var mockAdmin = {
    // Simula la funcion de Inicializacion
    initializeApp: jest.fn(() => mockApp),
    // Simula la funcion para recuperar una app ya existente
    app: jest.fn(() => mockApp),
    // Simula la lista de aplicaciones -> logica condicional
    apps: [],
};

// Sobrescribimos el módulo principal, indicamos que utilize el objeto falso
jest.mock('firebase-admin', () => mockAdmin);

// Sobrescribimos el submódulo de Firestore (referencia a DB)
jest.mock('firebase-admin/firestore', () => mockFirestore);

// =========================================================================

// Cargamos el módulo a probar después de configurar todos los mocks
// El código de src/firebase.js se ejecuta aquí
const { db, admin } = require('../../src/firebase');


describe('Pruebas unitarias para src/firebase.js', () => {

    test('1. Debería inicializar firebase Admin SDK y exportar las instancias', () => {

        // Verificamos que initializeApp se haya llamado una vez
        expect(mockAdmin.initializeApp).toHaveBeenCalledTimes(1);

        // Verificamos que getFirestore se haya llamado una vez (del mock del submódulo)
        expect(mockFirestore.getFirestore).toHaveBeenCalledTimes(1);

        // Verificamos que la instancia 'admin' se exporte correctamente
        expect(admin).toBe(mockAdmin);

        // Verificamos que la instancia 'db' se exporta y sea un objeto
        // (Esperamos el objeto vacío de nuestro mockFirestore.getFirestore)
        expect(typeof db).toBe('object');
        expect(db).toEqual(({}));

        // Verificamos que se llame con la app mock y el nombre de la base de datos
        expect(mockFirestore.getFirestore).toHaveBeenCalledWith(mockApp, "appbase");
    });

    test('2. Debería usar admin.initializeApp() cuando aun no esta inicializado', () => {

        // Verificamos que se intentó inicializar y no solo se recuperó la app existente
        expect(mockAdmin.app).not.toHaveBeenCalled();
        expect(mockAdmin.initializeApp).toHaveBeenCalled();
    });
});
