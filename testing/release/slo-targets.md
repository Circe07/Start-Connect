# SLO Targets (Production Baseline)

## Scope

- API surface under `/api/v1/*` plus legacy compatibility mounts.
- Environment: production Cloud Functions (Node 20 runtime).

## Availability SLO

- Target: **99.9% monthly** successful availability for API requests.
- Error budget: up to **43m 49s** monthly unavailable time.

## Latency SLO (p95)

- `POST /api/v1/auth/login`: **< 800ms**
- `POST /api/v1/auth/refresh`: **< 700ms**
- `GET /api/v1/discover/activities`: **< 900ms**
- `GET /api/v1/groups/public`: **< 900ms**
- `POST /api/v1/groups/:id/messages`: **< 900ms**

## Reliability SLO

- 5xx rate (all API routes): **< 1.0%** rolling 15 minutes.
- Auth 401 rate baseline tracked separately (not counted as outage).

## Alert Thresholds

- Critical: 5xx rate > 3% for 10 minutes.
- Warning: p95 latency above SLO + 25% for 15 minutes.
- Critical: availability below 99.9% projection for current month.

## Release Gate Criteria

- `npm --prefix functions test` green.
- `npm run test:all-backend` green.
- Smoke API script passes against target environment.
- Rollback runbook reviewed and executable.
