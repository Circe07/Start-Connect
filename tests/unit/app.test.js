// npm install --save-dev jest supertest
const app = require('/src/app'); // Importamos el modulo app
const request = require('supertest'); // Importamos el modulo supertest

// ----------------------------------------------------------------------
// MOCKS DE CONFIGURACION
// ----------------------------------------------------------------------
jest.mock('/src/routes/users.js', () => {
    const express = require('express');
    const router = express.Router();
    // Ruta de prueba -> solo verifica la carga
    router.get('/api/users/check', (req, res) => res.status(200).send('Users Router Loaded'));
    return router;
});
jest.mock('/src/routes/groups.js', () => {
    const express = require('express');
    const router = express.Router();
    // Ruta de prueba -> solo verifica la carga
    router.get('/api/groups/check', (req, res) => res.status(200).send('Groups Router Loaded'));
    return router;
})
// =============================================================================================


describe('Configuracion base de la aplicacion Express(app.js)', () => {

    // 1.- COMPROVAMOS QUE LA INSTANCIA APP SE EXPORTA CORRECTAMENTE
    test('Debe exportar la instancia de la aplicacon express', () => {

        // Comrpovamos la exportacion
        expect(app).toBeDefined();

        // Verificamos que la aplicacion app sea una funcion
        expect(typeof app).toBe('function');
    });

    // 2.- AL INSERTAR UNA RUTA NO DEFINIDA RESPONDER CON EL CODIGO "404"
    test('GET a una ruta no definida debe devolver 404', async () => {

        // Simulamos la respuesta a la ruta no definida
        const response = await request(app).get('/ruta-inexistente');

        // Debe responder con el codigo 404 "NOT FOUND"
        expect(response.statusCode).toBe(404);
    });


    // 3.- COMPROVAR QUE LA RUTA USERS ESTA CARGADA CORRECTAMENTE A LA APP
    test('La ruta USERS debe cargar correctamente en express y responder al endpoint simulado', async () => {
        // Simulamos la ruta del MOCK
        const response = await request(app).get('/api/users/check');

        // Responde con el codigo 200
        expect(response.statusCode).toBe(200);
        // Responde con el mensaje "USERS..."
        expect(response.text).toBe('Users Router Loaded');
    })

    // 4.- COMPROVAR QUE LA RUTA GROUPS ESTA CARGADA CORRECTAMENTE A LA APP
    test('La ruta GROUPS debe cargar correctamente en express y responder al endpoint simulado', async () => {

        // Simulamos la ruta del MOCK
        const response = await request(app).get('/api/groups/check');

        // Responde con el codigo 200
        expect(response.statusCode).toBe(200);
        // Responde con el mensaje "GROUPS..."
        expect(response.text).toBe('Groups Router Loaded');
    });
})