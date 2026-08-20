# Patient Module-Design Note

- `Patient` has an id, a first name, a last name, a date of birth, a gender, a phone number (unique across active and inactive records, required), an email (unique across active and inactive records if provided, optional), an address, an active flag, and the four standard audit columns (created_at, created_by, updated_at, updated_by).

- `GET /api/v1/patients` requires any authenticated role, is paginated and sortable, accepts optional `name`, `phoneNumber`, and `active` query parameters to filter results, and returns a `PageResponse<PatientResponse>`.

- `GET /api/v1/patients/{id}` requires any authenticated role and returns a `PatientResponse`, failing with 404 if the id doesn't exist.

- `POST /api/v1/patients` is STAFF or ADMIN, takes a `PatientRequest` of first name, last name, date of birth, gender, phone number, email, and address, and fails with 409 if the phone number is already taken, or 409 if the email is provided and already taken.

- `PUT /api/v1/patients/{id}` is STAFF or ADMIN, takes a `PatientRequest`, and fails with 404 if the id doesn't exist, or 409 if the phone number or provided email is already taken by another patient.

- `PATCH /api/v1/patients/{id}/deactivate` is ADMIN only, sets active to false, and fails with 403 if the caller isn't ADMIN or 404 if the id doesn't exist.

Any request body that fails validation on any of these endpoints returns 400.

