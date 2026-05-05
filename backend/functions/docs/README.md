# Documentación backend — Functions

La guía funcional completa de la API (sin enlaces externos a otros archivos del repo) está en el README del paquete: **backend/functions/README.md** (un nivel por encima de esta carpeta `docs/`).

Desde la raíz del repositorio existe además un README principal del proyecto con el resto de capas (frontend, etc.).

| Documento                                                                  | Contenido                                                                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [**operations-and-production.md**](./operations-and-production.md)         | **Índice principal**: proyecto, secretos, runtime, observabilidad, índices Firestore, tests, rollback, checklist go-live.      |
| [**incident-runbook.md**](./incident-runbook.md)                           | Incidentes, severidades, triage, **rollback Cloud Run con comandos `gcloud`**, rollback de secretos, verificación, plantillas. |
| [**production-hardening-baseline.md**](./production-hardening-baseline.md) | Alcance API v1, contratos, RBAC, smoke Postman, objetivos de endurecimiento.                                                   |
| [**openapi.yaml**](./openapi.yaml)                                         | Especificación OpenAPI 3 (MVP; sincronizar con `src/app.js` cuando cambien rutas).                                             |
| **monitoring-dashboard-api.json**                                          | Plantilla JSON para dashboard de Monitoring (request count, 5xx, p95, instancias).                                             |
| **alert-policy-\*.json**                                                   | Plantillas de políticas de alerta (5xx, p95, auth logs, booking conflicts).                                                    |

Archivos JSON de monitoring/alertas: sirven como referencia para crear o reproducir recursos en Google Cloud Console o API; los nombres de recursos en GCP pueden diferir.
