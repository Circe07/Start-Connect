# Archive

## `legacy-root-functions-layered`

Copia archivada del directorio **`functions/`** que existía en la **raíz del repositorio** (convivía con `backend/functions/`).

- **No es el backend en producción.** El despliegue y el código canónico están en **`backend/functions/`** (véase `backend/firebase.json` → `source: "functions"` relativo a `backend/`).
- Este árbol mezclaba una variante con capas (`domain` / `transport` / `data`) y tests que apuntaban a rutas bajo esa carpeta.
- Contenido útil ya integrado en el backend canónico:
  - `docs/openapi.yaml` → `backend/functions/docs/openapi.yaml`
  - Tests de contrato / e2e / seguridad / rendimiento referenciados por `backend/package.json` → `backend/functions/test/`

Se conserva aquí solo como referencia histórica; no ejecutar `npm install` ni desplegar desde esta carpeta.
