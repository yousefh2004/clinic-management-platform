# Auth Module-Design Note

- `User` has an id, a username (unique), an email (unique), a passwordHash, a role restricted to ADMIN or STAFF, an active flag, and the four standard audit columns (created_at, created_by, updated_at, updated_by).

- `POST /api/v1/auth/login` (no auth required) takes a `LoginRequest` of username/email and password and returns an `AuthResponse` of accessToken and refreshToken, failing with 401 on bad credentials.

- `POST /api/v1/auth/refresh` (no auth required) takes a `RefreshRequest` of refreshToken and returns a new `AuthResponse`, failing with 401 if the refresh token is invalid or expired.

- `GET /api/v1/auth/me` requires any authenticated role and returns a `UserResponse` of username and role, failing with 401 if the request has no valid token.

- `POST /api/v1/users` is ADMIN only, takes a `CreateUserRequest` of username, email, and password, creates a STAFF account, and fails with 403 if the caller isn't ADMIN or 409 if the username or email is already taken.

- `PATCH /api/v1/users/{id}/deactivate` is ADMIN only, deactivates a staff account, and fails with 403 if the caller isn't ADMIN or 404 if the id doesn't exist.

Any request body that fails validation on any of these endpoints returns 400.