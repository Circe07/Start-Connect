# Observability & Alerting Runbook

## Core Metrics

- Request rate (RPS) by endpoint group.
- Error rate (4xx/5xx) by endpoint.
- p95 latency by endpoint.
- Auth failure rates (`401`) vs server failures (`5xx`).

## Structured Logging Contract

- `http_request` log event includes:
  - `requestId`
  - `method`
  - `path`
  - `statusCode`
  - `durationMs`
  - `userAgent`

## Alert Policies

- Critical: 5xx rate > 3% for 10 minutes.
- Warning: p95 latency exceeds SLO + 25% for 15 minutes.
- Critical: auth endpoints 5xx > 2% for 10 minutes.

## Dashboard Panels

- API health summary
- Top failing routes
- Latency heatmap by route
- Auth/login refresh success ratio
- Groups/discover throughput

## Incident Response

1. Confirm anomaly from dashboard and logs (`requestId` tracing).
2. Identify affected routes and timeframe.
3. Mitigate:
   - rate-limit tuning,
   - scale config tuning,
   - rollback if regression introduced.
4. Validate recovery by 5xx and p95 normalization.
