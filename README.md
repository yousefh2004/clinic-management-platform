# Clinic Management Platform (CMP)

A full-stack clinic management system built with Spring Boot (backend) and Angular (frontend), covering staff authentication, department/doctor/patient management, and appointment scheduling.

## Technologies Used

**Backend:** Java 17, Spring Boot 4, Spring Data JPA, Spring Security, JWT authentication, PostgreSQL, Maven, Lombok, Springdoc OpenAPI (Swagger)

**Frontend:** Angular 22 (standalone components), Angular Material, Reactive Forms, RxJS

## Running the Backend

1. Ensure PostgreSQL is running and a database named `cmp_db` exists.
2. Open the `backend` folder in IntelliJ IDEA.
3. Set the following environment variables in your Run Configuration:
   - `DB_USERNAME` — your Postgres username
   - `DB_PASSWORD` — your Postgres password
   - `JWT_SECRET` — any long random string (used to sign JWTs)
4. Run the application. The schema (`schema.sql`) is applied automatically on startup.
5. The API runs at `http://localhost:8080`, with Swagger UI at `http://localhost:8080/swagger-ui.html`.

## Running the Frontend

1. Open the `frontend` folder in a terminal.
2. Run `npm install`.
3. Run `ng serve`.
4. The app runs at `http://localhost:4200`.

## Running Both Together

Start the backend first (IntelliJ ▶ Run), then start the frontend (`ng serve`) in a separate terminal. The Angular app is configured to call the backend at `http://localhost:8080/api/v1` (see `src/environments/environment.ts`).

## Database Setup

The schema is defined in `backend/src/main/resources/schema.sql` and applied automatically on every backend startup (`spring.sql.init.mode: always`). No manual steps are required beyond having an empty `cmp_db` database created and the connection details set correctly in `application.yaml` / your environment variables.

## Logging In

On first startup, a seeded ADMIN account is created automatically if none exists:
- **Username:** `admin`
- **Password:** the value of `ADMIN_DEFAULT_PASSWORD`, defaulting to `Admin@123!` if not set as an environment variable.

To obtain a token for manual API testing (e.g. via Swagger or Postman):
1. Call `POST /api/v1/auth/login` with the seeded admin credentials.
2. Copy the `accessToken` from the response.
3. In Swagger UI, click **Authorize**, paste the token, and click **Authorize** again.

## V1 Security Simplifications

A few deliberate simplifications were made for this V1 scope, documented here per the project spec:

- **Stateless refresh tokens** — refresh tokens are not stored server-side and cannot be individually revoked. Logout only clears tokens from the browser; a stolen refresh token remains valid until it naturally expires.
- **Tokens stored in `localStorage`** — chosen for session persistence across browser restarts. This is readable by any script running on the page, trading some XSS exposure for simplicity. Not automatically the right choice for a production deployment.
- **No refresh token rotation** — a fixed-lifetime refresh token is used without rotating it on each use.

These tradeoffs are acceptable for this project's scope but would need reconsideration in a production system.