# Frontend -> Backend Integration Matrix

This document maps current frontend consumers to backend endpoints.
Scope: existing UI only, no new screens/features.

## v1-routed domains (through `apiClient`)

Because `apiClient` auto-prefixes `/v1` for `auth/users/groups/discover`, the following routes are called as `/v1/...` in production:

- `POST /auth/register` -> `src/services/auth/authService.ts` (`registerUser`) -> `src/screens/auth/SignUpScreen.tsx`
- `POST /auth/login` -> `src/services/auth/authService.ts` (`loginUser`) -> `src/screens/auth/LoginScreen.tsx`
- `POST /auth/logout` -> `src/services/auth/authService.ts` (`logoutUser`)
- `POST /auth/change-password` -> `src/services/auth/authService.ts` (`changePassword`) -> `src/screens/auth/ForgotPassword.tsx`
- `GET /auth/me` -> `src/services/user/userService.ts` fallback in `getCurrentUser` -> profile/auth flows
- `POST /auth/refresh` -> automatic retry in `src/services/core/apiClient.ts` on 401
- `GET /users/me` -> `src/services/user/userService.ts` (`getCurrentUser`)
- `PATCH /users/me` -> `src/services/user/userService.ts` (`updateCurrentUser`) -> `src/screens/ProfileScreen.tsx`
- `GET /users/:id` -> `src/services/user/userService.ts` (`getUserById`)
- `GET /users?q=&limit=` -> `src/services/user/userService.ts` (`searchUsers`) -> `src/screens/SearchUser.tsx`
- `GET /groups/public` -> `src/services/groups/authGroup.ts` (`getPublicGroups`) -> `src/screens/groups/GroupsScreen.tsx`
- `GET /groups/my-groups` -> `src/services/groups/authGroup.ts` (`getMyGroups`) -> `src/screens/groups/GroupsScreen.tsx`
- `GET /groups/:id` -> `src/services/groups/authGroup.ts` (`getGroupById`) -> `src/screens/groups/GroupDetailScreen.tsx`
- `POST /groups/:id/join` -> `src/services/groups/authGroup.ts` (`joinGroup`)
- `POST /groups/:id/leave` -> `src/services/groups/authGroup.ts` (`leaveGroup`)
- `GET /groups/:id/messages` -> `src/services/groups/authGroup.ts` (`getGroupMessages`) -> `src/screens/groups/GroupChatScreen.tsx`
- `POST /groups/:id/messages` -> `src/services/groups/authGroup.ts` (`sendGroupMessage`) -> `src/screens/groups/GroupChatScreen.tsx`

## Legacy-routed domains (no `/v1` prefix today)

These routes are intentionally kept unchanged to avoid breaking existing backend contracts for non-migrated modules:

- `posts/*` -> `src/services/posts/postService.ts` -> post feed and create post screens
- `friends/*` -> `src/services/friends/friendsService.ts` -> friends and search users screens
- `bookings/*` -> `src/services/bookings/bookingsService.ts` -> reservations screens/hooks
- `centers/*` -> `src/services/centers/authCenters.ts`
- `maps/*` -> `src/services/maps/mapsService.ts`
- `hobbies/*` -> `src/services/hobbies/hobbiesService.ts`
- `chats/*` -> `src/services/chat/chatService.ts`

## Resilience and contract rules now enforced

- `x-request-id` header is sent on every request for traceability.
- Non-JSON server errors are handled with safe fallback messages.
- Envelope `{ success, data, error }` is normalized and consumed consistently.
- One automatic retry is applied on network/5xx transient failures.
- On `401`, `apiClient` attempts `POST /v1/auth/refresh` and retries the original request once if a new token is returned.
