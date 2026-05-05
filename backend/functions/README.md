# API StartAndConnect — Guía funcional y KPIs / SLO

Servicio HTTP único expuesto como **Firebase Cloud Functions Gen2** (`exports.api` en `index.js`), **Express** en `src/app.js`, **Node.js 22** (`engines` en `package.json`), región **europe-west1**. Tras el deploy, la función corre como **Cloud Run** asociada al binario de Functions v2.

---

## 1. Identidad en Google Cloud (producción)

| Concepto                | Valor                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto GCP / Firebase | `startandconnect-c44b2`                                                                                                                                                                                                                                                                                                                                            |
| Función Gen2            | `api`                                                                                                                                                                                                                                                                                                                                                              |
| Región                  | `europe-west1`                                                                                                                                                                                                                                                                                                                                                     |
| Código                  | directorio `backend/functions` (este paquete)                                                                                                                                                                                                                                                                                                                      |
| Secreto principal       | `AUTH_API_KEY` (Firebase Web API key para Identity Toolkit) declarada con `defineSecret` y montada desde **Secret Manager** en Cloud Run                                                                                                                                                                                                                           |
| CORS en producción      | variable `CORS_ORIGINS` (lista separada por comas; obligatoria si `NODE_ENV=production` en `validateEnv`). Ejemplo típico con Firebase Hosting: `https://startandconnect-c44b2.web.app,https://startandconnect-c44b2.firebaseapp.com` (añadir dominios custom o preview channels si aplica; el `Origin` del navegador debe coincidir exactamente, sin barra final) |

**Desarrollo local:** copiar variables desde la plantilla `backend/functions/.env.example` a `backend/functions/.env` (no commitear secretos). `dotenv` carga ese `.env` al arrancar.

**Pagos (Stripe):** si se activan, `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` deben ir como secretos en Secret Manager de la misma forma que `AUTH_API_KEY`, no en texto plano en el repo.

**Idempotencia:** cabecera `Idempotency-Key`; la implementación actual usa almacenamiento en memoria por instancia de Cloud Run, por lo que **no** deduplica entre réplicas. Para deduplicación global hace falta un almacén compartido con TTL.

---

## 2. Superficie HTTP y versionado

