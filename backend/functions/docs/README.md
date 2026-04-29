# Documentación backend — Functions

Desde la raíz del repositorio también hay un resumen enlazado aquí en el [**README principal**](../../../README.md) (sección _Documentation (operations & production)_).

| Documento                                                                  | Contenido                                                                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [**operations-and-production.md**](./operations-and-production.md)         | **Índice principal**: proyecto, secretos, runtime, observabilidad, índices Firestore, tests, rollback, checklist go-live.      |
| [**incident-runbook.md**](./incident-runbook.md)                           | Incidentes, severidades, triage, **rollback Cloud Run con comandos `gcloud`**, rollback de secretos, verificación, plantillas. |
| [**production-hardening-baseline.md**](./production-hardening-baseline.md) | Alcance API v1, contratos, RBAC, smoke Postman, objetivos de endurecimiento.                                                   |
| [**openapi.yaml**](./openapi.yaml)                                         | Especificación OpenAPI 3 (MVP; sincronizar con `src/app.js` cuando cambien rutas).                                             |
| **monitoring-dashboard-api.json**                                          | Plantilla JSON para dashboard de Monitoring (request count, 5xx, p95, instancias).                                             |
| **alert-policy-\*.json**                                                   | Plantillas de políticas de alerta (5xx, p95, auth logs, booking conflicts).                                                    |

Archivos JSON de monitoring/alertas: sirven como referencia para crear o reproducir recursos en Google Cloud Console o API; los nombres de recursos en GCP pueden diferir.
