# StartAndConnect - Group Management API (Node.js / Express / Firebase)

## English

### Project Overview

This project provides a robust RESTful API for managing groups and user memberships, built with Node.js, Express, and Cloud Firestore. It covers core functionalities for creating, managing, and interacting with user groups within an application context.

### Features

The API currently supports the following functionalities:

*   **Group Creation (`POST /createGroup`)**: Authenticated users can create new groups, specifying name, description, city, and privacy (`isPublic`). The creator is automatically the `ownerId` and first member.
*   **Join Group (`POST /joinGroup`)**: Authenticated users can join existing groups. The `memberCount` is atomically incremented, and the user's ID is added to the `members` array.
*   **Leave Group (`POST /leaveGroup`)**: Authenticated users can leave a group. Special logic applies if the owner leaves: if they are the last member, the group is deleted; otherwise, they must designate a `newOwnerId` among existing members.
*   **Remove Member (`POST /groups/:groupId/removeMember`)**: Group owners can remove other members from their group.
*   **Transfer Ownership (`POST /groups/:groupId/transferOwnership`)**: Group owners can transfer the ownership of their group to another existing member.
*   **Update Group Information (`PATCH /groups/:groupId`)**: Group owners can update details like name, description, city, and `isPublic` status.
*   **Get Group Details (`GET /groups/:groupId`)**: Authenticated members of a group can retrieve all details of that specific group, including its member list.
*   **Get User's Groups (`GET /myGroups`)**: Authenticated users can retrieve a list of all groups they are currently a member of.
*   **List Public Groups (`GET /publicGroups?limit=X&startAfterId=Y`)**: Retrieve a paginated list of all publicly visible groups. No authentication required for listing.

### Prerequisites

Before deploying or running this project, ensure you have the following:

*   **Node.js (LTS version recommended)** and `npm` or `yarn` installed.
*   A **Firebase Project** set up in the [Firebase Console](https://console.firebase.google.com/).
*   **Cloud Firestore** enabled in your Firebase Project.
*   **Firebase Authentication** enabled (Email/Password provider, at minimum, for testing).
*   A **Firebase Admin SDK Service Account Key** JSON file.
    *   Go to Firebase Console > Project settings > Service accounts.
    *   Click "Generate new private key" and download the JSON file.
    *   **Rename this file to `serviceAccountKey.json`** (or adjust the path in `firebase.js`) and place it in the root of your project. **CRITICALLY, ensure this file is included in your `.gitignore` and never committed to version control.**
*   **Environment Variables:** You might need to set up an `.env` file for other sensitive information (e.g., your Firebase Web API Key for `signInWithPassword` testing if not hardcoded). Ensure `.env` is also in `.gitignore`.
*   **Firestore Indexes:** For efficient querying, especially for paginated public groups, you MUST create the following composite index in your Firestore console:
    *   `collection: groups`
    *   `fields: isPublic (ascending), createdAt (descending), __name__ (ascending)`
    *   Firebase will usually provide a direct link in the console error if an index is missing.

### Installation & Local Setup

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:Circe07/Start-Connect.git # Or use HTTPS URL
    cd Start-Connect
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Place your `serviceAccountKey.json`** in the project root.
4.  **Create a `.env` file** in the project root if needed (e.g., `PORT=3000`).
5.  **Run the server locally:**
    ```bash
    npm start
    # or
    yarn start
    ```
    The API will typically run on `http://localhost:3000` (or your configured PORT).

### Deployment

This API can be deployed to various Node.js hosting environments, such as:

*   **Firebase Cloud Functions:** Recommended for tight integration with Firebase. Each endpoint can be a separate HTTP function, or you can expose the Express app through a single function.
*   **Firebase App Hosting:** Ideal for deploying full-stack web apps, including Node.js backends.
*   **Other Cloud Providers:** Like Google Cloud Run, Heroku, AWS Lambda, etc.

**Basic Firebase Cloud Functions Deployment Example:**

1.  **Initialize Firebase in your project:**
    ```bash
    firebase init functions
    ```
    Follow the prompts, select your Firebase project, and choose JavaScript/TypeScript for functions.
2.  **Adjust `functions/index.js` (or `functions/src/index.ts`):**
    You'll need to export your Express `router` as an HTTP function.
    ```javascript
    // functions/index.js (or functions/src/index.ts)
    const functions = require('firebase-functions');
    const express = require('express');
    const cors = require('cors'); // If your frontend is on a different domain

    const apiRoutes = require('./apiRoutes'); // Assuming your router is in apiRoutes.js

    const app = express();
    app.use(cors({ origin: true })); // Enable CORS for all requests
    app.use('/api', apiRoutes); // Mount your API router under the /api path

    exports.app = functions.https.onRequest(app);
    ```
3.  **Deploy your functions:**
    ```bash
    firebase deploy --only functions
    ```
    Your API endpoints will then be accessible via `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/app/api/YOUR_ENDPOINT`.

---

## Español

### Visión General del Proyecto

Este proyecto proporciona una API RESTful robusta para la gestión de grupos y membresías de usuarios, construida con Node.js, Express y Cloud Firestore. Cubre las funcionalidades principales para crear, gestionar e interactuar con grupos de usuarios dentro del contexto de una aplicación.

### Funcionalidades

La API actualmente soporta las siguientes funcionalidades:

*   **Creación de Grupo (`POST /createGroup`)**: Los usuarios autenticados pueden crear nuevos grupos, especificando nombre, descripción, ciudad y privacidad (`isPublic`). El creador es automáticamente el `ownerId` y el primer miembro.
*   **Unirse a Grupo (`POST /joinGroup`)**: Los usuarios autenticados pueden unirse a grupos existentes. El `memberCount` se incrementa atómicamente y el ID del usuario se añade al array `members`.
*   **Abandonar Grupo (`POST /leaveGroup`)**: Los usuarios autenticados pueden abandonar un grupo. Se aplica una lógica especial si el propietario abandona: si es el último miembro, el grupo se elimina; de lo contrario, debe designar un `newOwnerId` entre los miembros existentes.
*   **Eliminar Miembro (`POST /groups/:groupId/removeMember`)**: Los propietarios de grupos pueden eliminar a otros miembros de su grupo.
*   **Transferir Propiedad (`POST /groups/:groupId/transferOwnership`)**: Los propietarios de grupos pueden transferir la propiedad de su grupo a otro miembro existente.
*   **Actualizar Información del Grupo (`PATCH /groups/:groupId`)**: Los propietarios de grupos pueden actualizar detalles como el nombre, la descripción, la ciudad y el estado `isPublic`.
*   **Obtener Detalles del Grupo (`GET /groups/:groupId`)**: Los miembros autenticados de un grupo pueden recuperar todos los detalles de ese grupo específico, incluyendo su lista de miembros.
*   **Obtener Grupos del Usuario (`GET /myGroups`)**: Los usuarios autenticados pueden recuperar una lista de todos los grupos de los que son miembros actualmente.
*   **Listar Grupos Públicos (`GET /publicGroups?limit=X&startAfterId=Y`)**: Recupera una lista paginada de todos los grupos visibles públicamente. No se requiere autenticación para la lista.

### Requisitos Previos

Antes de desplegar o ejecutar este proyecto, asegúrate de tener lo siguiente:

*   **Node.js (versión LTS recomendada)** y `npm` o `yarn` instalados.
*   Un **Proyecto Firebase** configurado en la [Consola de Firebase](https://console.firebase.google.com/).
*   **Cloud Firestore** habilitado en tu Proyecto Firebase.
*   **Firebase Authentication** habilitado (al menos el proveedor de Email/Contraseña para pruebas).
*   Un archivo JSON de **Clave de Cuenta de Servicio del Firebase Admin SDK**.
    *   Ve a Consola de Firebase > Configuración del proyecto > Cuentas de servicio.
    *   Haz clic en "Generar nueva clave privada" y descarga el archivo JSON.
    *   **Renombra este archivo a `serviceAccountKey.json`** (o ajusta la ruta en `firebase.js`) y colócalo en la raíz de tu proyecto. **CRÍTICO: asegúrate de que este archivo esté incluido en tu `.gitignore` y nunca se suba al control de versiones.**
*   **Variables de Entorno:** Es posible que necesites configurar un archivo `.env` para otra información sensible (por ejemplo, tu Clave API de Firebase Web para pruebas de `signInWithPassword` si no está codificada). Asegúrate de que `.env` también esté en `.gitignore`.
*   **Índices de Firestore:** Para consultas eficientes, especialmente para grupos públicos paginados, DEBES crear el siguiente índice compuesto en tu consola de Firestore:
    *   `colección: groups`
    *   `campos: isPublic (ascendente), createdAt (descendente), __name__ (ascendente)`
    *   Firebase generalmente proporcionará un enlace directo en el error de la consola si falta un índice.

### Instalación y Configuración Local

1.  **Clona el repositorio:**
    ```bash
    git clone git@github.com:Circe07/Start-Connect.git # O usa la URL HTTPS
    cd Start-Connect
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```
3.  **Coloca tu `serviceAccountKey.json`** en la raíz del proyecto.
4.  **Crea un archivo `.env`** en la raíz del proyecto si es necesario (por ejemplo, `PORT=3000`).
5.  **Ejecuta el servidor localmente:**
    ```bash
    npm start
    # o
    yarn start
    ```
    La API se ejecutará típicamente en `http://localhost:3000` (o el PUERTO que hayas configurado).

### Despliegue

Esta API puede ser desplegada en varios entornos de alojamiento de Node.js, como:

*   **Firebase Cloud Functions:** Recomendado para una estrecha integración con Firebase. Cada endpoint puede ser una función HTTP separada, o puedes exponer la aplicación Express a través de una única función.
*   **Firebase App Hosting:** Ideal para desplegar aplicaciones web full-stack, incluyendo backends Node.js.
*   **Otros Proveedores de Nube:** Como Google Cloud Run, Heroku, AWS Lambda, etc.

**Ejemplo Básico de Despliegue en Firebase Cloud Functions:**

1.  **Inicializa Firebase en tu proyecto:**
    ```bash
    firebase init functions
    ```
    Sigue las indicaciones, selecciona tu proyecto Firebase y elige JavaScript/TypeScript para las funciones.
2.  **Ajusta `functions/index.js` (o `functions/src/index.ts`):**
    Necesitarás exportar tu `router` de Express como una función HTTP.
    ```javascript
    // functions/index.js (o functions/src/index.ts)
    const functions = require('firebase-functions');
    const express = require('express');
    const cors = require('cors'); // Si tu frontend está en un dominio diferente

    const apiRoutes = require('./apiRoutes'); // Asumiendo que tu router está en apiRoutes.js

    const app = express();
    app.use(cors({ origin: true })); // Habilita CORS para todas las solicitudes
    app.use('/api', apiRoutes); // Monta tu router API bajo la ruta /api

    exports.app = functions.https.onRequest(app);
    ```
3.  **Despliega tus funciones:**
    ```bash
    firebase deploy --only functions
    ```
    Tus endpoints API serán accesibles a través de `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/app/api/TU_ENDPOINT`.

    [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Circe07/Start-Connect%20)
