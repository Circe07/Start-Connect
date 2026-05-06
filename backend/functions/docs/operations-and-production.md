# Operaciones y producción — API StartAndConnect

Documento índice para despliegue, secretos, observabilidad, índices y verificación. **No incluye valores de secretos ni contraseñas.**

---

## 1. Identidad del servicio

| Concepto                | Valor                                     |
| ----------------------- | ----------------------------------------- |
| Proyecto GCP / Firebase | `startandconnect-c44b2`                   |
| Función (Gen2)          | `api`                                     |
| Región                  | `europe-west1`                            |
| Runtime                 | Cloud Run (tras deploy de Functions v2)   |
| Node.js (engines)       | **22** (`backend/functions/package.json`) |
| Código                  | `backend/functions`                       |
| Entrada HTTP            | `index.js` → Express en `src/app.js`      |

La URL pública la muestra el CLI tras cada deploy (`Function URL`). El hosting puede reescribir `/api/**` a la función `api` según `backend/firebase.json`.

---

## 2. Secretos y configuración

### Producción (recomendado)

- **`AUTH_API_KEY`**: Firebase Web API key para Identity Toolkit / refresh token. En código se declara con **`defineSecret('AUTH_API_KEY')`** (`firebase-functions/params`) y se monta en Cloud Run como variable de entorno secreta. El valor vive en **Secret Manager**; rotación = nueva versión del secreto + redeploy de `functions:api` si hace falta recargar.

### Pagos Stripe (modo híbrido)

- Variables usadas por la API de pagos:
  - **`STRIPE_MODE`**: `fixed` (por defecto) o `dynamic`.
  - **`STRIPE_CHECKOUT_URL_FIXED`**: enlace Checkout fijo (obligatorio en `fixed`).
  - **`STRIPE_SECRET_KEY`**: clave secreta (obligatoria en `dynamic` y para verificar webhooks).
  - **`STRIPE_WEBHOOK_SECRET`**: firma del endpoint webhook (obligatoria siempre en prod).
  - **`STRIPE_SUCCESS_URL`**, **`STRIPE_CANCEL_URL`**: callbacks para `dynamic`.
- Endpoints expuestos:
  - `POST /api/v1/payments/checkout`
  - `POST /api/v1/payments/webhook`
  - `GET /api/v1/payments/:bookingId/status`
- Persistencia de trazabilidad: colección Firestore `payment_attempts` y deduplicación de webhooks en `stripe_webhook_events` por `event.id`.

### Legacy eliminado

- **`functions.config()` / Runtime Config** (`env.firebase_api_key`): ya no se usa; se ejecutó `firebase functions:config:unset env`. El código **no** lee `CLOUD_RUNTIME_CONFIG`.

### Desarrollo local

- Plantilla: `backend/functions/.env.example`
- `dotenv` carga `backend/functions/.env` (no commitear valores reales).

### Producción (`NODE_ENV=production`)

- Además de **`AUTH_API_KEY`** (o `FIREBASE_API_KEY`), **`validateEnv()` exige `CORS_ORIGINS`** con al menos un origen (lista separada por comas). Configurarlo en variables de entorno de Cloud Run (servicio de la función Gen2 `api`) antes del deploy.
- Para pagos en producción:
  - `STRIPE_WEBHOOK_SECRET` obligatorio.
  - `STRIPE_MODE=fixed` exige `STRIPE_CHECKOUT_URL_FIXED`.
  - `STRIPE_MODE=dynamic` exige `STRIPE_SECRET_KEY`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`.

**Ejemplo para este repo (solo Firebase Hosting del proyecto `startandconnect-c44b2`):**

```text
CORS_ORIGINS=https://startandconnect-c44b2.web.app,https://startandconnect-c44b2.firebaseapp.com
```

- Añade más entradas separadas por coma si usas dominio custom en Hosting, preview channels (`https://startandconnect-c44b2--<channel>-<hash>.web.app`), o otro front desplegado (cada URL debe coincidir **exactamente** con el header `Origin` del navegador: esquema + host, sin barra final).
- En la consola: Firebase → Build → Functions → `api` → Variables de entorno, o Google Cloud Console → Cloud Run → servicio asociado → Variables y secretos.

### Seguridad API (referencia)

- Perfil **`GET /users/:uid`**: el propietario ve el documento completo; otros usuarios solo campos públicos definidos en `src/domain/users/publicProfile.js`.
- **Admin seed** (`/admin/seed-*`): deshabilitados en producción (404).
- **Idempotencia** (`Idempotency-Key`): en producción la respuesta se guarda en Firestore, colección **`api_idempotency`**, con clave hash por usuario + ruta + cabecera (TTL por campo `expiresAt`, ventana por defecto 5 min). En **tests Jest** y con **`IDEMPOTENCY_STORE=memory`** se usa el almacén en memoria (una sola instancia).

### Dependencias

- Revisar vulnerabilidades con `npm audit` en `backend/functions`. Tras `npm audit fix`, pueden quedar avisos **low** en dependencias transitivas de `firebase-admin` / `@google-cloud/firestore`; no usar `npm audit fix --force` sin validar (puede bajar `firebase-admin` de forma incompatible). El workflow de release gates puede ejecutar auditoría en CI (ver `.github/workflows/backend-release-gates.yml`).

---

## 3. Deuda técnica resuelta (referencia)

