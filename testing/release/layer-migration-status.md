# Layer Migration Status

## Migrated to `transport -> domain -> data`

- Auth v1 (`/api/v1/auth/*`)
- Users v1 (`/api/v1/users/*`)
- Groups core v1 (`/api/v1/groups/public`, `/join`, `/messages`)
- Discover core v1 (`/api/v1/discover/activities`, `/swipes`, `/matches`)

## Compatibility mounts (legacy handlers exposed under `/api/v1/*`)

- admin
- hobbies
- contacts
- groupsRequests
- maps
- centers
- bookings
- activities
- swipes
- matches

## Remaining Work

- Move compatibility-mounted modules to native layered implementations.
- Retire duplicate legacy route mounts once v1 parity is complete.
- Keep architecture guard tests green to prevent layer drift.
