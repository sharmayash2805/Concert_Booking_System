# Stubline

A concert booking demo with a Spring Boot/MySQL API in `demo/` and a React/Vite frontend in `FrontEnd/`. It supports event browsing, ticket-zone reservations, account registration, and booking history. It does not process payments or issue real tickets.

## Requirements

- Java 17
- MySQL 8, running locally
- Node.js 20 or newer and npm

## Configure MySQL

The backend now requires database and JWT configuration from the environment. Copy the variable names from `demo/.env.example`, then set `DB_URL`, `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET` before starting it. The JWT secret must contain at least 32 UTF-8 bytes. `DB_URL` may point to `concert_booking_dev` and should include `createDatabaseIfNotExist=true`, `serverTimezone=UTC`, plus the SSL and authentication options appropriate for your local MySQL setup.

PowerShell:

```powershell
$env:DB_USER = "root"
$env:DB_PASSWORD = "your-local-mysql-password"
$env:DB_URL = "jdbc:mysql://localhost:3306/concert_booking_dev?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:JWT_SECRET = "replace-with-at-least-32-random-bytes"
$env:SPRING_PROFILES_ACTIVE = "dev"
```

Bash:

```bash
export DB_USER=root
export DB_PASSWORD='your-local-mysql-password'
export DB_URL='jdbc:mysql://localhost:3306/concert_booking_dev?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
export JWT_SECRET='replace-with-at-least-32-random-bytes'
export SPRING_PROFILES_ACTIVE=dev
```

The `dev` profile updates the schema and loads the Phase 1 SQL seed. The `prod` profile validates the schema and hides error details; deploy with `SPRING_PROFILES_ACTIVE=prod` after applying schema changes. `JWT_EXPIRATION_MS` optionally controls token lifetime and defaults to one hour. `PORT` optionally overrides 8081.

The seeded Phase 1 demo user's stored password predates BCrypt and cannot be used to log in. Register a new account to test authentication. Never use the example JWT secret in a shared environment.

## Run the backend

From the repository root:

```powershell
cd demo
## Set the environment variables above before this command
./mvnw.cmd spring-boot:run
```

On macOS/Linux, use `./mvnw spring-boot:run`. The API listens on `http://localhost:8081`. Check the event endpoint at `http://localhost:8081/api/events/1`; it returns the event and its zones.

## Run the frontend

In a second terminal:

```powershell
cd FrontEnd
npm install --no-audit --no-fund
npm run dev
```

The Vite server listens on `http://localhost:8080` and proxies `/api` requests to `http://localhost:8081`. Set `API_PROXY_TARGET` when the backend is running elsewhere. For a hosted API, set `VITE_API_URL` to its API base URL; `/api` is the default.

Build the frontend with `npm run build` from `FrontEnd/`.

## Deployment architecture

- **Frontend:** deploy `FrontEnd/` as a Vercel Vite project. Use `npm run build` and `dist` as the output directory. Set `VITE_API_URL=/api` to use the same-origin API rewrite.
- **API:** deploy `demo/` as a Docker web service on Render, using `demo/Dockerfile`. The image listens on the `PORT` environment variable (default 8081) and exposes `/actuator/health` for health checks.
- **API destination:** replace `YOUR-SERVICE` in `FrontEnd/vercel.json` with the actual Render service hostname before deploying. Keep the `/api/:path*` rewrite ahead of the SPA fallback.
- **Backend environment:** configure `DB_URL`, `DB_USER`, `DB_PASSWORD`, and a `JWT_SECRET` of at least 32 UTF-8 bytes in the hosting provider; set `SPRING_PROFILES_ACTIVE=prod`. Never put these secrets in Vercel `VITE_*` variables.
- **Security headers:** Vercel applies the CSP and transport/browser security headers in `FrontEnd/vercel.json`. The policy permits Google Fonts stylesheet/font hosts because the current design imports fonts from Google; scripts and API connections remain same-origin.
- **CI:** pull requests run frontend install, lint, TypeScript, tests, production dependency audit and build, plus `./mvnw -B verify` on Java 17. Dependabot checks npm, Maven and GitHub Actions weekly.

## Audit and remaining checks

- The production dependency audit reports zero high/critical findings after compatible fixes. Two moderate React Router advisories remain; npm only offers an automatic fix via a major React Router 7 upgrade, which should be handled and tested separately.
- This repository is prepared for deployment but is not deployed. The Render service hostname must be configured in `vercel.json`, and provider environment variables and spend limits must be set before release.
- Full-history secret scanning, Maven vulnerability analysis, deployed endpoint/header checks, and browser/Lighthouse review are not represented by the local npm audit or CI configuration; run them against the configured deployment before launch.
- Booking holds currently use a client-side countdown; the backend does not persist or enforce a hold-expiration timestamp. The app stores its bearer JWT in browser local storage. Do not submit sensitive data to this demo.
- The Phase 1 seeded account has a legacy plaintext password and is not usable with BCrypt. Register a fresh account for authentication testing.