| Tema                           | Acción                                                                     |
| ------------------------------ | -------------------------------------------------------------------------- |
| Runtime deprecado Node 20      | Subido a **Node 22**.                                                      |
| `functions.config()` deprecado | Sustituido por **`defineSecret`** + Secret Manager; config legacy borrada. |
| `firebase-functions` antiguo   | Actualizado a **v7.x** (ver `package.json`).                               |
| API key HTTP rotada            | Key antigua eliminada en Google Cloud; activa la key operativa actual.     |

---

## 4. Observabilidad (Cloud Monitoring)

### Dashboard

- JSON de referencia para crear/recuperar layout: `monitoring-dashboard-api.json`
- Métricas típicas: request count, 5xx, p95 latency, instancias (Cloud Run `run.googleapis.com`).

### Políticas de alerta (JSON en repo)

| Archivo                               | Propósito                            |
| ------------------------------------- | ------------------------------------ |
| `alert-policy-5xx.json`               | Ratio / tasa de errores 5xx          |
| `alert-policy-latency-p95.json`       | Latencia p95 alta                    |
| `alert-policy-auth-errors.json`       | Patrones en logs (auth)              |
| `alert-policy-booking-conflicts.json` | Patrones en logs (reservas / plazas) |

Tras importar o crear políticas, asociar **canales de notificación** (email u otros). Conviene un segundo canal (Slack/PagerDuty) además del correo.

- Crear primero al menos un canal en **Monitoring → Alerting → Edit notification channels** (p. ej. email). Las políticas JSON del repo no incluyen el ID del canal; hay que adjuntarlo al **importar** en la consola o crear la política manualmente con el mismo filtro de métricas que figura en `alert-policy-*.json`.
- Si `gcloud alpha monitoring` no está instalado o el CLI pide modo interactivo en Windows, usar solo la consola web para crear políticas equivalentes.

---

## 5. Firestore — índices

- Definición en repo: `backend/firestore.indexes.json` (también referenciada para la base nombrada `startandconnect-eur3` en `firebase.json`).
- Incluye consultas de listado de experiencias por **`estado` + `createdAt`** y por **`center_id` + `estado` + `createdAt`** (además de los índices previos de grupo/actividades/reservas).
- Si `firebase deploy --only firestore:indexes` falla con error genérico del CLI, crear los índices en la base **`startandconnect-eur3`** con `gcloud firestore indexes composite create` (en PowerShell, cada `--field-config=...` entre comillas). Ejemplo de dos campos:

  `gcloud firestore indexes composite create --project=startandconnect-c44b2 --database=startandconnect-eur3 --collection-group=experiences "--field-config=field-path=estado,order=ascending" "--field-config=field-path=createdAt,order=descending"`

  Tres campos (`center_id` + `estado` + `createdAt`):

  `gcloud firestore indexes composite create --project=startandconnect-c44b2 --database=startandconnect-eur3 --collection-group=experiences "--field-config=field-path=center_id,order=ascending" "--field-config=field-path=estado,order=ascending" "--field-config=field-path=createdAt,order=descending"`

- Comprobar en consola Firebase o con `gcloud firestore indexes composite list` hasta estado **READY** antes de depender de esas queries en producción.

---

## 6. Pruebas y CI

| Tipo                   | Ubicación / comando                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit / integration     | `backend/functions`: `npm test`                                                                                                                     |
| Smoke E2E              | `testing/backend/experiences-e2e-smoke.postman_collection.json` + `experiences-e2e-smoke.postman_environment.example.json`                          |
| Newman                 | `npx newman run ...` (tokens en entorno deben estar vigentes)                                                                                       |
| OpenAPI (contrato MVP) | `backend/functions/docs/openapi.yaml` — comprobado por `backend/functions/test/contract.openapi.test.js` (`npm run test:contract` desde `backend/`) |

Gates adicionales del repo backend: ver workflow `.github/workflows/backend-release-gates.yml` y scripts en `backend/package.json`.

---

## 7. Rollback (Cloud Run)

Procedimiento detallado y comandos concretos: **`incident-runbook.md`** (incluye simulacro documentado).

Resumen:

1. `gcloud run revisions list --service=api --region=europe-west1 --project=startandconnect-c44b2`
2. `gcloud run services describe api --region=europe-west1 --project=startandconnect-c44b2 --format="yaml(status.traffic)"`
3. `gcloud run services update-traffic api --region=europe-west1 --project=startandconnect-c44b2 --to-revisions=REVISION_KNOWN_GOOD=100`
4. Verificar `GET /health` y smoke.
5. Restaurar tráfico a la revisión deseada con el mismo mecanismo.

Los nombres de revisión (`api-00123-xyz`) cambian con cada deploy.

---

## 8. Incidentes y comunicación

Ver **`incident-runbook.md`**: severidades, primeros 10 minutos, rollback por revisión vs rollback de secretos, plantilla de comunicación y postmortem.

---

## 9. Checklist previo a go-live

- [ ] Secretos de prod solo en Secret Manager / params; sin keys en repo.
- [ ] Tokens Postman/regression: renovar si expiran; no subir entornos con JWT activos al remoto.
- [ ] Alertas con al menos un canal operativo; ideal segundo canal.
- [ ] Simulacro de rollback ejecutado al menos una vez (ver runbook).
- [ ] Stripe webhook activo y firmado (`STRIPE_WEBHOOK_SECRET` válido).
- [ ] `STRIPE_MODE` definido según estrategia (`fixed` o `dynamic`) y variables requeridas configuradas.

---

## 10. Enlaces útiles

- Consola Firebase: proyecto `startandconnect-c44b2`
- Secret Manager: secretos por nombre (`AUTH_API_KEY`, etc.)
- Cloud Run: servicio `api`, región `europe-west1`
