# Backend Testing Plan Implementation

This folder contains the automation-first testing implementation for backend production readiness.

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

## Structure

- `scripts/`
  - `smoke-env.mjs`: verifies required files and env variables.
  - `smoke-api.mjs`: runtime API smoke against local emulator.
  - `release-gate.mjs`: validates release gate checklist exists and is complete.
- `frontend/`
  - `api-integration-matrix.md`: contract matrix for frontend QA.
  - `StartAndConnect.postman_collection.json`: smoke collection.
- `release/`
  - `release-gates.md`: production checklist and sign-off gates.

