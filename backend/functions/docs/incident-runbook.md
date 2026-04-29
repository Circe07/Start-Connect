# Incident Runbook and Rollback Plan

## Scope

This runbook applies to the `api` service deployed from `backend/functions`.
Use it for production incidents affecting authentication, bookings, experiences, admin exports, or API availability.

## Severity Levels

- `SEV-1`: Full outage, booking creation broken, or widespread 5xx errors.
- `SEV-2`: Partial outage, degraded latency, or one critical flow failing.
- `SEV-3`: Non-critical defects with workaround.

## First 10 Minutes

1. Confirm blast radius:
   - Check Cloud Run service health and error rate.
   - Check last deploy and commit SHA.
2. Open incident channel and assign:
   - Incident commander
   - Communications owner
   - Investigator
3. Stabilize quickly:
   - If regression follows deploy, execute rollback.
   - If config/secret issue, restore last known good secret/version.

## Triage Checklist

- API availability:
  - Verify `/health` and `/api/v1/health` responses.
  - Inspect logs for requestId, routePath, actor, and error bursts.
- Auth:
  - Validate `AUTH_API_KEY` secret and active version.
  - Check login/register 4xx/5xx trends.
- Booking integrity:
  - Validate seat decrement/release behavior for create/cancel.
  - Check booking status transition errors.
- Data exports:
  - Verify admin export endpoints and pagination responses.

## Rollback Procedure

### Option A: Roll back Cloud Run revision (preferred for code regression)

Firebase Functions v2 (`api`) runs on **Cloud Run**. Rollback is traffic migration to a previous revision (no redeploy of old code required).

**Commands (replace revision names with values from step 1):**

```bash
# 1) List revisions (newest first)
gcloud run revisions list \
  --service=api \
  --region=europe-west1 \
  --project=startandconnect-c44b2

# 2) See where traffic is going now
gcloud run services describe api \
  --region=europe-west1 \
  --project=startandconnect-c44b2 \
  --format="yaml(status.traffic)"

# 3) Route 100% traffic to a known-good revision (example name)
gcloud run services update-traffic api \
  --region=europe-west1 \
  --project=startandconnect-c44b2 \
  --to-revisions=api-00106-dad=100

# 4) Verify
curl -sS "https://<YOUR_CLOUD_RUN_HOST>/health"
# Run Newman smoke if tokens are fresh.
```

**Documented drill (example):** Traffic was moved from the latest revision to the immediately previous one, `/health` returned `{"status":"ok"}`, then traffic was restored to the latest revision. Rollback traffic update typically completes in **on the order of 10–20 seconds** (varies). Revision IDs such as `api-00107-por` change with every deploy—always take names from `revisions list`.

5. Announce mitigation complete; keep investigation running.

### Option B: Roll back secrets/config (preferred for config regression)

1. Identify failing secret (`AUTH_API_KEY`, Stripe keys, etc.).
2. Promote previous secret version as active.
3. Redeploy if runtime requires restart to pick up env references.
4. Validate auth + smoke tests.

## Verification After Mitigation

- Run smoke collection (`testing/backend/experiences-e2e-smoke.postman_collection.json`).
- Confirm:
  - No sustained 5xx spikes.
  - p95 latency back to baseline.
  - Booking create/cancel works with seat consistency.

## Communication Template

- Incident started: time, symptoms, affected endpoints, current severity.
- Mitigation update: what changed (rollback/config), expected impact.
- Resolution: root cause, preventive actions, owner, and ETA for fixes.

## Postmortem (within 24-48h)

- Root cause narrative (technical + process).
- Timeline with key decisions.
- What worked / what failed in detection and response.
- Corrective actions:
  - Tests added
  - Alert tuning
  - Runbook updates
  - Ownership and due dates
