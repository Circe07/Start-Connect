## Summary

- Harden backend for production readiness (security, auth refresh, CORS, error handling, healthcheck).
- Implement MVP discover/join/chat API surface (`activities`, `swipes`, `matches`, groups/chat updates).
- Add automation-first testing stack (contract, e2e, security, perf smoke) and release gates.

## Changes

- Security and runtime hardening across auth/admin/groups middleware and app config.
- Firestore rules/indexes updates and seed tooling for Barcelona data.
- New tests and testing scripts under `functions/test` and `testing/`.
- CI/CD improvements for Node 20, backend quality gates, and hosting deploy compatibility.

## Test plan

- [x] `npm run test:phase1`
- [x] `npm run test:contract`
- [x] `npm run test:e2e`
- [x] `npm run test:security`
- [x] `npm run test:perf-smoke`
- [x] `npm run test:all-backend`
- [x] `npm run test:release-gate`

## Risks / Notes

- Firestore composite index for `activities(city, createdAt)` must exist in named DB (`startandconnect-eur3`) in production.
- Node runtime should remain aligned to 20 in CI/deploy environments.
- `baseline-browser-mapping` warning is non-blocking.
