# Department Module-Design Note

- `Department` has an id, a name, a code (unique), and the four standard audit columns (created_at, created_by, updated_at, updated_by).

- `GET /api/v1/departments` requires any authenticated role, is paginated and sortable, accepts an optional `name` query parameter to filter results, and returns a `PageResponse<DepartmentResponse>`.

- `GET /api/v1/departments/{id}` requires any authenticated role and returns a `DepartmentResponse`, failing with 404 if the id doesn't exist.

- `POST /api/v1/departments` is STAFF or ADMIN, takes a `DepartmentRequest` of name and code, and fails with 409 if the code is already taken.

- `PUT /api/v1/departments/{id}` is STAFF or ADMIN, takes a `DepartmentRequest`, and fails with 404 if the id doesn't exist or 409 if the code is already taken by another department.

- `DELETE /api/v1/departments/{id}` is ADMIN only, and fails with 403 if the caller isn't ADMIN, 404 if the id doesn't exist, or 409 if the department still has doctors assigned to it.

Any request body that fails validation on any of these endpoints returns 400.

