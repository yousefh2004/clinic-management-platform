# Doctor Module-Design Note

- `Doctor` has an id, a first name, a last name, an email (unique across active and inactive records), a phone number (unique across active and inactive records), a department id (must reference an existing department), a specialty, an active flag, and the four standard audit columns (created_at, created_by, updated_at, updated_by).

- `GET /api/v1/doctors` requires any authenticated role, is paginated and sortable, accepts optional `name`, `department`, and `active` query parameters to filter results, and returns a `PageResponse<DoctorResponse>`.

- `GET /api/v1/doctors/{id}` requires any authenticated role and returns a `DoctorResponse`, failing with 404 if the id doesn't exist.

- `POST /api/v1/doctors` is STAFF or ADMIN, takes a `DoctorRequest` of first name, last name, email, phone number, department id, and specialty, and fails with 404 if the department doesn't exist or 409 if the email or phone number is already taken.

- `PUT /api/v1/doctors/{id}` is STAFF or ADMIN, takes a `DoctorRequest`, and fails with 404 if the id or department doesn't exist, or 409 if the email or phone number is already taken by another doctor.

- `PATCH /api/v1/doctors/{id}/deactivate` is ADMIN only, sets active to false, and fails with 403 if the caller isn't ADMIN or 404 if the id doesn't exist.

Any request body that fails validation on any of these endpoints returns 400.