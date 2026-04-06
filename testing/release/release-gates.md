# Production Release Gates

## Environment & Smoke
- [ ] `npm run test:smoke-env` passes.
- [ ] `npm install` root + `functions` completes on clean machine.
- [ ] Emulators start with `functions,firestore`.

## Contract Validation
- [ ] `npm run test:contract` passes.
- [ ] OpenAPI and mounted routes have no critical drift.

## E2E MVP Flows
- [ ] `npm run test:e2e` passes.
- [ ] Auth, Discover, Groups, Chat happy paths pass.
- [ ] Required error paths covered (401/403/409).

## Security
- [ ] `npm run test:security` passes.
- [ ] Admin endpoints enforce admin claim.
- [ ] Rate limiting tests in place for auth endpoints.

## Performance Smoke
- [ ] `npm run test:perf-smoke` passes.
- [ ] No sustained 5xx during burst smoke.

## Frontend Connectivity Kit
- [ ] Integration matrix shared with frontend QA.
- [ ] Postman collection imported and smoke run complete.
- [ ] Base path `/api` validated in environment.

## Final Sign-off
- [ ] `npm run test:all-backend` passes.
- [ ] No critical vulnerability without mitigation plan.
- [ ] Release notes and rollback plan approved.

