# Appointment Module-Design Note

- `Appointment` has an id, a doctor id, a patient id, an appointment date and time, a status (SCHEDULED, COMPLETED, or CANCELLED), and the four standard audit columns (created_at, created_by, updated_at, updated_by).

- `GET /api/v1/appointments` requires any authenticated role, is paginated and sortable, accepts optional `doctorId`, `patientId`, date range, and `status` query parameters to filter results, and returns a `PageResponse<AppointmentResponse>`.

- `GET /api/v1/appointments/{id}` requires any authenticated role and returns an `AppointmentResponse`, failing with 404 if the id doesn't exist.

- `POST /api/v1/appointments` is STAFF or ADMIN, takes an `AppointmentRequest` of doctor id, patient id, and date/time, and fails with 404 if the doctor or patient doesn't exist, 400 if the doctor or patient is inactive, 400 if the date/time isn't in the future, or 409 if the doctor already has a non-cancelled appointment at that exact date/time.

- `PUT /api/v1/appointments/{id}` is STAFF or ADMIN, takes an `AppointmentRequest`, validates the future-date rule only if the date/time is being changed, fails with 404 if the id doesn't exist, 409 if a completed appointment, and 409 if the new slot conflicts with another non-cancelled appointment for that doctor.

- `PATCH /api/v1/appointments/{id}/cancel` is STAFF or ADMIN, sets status to CANCELLED, and fails with 409 if the appointment is already completed.

- `PATCH /api/v1/appointments/{id}/complete` is STAFF or ADMIN, sets status to COMPLETED, and fails with 409 if the appointment is cancelled.

Any request body that fails validation on any of these endpoints returns 400.