# Rollback Runbook (Backend)

## Trigger Conditions

- Sustained 5xx > 3% for 10+ minutes.
- p95 latency breach > 2x SLO for 15+ minutes.
- Critical regression in auth, groups, or discover core flow.

## Preconditions

- Previous stable release commit/tag identified.
- Firebase CLI authenticated with production access.
- Incident owner assigned.

## Fast Rollback Procedure

1. Identify previous stable commit on `backend`.
2. Checkout stable commit locally.
3. Deploy functions only:
   - `cd functions`
   - `npm ci`
   - `firebase deploy --only functions`
4. Validate smoke:
   - `npm run test:smoke-api`
   - `npm run postman:smoke` (or CI Newman smoke)
5. Confirm metrics return to baseline:
   - 5xx rate normalized
   - auth/discover/groups core endpoints healthy

## Data Safety Notes

- Firestore writes are not rolled back automatically by function rollback.
- If schema-compatible changes were released, verify backward compatibility before redeploy.

## Communication

- Announce rollback start in incident channel.
- Post update every 10 minutes until stable.
- Publish RCA follow-up with timeline and corrective actions.
