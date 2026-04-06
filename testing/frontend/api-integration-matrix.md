# API Integration Matrix (Frontend QA)

Base URL (hosting rewrite): `/api`

## Auth
- `POST /auth/register` - public - body: `email,password,name,username`
- `POST /auth/login` - public - body: `email,password` - returns `token,refreshToken,uid`
- `POST /auth/refresh` - public - body: `refreshToken` - returns new token pair
- `GET /auth/me` - bearer token required
- `POST /auth/logout` - bearer token required

## Discover
- `GET /activities` - bearer token required
  - query: `city,zone,interests,limit,startAfterId,lat,lng,radius`
- `POST /swipes` - bearer token required
  - body: `activityId,direction(like|dislike)`
- `GET /matches` - bearer token required
  - query: `limit,startAfterId`

## Groups & Chat
- `GET /groups/public` - bearer token required - paginated
- `POST /groups` - bearer token required
- `POST /groups/:id/join` - bearer token required
- `POST /groups/:id/leave` - bearer token required
- `GET /groups/:id/messages` - bearer token required - paginated
- `POST /groups/:id/messages` - bearer token required - members only

## Error/Retry policy for frontend
- `401` => trigger refresh flow once, then retry original request once.
- `403` => show authorization message (do not retry).
- `409` => show conflict message (already member/group full/duplicate swipe).
- `429` => exponential backoff UI hint.
- `500` => generic error, capture request id if available.

