# Backend Testing Plan Implementation

This folder contains the automation-first testing implementation for backend production readiness.

**Production & operations** (secrets, monitoring, rollback, checklist): see [`../backend/functions/docs/operations-and-production.md`](../backend/functions/docs/operations-and-production.md).

## Commands

- Phase 1 (env + smoke):
  - `npm run test:phase1`
- Phase 2 (contract):
  - `npm run test:contract`
- Phase 3 (E2E MVP):
  - `npm run test:e2e`
- Phase 4 (security):
  - `npm run test:security`
- Phase 5 (performance smoke):
  - `npm run test:perf-smoke`
- Full backend verification:
  - `npm run test:all-backend`
- Release gate document validation:
  - `npm run test:release-gate`
- Postman/newman smoke:
  - `npm run postman:smoke`

## Experiences E2E smoke (deployed API)

- Collection: `testing/backend/experiences-e2e-smoke.postman_collection.json`
- Environment: `testing/backend/experiences-e2e-smoke.postman_environment.json`  
  Set `baseUrl` to your Cloud Run URL and refresh `adminToken` / `userToken` before running.

From repo root:

```bash
npx newman run testing/backend/experiences-e2e-smoke.postman_collection.json -e testing/backend/experiences-e2e-smoke.postman_environment.json
```

## Structure

- `backend/` — Postman assets for experiences smoke (paths above).
- `scripts/`
  - `smoke-env.mjs`: verifies required files and env variables.
  - `smoke-api.mjs`: runtime API smoke against local emulator.
  - `release-gate.mjs`: validates release gate checklist exists and is complete.
- `frontend/`
  - `api-integration-matrix.md`: contract matrix for frontend QA.
  - `StartAndConnect.postman_collection.json`: smoke collection.
  - `health-smoke.postman_collection.json`: minimal health smoke for CI.
- `release/`
  - `release-gates.md`: production checklist and sign-off gates.
