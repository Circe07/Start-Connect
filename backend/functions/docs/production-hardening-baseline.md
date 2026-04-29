# Production Hardening Baseline

## Operations documentation

For deployment, secrets, monitoring, Firestore indexes, tests, and rollback procedures see **`operations-and-production.md`** in this folder.

## Scope

Current baseline for v1 endpoints related to experiences:

- `/api/v1/experiences`
- `/api/v1/experience-bookings`
- `/api/v1/feedback`
- `/api/v1/hosts`
- `/api/v1/referrals`
- `/api/v1/admin/*`

## Contract Snapshot

### Success envelope

- Most endpoints currently return `success: true`.
- Some success payloads use top-level objects (`booking`, `experience`, `data`) rather than a common `data` envelope.

### Error envelope

- `notFoundHandler` returns:
  - `success: false`
  - `code: NOT_FOUND`
  - `message`
  - `requestId`
- Multiple controllers still return direct `{ message }` without `code/details`.

### Auth/RBAC snapshot

- Admin middleware protects creation/update routes for experiences/hosts/admin exports.
- User auth protects booking/feedback/referral creation.
- Domain rules for bookings (transitions, cancel ownership) live in `src/domain/bookingRules.js` and are covered by tests.
- Fine-grained ownership applies where implemented (e.g. cancel booking); extend consistently for new mutating routes.

### Runtime / secrets (current)

- **Node 22**, `firebase-functions` v7.x.
- **`AUTH_API_KEY`** is provided via **Secret Manager** and `defineSecret('AUTH_API_KEY')` in `index.js` (not legacy `functions.config()`).

## Smoke Baseline

Reference smoke collection:

- `testing/backend/experiences-e2e-smoke.postman_collection.json`
- `testing/backend/experiences-e2e-smoke.postman_environment.json`

Expected green path:

1. Health
2. Create host
3. Create/publish experience
4. Create/cancel booking with seat checks
5. Create feedback
6. Create referral
7. Admin export

## Definition of Done per endpoint (hardening target)

- Validates request payload/params/query with explicit schema.
- Returns consistent success/error envelope (`ok` / `fail` helpers where adopted).
- Enforces role and ownership constraints.
- Emits structured request logs with `requestId` (and observability fields where enabled).
- Covered by at least one RED->GREEN test and included in smoke/CI gate.

## Stripe (pending)

When payment features are enabled: store `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in Secret Manager, wire the function the same way as `AUTH_API_KEY`, and add webhook/smoke coverage.