| Ruta base                                      | Rol                                                                                                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health`                                  | Salud del servicio (sin autenticación). Respuesta JSON con `status: ok`.                                                                                                |
| `GET /`                                        | Ping genérico JSON.                                                                                                                                                     |
| `/auth/*` y `/api/v1/auth/*`                   | Registro, login, refresh, logout (montaje duplicado por compatibilidad con clientes antiguos).                                                                          |
| `/admin/*` y `/api/v1/admin/*`                 | Rutas administrativas (tras middleware que exige claim `role: admin`).                                                                                                  |
| `/users/*` y `/api/v1/users/*`                 | Perfiles: `GET /users/:uid`, actualización del propio usuario.                                                                                                          |
| Resto bajo `/api/v1/*` y duplicado sin prefijo | hobbies, contacts, groups, groupsRequests, maps, centers, bookings (legacy), experience-bookings, experiences, feedback, hosts, referrals, activities, swipes, matches. |

Los routers se montan dos veces en `src/app.js` (con y sin `/api/v1`) para mantener compatibilidad; la convención recomendada para clientes nuevos es **`/api/v1/...`**.

**Autenticación en rutas protegidas:** cabecera `Authorization: Bearer <Firebase idToken>`.

---

## 3. Contrato HTTP resumido (MVP documentado en OpenAPI 3)

Versión lógica de la API en especificación **0.1.0**. Seguridad global: esquema **bearer JWT** salvo donde se indique lo contrario.

**Público (sin Bearer):**

- `GET /health` — comprobación de salud.
- `POST /auth/register` — cuerpo: `email`, `password`, `name`, `username` (requeridos); respuestas 201 / 400 / 500.
- `POST /auth/login` — `email`, `password`; respuesta 200 con `success`, `token` (idToken), `refreshToken`, `uid`; 429 si rate limit.
- `POST /auth/refresh` — `refreshToken`; 200 / 401 / 429.

**Con Bearer:**

- `POST /auth/logout` — 200 / 401.
- `GET /activities` — Discover: query `city`, `zone`, `interests` (CSV, máx. 10), `limit` (1–50), `startAfterId`, `lat`, `lng`, `radius` (metros); 200 / 401.
- `POST /swipes` — cuerpo `activityId`, `direction` (`like` | `dislike`); 201 / 400 / 401 / 404.
- `GET /matches` — query `limit`, `startAfterId`; 200 / 401.
- `GET /groups/public` — grupos públicos paginados; 200 / 401.
- `POST /groups/{id}/join` — unirse; 200 / 401 / 404 / 409.
- `POST /groups/{id}/messages` — cuerpo `content`; 201 / 401 / 403.

El archivo OpenAPI del repo puede ampliarse con más rutas; la lista anterior cubre el núcleo MVP (auth, discover, grupos).

---

## 4. Funcionalidad por dominio (implementación)

### Autenticación

Registro en Firebase Auth + documento de usuario en Firestore. Login mediante Identity Toolkit (email/contraseña). Respuesta de login incluye `idToken`, `refreshToken` y `uid`. Refresh y logout según rutas en `src/routes/auth.js`.

### Usuarios

Actualización del perfil con **lista blanca** de campos: no se aceptan `email` ni `fecha_registro` desde el cliente. **`GET /users/:uid`**: si el token es del mismo `uid`, respuesta completa; si es otro usuario, solo **campos públicos** (nombre, usuario, foto, bio, etc., según dominio en código) para reducir IDOR.

### Actividades, swipes y matches

Listado de actividades con filtros y geo; swipes; listado de matches (MVP de “likes”).

### Grupos

Grupos públicos, unión a grupo, mensajes. En el montaje `/api/v1/groups` hay **rate limit de escritura** para abuso.

### Experiencias y reservas

**Experiencias:** CRUD; creación y publicación requieren **admin**. Listado y detalle incluyen **rate limit de lectura** en rutas de listado para limitar scraping. Desde esta iteración, la experiencia puede llevar `center_id` opcional (club registrado); si se envía, debe existir en la colección de centros.

**Reservas (`experience-bookings`):** reglas de negocio (plazas, conflictos, cancelación, propiedad) en capa de dominio y tests automatizados.

### Feedback, hosts, referrals

Endpoints dedicados; permisos según controlador (usuario autenticado / admin donde aplique). El endpoint de creación de feedback acepta dos formatos: legacy (`nota_1_10`) y granular v2 (`nota_app`, `nota_club`, `nota_host`, `nota_companeros`).

### Admin

Rutas bajo `/admin` y `/api/v1/admin` con claim **`role: admin`**. Las rutas **`/seed-*`** (semillas de datos) **no están disponibles en producción** (respuesta de error controlada) para reducir superficie de ataque.

### Otros

Contacts, maps, centers, bookings legacy: rutas montadas en `src/app.js`; el contrato detallado puede variar por endpoint.

---

## 5. Seguridad y respuesta de errores

- **CORS:** en producción, solo orígenes listados en `CORS_ORIGINS`; si la lista está vacía en no-producción, el servidor permite orígenes de forma permisiva para desarrollo.
- **Helmet** y **`trust proxy`** para comportamiento correcto detrás de Cloud Run y límites por IP.
- **Rate limiting:** aplicado en rutas sensibles (p. ej. escritura en grupos; lectura en listados de experiencias).
- **Errores 500:** respuesta genérica tipo “Error interno” con código `INTERNAL_ERROR`, sin devolver al cliente el mensaje interno de excepción (usuarios y contactos alineados con `fail()`).
- **Observabilidad:** contexto de petición y `requestId` en respuestas de error estandarizadas.

---

## 6. KPIs y SLO de producción (baseline del equipo)

**Ámbito:** superficie bajo `/api/v1/*` más montajes legacy equivalentes. Entorno: producción (Cloud Functions / Cloud Run). Runtime efectivo: **Node 22** (las tablas numéricas siguen siendo el acuerdo de servicio).

### Disponibilidad

- **Objetivo: 99,9 % mensual** de disponibilidad exitosa de las peticiones a la API.
- **Presupuesto de error:** hasta **43 minutos 49 segundos** al mes de indisponibilidad acumulada.

### Latencia (percentil 95)

| Operación                                                                                          | Objetivo p95 |
| -------------------------------------------------------------------------------------------------- | ------------ |
| `POST /api/v1/auth/login`                                                                          | &lt; 800 ms  |
| `POST /api/v1/auth/refresh`                                                                        | &lt; 700 ms  |
| `GET /api/v1/activities` (discover; en documentación histórica aparece como “discover/activities”) | &lt; 900 ms  |
| `GET /api/v1/groups/public`                                                                        | &lt; 900 ms  |
| `POST /api/v1/groups/:id/messages`                                                                 | &lt; 900 ms  |

### Fiabilidad (errores de servidor)

- **Tasa de respuestas 5xx en todas las rutas:** &lt; **1,0 %** en ventana móvil de unos **15 minutos**.
- La tasa de **401** (auth) se monitoriza aparte y **no** cuenta como “caída” del servicio en esta línea base.

### Umbrales de alerta (operación)

- **Crítico:** tasa 5xx **&gt; 3 %** durante **10 minutos**.
- **Advertencia:** p95 de latencia **por encima del SLO + 25 %** durante **15 minutos**.
- **Crítico:** proyección de disponibilidad mensual **por debajo del 99,9 %**.

**Cómo se comprueba el cumplimiento:** métricas de **Google Cloud Monitoring** sobre el servicio Cloud Run de la función (`request_latencias` para p95, ratios de códigos de respuesta para 5xx, disponibilidad). En el repositorio hay plantillas JSON para importar paneles y políticas de alerta (ratios 5xx, latencia p95, errores de auth, conflictos de reservas); tras importarlas hay que asociar canales de notificación (correo, Slack, PagerDuty, etc.).

**Ante incidente:** revisar reglas de escalado, revisiones recientes y logs estructurados; ejecutar **rollback** de la revisión de Cloud Run o redeploy de la función con imagen anterior si procede; si el fallo es por secreto o configuración, rotar versión del secreto en Secret Manager y redeploy. Los procedimientos detallados de rollback e incidentes deben mantenerse como práctica interna de equipo (pasos típicos: identificar ventana del incidente, mitigar, comunicar, postmortem).

---

## 7. Cómo encajan los KPIs con el diseño y el ciclo de vida

| KPI / SLO                               | Rol del código y operaciones                                                                                            |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Disponibilidad 99,9 %                   | Cloud Run escala instancias; sin dependencia de un solo nodo; hosting puede proxy `/api/**` hacia la función.           |
| p95 login / refresh / discover / grupos | Rutas críticas acotadas en el contrato; límites de tasa donde aplica para proteger backend y mantener colas bajas.      |
| 5xx &lt; 1 %                            | Manejo homogéneo de errores; tests que evitan regresiones; alertas que disparan antes de agotar presupuesto.            |
| Alertas                                 | Politicas importadas en GCP enlazadas al servicio `api` y notificaciones activas.                                       |
| Release                                 | Antes de subir versión: tests automatizados y smoke manual o Newman contra el entorno objetivo (ver sección siguiente). |

---

## 8. Criterios de release y calidad (checklist)

Antes de considerar un despliegue a producción “cerrado” desde el punto de vista del baseline:

**Entorno y smoke**

- Script de comprobación de entorno de smoke ejecutado con éxito (`npm run test:smoke-env` desde `backend` donde exista el script).
- Instalación limpia: dependencias raíz y de `functions` resolviendo sin error.
- Emuladores (functions, firestore) arrancan si el flujo lo exige.

**Contrato**

- Tests de contrato OpenAPI frente a rutas montadas en verde (`npm run test:contract` desde `backend`).
- Sin desviación crítica entre OpenAPI y rutas reales.

**E2E MVP**

- Tests E2E en verde (`npm run test:e2e` desde `backend`).
- Flujos felices: auth, discover, grupos, chat; rutas de error relevantes (401, 403, 409).

**Seguridad**

- Tests de seguridad en verde (`npm run test:security` desde `backend`).
- Endpoints admin exigen claim de administrador.
- Rate limiting cubierto en tests para rutas de auth según suite.

**Rendimiento**

- Smoke de rendimiento en verde (`npm run test:perf-smoke` desde `backend`).
- Sin 5xx sostenidos durante el burst de prueba.

**Conectividad / QA**

- Matriz de integración compartida con QA de frontend si aplica.
- Colección Postman importada y smoke ejecutado.
- Ruta base `/api` validada en el entorno del cliente.

**Cierre**

- `npm run test:all-backend` desde `backend` en verde.
- Sin vulnerabilidades críticas sin plan de mitigación.
- Notas de release y plan de rollback revisados y aprobados.

**Comandos de test típicos (desde `backend`):**

- `npm --prefix functions test` — suite Jest del paquete `functions`.
- `npm run test:all-backend` — contrato + e2e + seguridad + perf smoke + Jest completo.

**Rollback documentado como requisito:** el equipo debe tener un runbook ejecutable (revisión anterior de Cloud Run, redeploy, revisión de secretos).

---

## 9. Desarrollo, Postman y tokens

- Tests unitarios e integración: directorio `backend/functions/test`; ejecutar `npm test` dentro de `backend/functions` o el agregado desde `backend` según scripts del monorepo.
- Para la colección **Experiences E2E smoke:** desde `backend`, comando `npm run postman:update-tokens`. Requiere variables de entorno `POSTMAN_ADMIN_EMAIL`, `POSTMAN_ADMIN_PASSWORD`, `POSTMAN_USER_EMAIL`, `POSTMAN_USER_PASSWORD` y opcionalmente `POSTMAN_BASE_URL` (defecto: URL pública de Cloud Run si está configurada). Los tokens se escriben en el JSON de entorno de Postman bajo `testing/backend/`; caducan en alrededor de una hora y hay que regenerarlos cuando fallen las peticiones.

## 9.1 Ejemplos de payload (rollout incremental)

### Crear experiencia con `center_id` (admin)

```json
{
  "titulo": "Primer Set Iniciacion",
  "descripcion": "Sesion guiada para principiantes",
  "deporte_vertical": "padel",
  "ciudad": "Madrid",
  "club": "Club Norte",
  "direccion": "Calle Club 12",
  "fecha": "2026-07-10",
  "hora_inicio": "18:00",
  "hora_fin": "19:30",
  "nivel_permitido": "principiante",
  "plazas_totales": 4,
  "precio": 20,
  "host_asignado": "host-1",
  "center_id": "center-123"
}
```

### Crear feedback legacy (sigue soportado)

```json
{
  "experience_id": "exp-1",
  "nota_1_10": 9,
  "repetiria": true,
  "traeria_amigo": true,
  "comentario": "Buena primera experiencia"
}
```

### Crear feedback v2 granular

```json
{
  "experience_id": "exp-1",
  "nota_app": 8,
  "nota_club": 9,
  "nota_host": 10,
  "nota_companeros": 8,
  "repetiria": true,
  "traeria_amigo": true,
  "comentario": "Host excelente y buena dinamica"
}
```

### Estrategia de transición recomendada

- Fase 1: clientes antiguos siguen enviando `nota_1_10` sin cambios.
- Fase 2: clientes nuevos envían notas granulares v2.
- Fase 3: analítica compara adopción v2 y decide fecha de retiro de formato legacy.

---

## 10. Resumen ejecutivo

La API centraliza **autenticación**, **perfiles** (con visibilidad pública acotada), **discover y matching**, **grupos y mensajes**, **experiencias deportivas y reservas**, **feedback**, **hosts**, **referidos** y **administración**. Los **KPIs** acordados son **99,9 % de disponibilidad mensual**, **p95 por debajo de los umbrales** en login, refresh, discover y grupos, y **menos del 1 % de 5xx** en ventanas cortas; las **alertas** y el **monitoring en GCP** son el mecanismo de verificación continua, y los **tests y gates de release** reducen el riesgo de degradar esos números en cada versión.
