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

### Pendiente cuando exista integración de pagos

- **`STRIPE_SECRET_KEY`**, **`STRIPE_WEBHOOK_SECRET`**: crear versiones en Secret Manager y enlazar la función igual que `AUTH_API_KEY` cuando el código los consuma solo desde secretos (no desde `.env` en prod).

### Legacy eliminado

- **`functions.config()` / Runtime Config** (`env.firebase_api_key`): ya no se usa; se ejecutó `firebase functions:config:unset env`. El código **no** lee `CLOUD_RUNTIME_CONFIG`.

### Desarrollo local

- Plantilla: `backend/functions/.env.example`
- `dotenv` carga `backend/functions/.env` (no commitear valores reales).

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

---

## 5. Firestore — índices

- Definición en repo: `backend/firestore.indexes.json`
- Índices compuestos relevantes para exports y dominio experiencias/reservas/feedback/usuarios (multiples igualdades en misma query).
- Si `firebase deploy --only firestore:indexes` falla por el CLI, los índices se pueden crear con `gcloud firestore indexes composite create` (comprobar estado hasta `READY`).

---

## 6. Pruebas y CI

| Tipo                   | Ubicación / comando                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit / integration     | `backend/functions`: `npm test`                                                                                                                     |
| Smoke E2E              | `testing/backend/experiences-e2e-smoke.postman_collection.json` + `experiences-e2e-smoke.postman_environment.json`                                  |
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

## 9. Checklist previo a go-live (sin Stripe)

- [ ] Secretos de prod solo en Secret Manager / params; sin keys en repo.
- [ ] Tokens Postman/regression: renovar si expiran; no subir entornos con JWT activos al remoto.
- [ ] Alertas con al menos un canal operativo; ideal segundo canal.
- [ ] Simulacro de rollback ejecutado al menos una vez (ver runbook).
- [ ] Stripe: pendiente hasta tener claves y cableado igual que `AUTH_API_KEY`.

---

## 10. Enlaces útiles

- Consola Firebase: proyecto `startandconnect-c44b2`
- Secret Manager: secretos por nombre (`AUTH_API_KEY`, etc.)
- Cloud Run: servicio `api`, región `europe-west1`
