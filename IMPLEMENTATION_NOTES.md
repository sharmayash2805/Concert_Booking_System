# Implementation Notes

## Phase 2.1–2.3: Backend security foundation

### Configuration and secrets

- Datasource URL, username, password, JWT secret, token lifetime, and port come from `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, and `PORT`.
- `JWT_SECRET` has no default. Startup fails if it is missing, blank, or shorter than 32 UTF-8 bytes. Values are deliberately absent from `demo/.env.example`.
- Activate `dev` for local schema updates and developer error details; activate `prod` for schema validation and suppressed error details. `spring.jpa.open-in-view` is disabled in common configuration.
- `DB_URL` remains a full JDBC URL supplied by the deployment environment, allowing MySQL TLS and authentication options to vary by environment.

### Authentication and JWT decisions

- JJWT is pinned to `0.12.6` across API, implementation, and Jackson integration artifacts. Tokens use HS256. The configured secret is interpreted as raw UTF-8 bytes and validated to meet the algorithm's 256-bit minimum.
- Parsing uses `Jwts.parser().verifyWith(key).build().parseSignedClaims(token)`, which checks the signature and standard expiration claim before accepting the subject.
- Token lifetime defaults to one hour and is configurable with `JWT_EXPIRATION_MS`.
- BCrypt uses the library's default strength (10), a conventional balance for this small application. Registration and login use dedicated request records; `UserResponse` excludes the password hash. Registration always assigns `USER`, ignoring client-supplied role fields.
- Login responds with `{ "token": ..., "user": ... }`; `/api/auth/me` returns the current authenticated user's safe representation.

### Authorization and booking ownership

- A stateless `OncePerRequestFilter` accepts `Authorization: Bearer` tokens. It resolves the subject against the current user row, sets that `User` as the principal, and grants the role stored in the database. Invalid, expired, or unknown-user tokens receive 401.
- Auth routes and GET event routes are public; booking routes require authentication; `/api/admin/**` and non-GET event routes require `ROLE_ADMIN`; all other routes are denied. CSRF is disabled because credentials are supplied only in an explicit bearer header, not an automatically attached cookie.
- Spring Security permits only internal servlet `ERROR` dispatches in addition to the explicit route rules. This keeps service-level 403 ownership/role errors from being re-authorized as a new request and incorrectly converted into 401 responses.
- `BookingRequest` no longer carries a user ID. Hold requests use the authenticated principal, and quantity changes, confirmation, and cancellation check booking ownership in the service. Administrators can act on any booking; ordinary users cannot.

### Deliberate scope limits and follow-up

- This phase does not add DTO validation, duplicate-email conflict handling, global typed error responses, booking-state idempotency or expiry, zone-locking changes, event listing/CRUD endpoints, or CORS/rate limiting/security headers. Those remain separate plan items.
- The Phase 1 seed includes a plaintext demo user's password, which is not a valid BCrypt credential. Register a fresh account for auth testing; remove/reseed the legacy row through a controlled schema migration rather than silently rewriting existing passwords.
- Existing databases may contain legacy columns or plaintext passwords. The `dev` profile uses Hibernate `update` for local convenience; `prod` uses `validate` and requires an explicitly migrated schema.

## Phase 2.4–2.7: API correctness and hardening

### Validation and errors

- Added Jakarta Bean Validation to registration, login, booking holds, quantity changes, and event create/update requests. Booking quantities are constrained to 1–6; zone IDs must be positive. `BookingService` repeats the quantity bounds as a defense-in-depth invariant.
- `ApiExceptionHandler` returns `{ "status", "code", "message" }` for request validation, malformed JSON, access/domain status exceptions, data conflicts, and unexpected failures. Unexpected exception details are deliberately not returned.
- Email uniqueness conflicts are translated to 409 by the data-integrity handler. More specialized duplicate-email messaging and normalization remain future refinements.

### Persistence and concurrency

- Removed Lombok `@Data` from all JPA entities and retained only generated getters/setters, avoiding relation-sensitive `equals`, `hashCode`, and `toString` behavior.
- Replaced the implicit locked `ZoneRepository.findById` override with an explicit `findByIdForUpdate` query. Capacity-changing paths acquire a pessimistic row lock on the target zone inside a transaction.
- Quantity changes acquire locks in a consistent order: booking row first, then its zone row. This serializes concurrent edits to one booking and ensures capacity comparisons use the latest locked zone value. Holds lock only the zone; cancellations lock the booking then zone before restoring capacity. Ordinary reads no longer take write locks.
- This relies on MySQL/InnoDB pessimistic locking and transaction boundaries. The code returns 409 when current availability cannot satisfy a quantity increase. A multi-instance race test remains desirable; no optimistic retry loop was added.
- Event deletion is blocked by database foreign-key relationships and returned as a 409 when zones/bookings still reference the event; no cascade or silent orphan deletion is used.

### API surface and response boundaries

- Added `GET /api/events`, `GET /api/events/{id}`, and admin-protected event POST/PUT/DELETE. Event list/detail responses include the available zones.
- Added authenticated `GET /api/bookings/me`. Booking hold, quantity update, and list responses use `BookingResponse` rather than serializing JPA graphs.
- Actuator web exposure is restricted to `health`; details are hidden. Health is the sole public actuator route.

### Network controls and tradeoffs

- Removed controller-level wildcard CORS annotations. `ALLOWED_ORIGINS` is a comma-separated allowlist; it defaults to no cross-origin access, allows only explicit API methods/headers, and does not enable credentials because auth uses bearer headers.
- A custom in-memory limiter allows five POST attempts per IP per minute across login/register, returns JSON 429 and `Retry-After`, and bounds stale-map cleanup. This is per-process, not distributed; use a shared store or gateway limiter for multi-instance production.
- Added `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, HSTS for secure requests, and a restrictive `Permissions-Policy`.
- No full Docker packaging, rate-limit persistence, security integration suite, or dependency-update report was added in this implementation slice. These remain production-readiness follow-ups.

## Phase 3.1–3.2: Frontend API and authentication wiring

### API contracts and server state

- Replaced `src/api/api.js` with typed `src/lib/api.ts`. The base URL uses `VITE_API_URL`, defaulting to `/api`; local Vite proxies that path using `API_PROXY_TARGET`.
- Removed the runtime mock event and booking fixtures. Event cards/details use the actual event response (`id`, `title`, `description`, `venue`, `dateTime`, `zones`); booking pages use the backend booking response and status.
- React Query owns server state. Shared hooks cover event list/detail, current-user bookings, holds, quantity changes, confirmations, cancellations, and event CRUD. Mutations invalidate related event/booking queries to refresh availability and status.
- The API currently does not return artist, city, image, or doors-time fields. The UI intentionally uses venue and title rather than synthesizing those missing fields.
- Confirmation uses `/booking-confirmation/:bookingId` and reloads by querying `/api/bookings/me`, then loads its event details. The actual booking ID/status/total are displayed.

### Client session and token-storage tradeoff

- `AuthContext` exposes `user`, `loading`, `login`, `register`, and `logout`; it restores a session with `/api/auth/me` on page load. Register creates the account and then signs in using the returned credentials.
- The JWT is stored in `localStorage` under `concert-booking-token`. Axios reads it for each request and attaches `Authorization: Bearer <token>`. The response interceptor removes it on 401 and notifies the auth provider, which clears user state and navigates to login.
- This satisfies the backend's bearer-header contract and keeps page reloads signed in. Tradeoff: JavaScript can read localStorage, so an XSS vulnerability could expose the token. HttpOnly-cookie/CSRF migration is deferred; do not treat this storage choice as XSS-proof.
- `/dashboard` is guarded for signed-in users, `/admin` is shown and rendered only for `role === ADMIN`, and the server remains the authority for both access decisions.
- Login/register use React Hook Form with Zod client-side constraints matching current backend DTO bounds. Backend validation remains authoritative.

## Phase 3.3–3.4: Asset and repository hygiene

- Removed Google Fonts and external event-image hotlinks. Event cards use the local `/placeholder.svg` asset until Phase 4 supplies owned artwork/fonts.
- Replaced template metadata and the frontend starter README, and reduced the footer to working navigation and the repository link.
- Removed the obsolete seat grid/page/style/navigation shim, fixture module, Bun lockfiles, and unreferenced generated shadcn UI modules.
- Kept only the UI primitives referenced by current routes or their active composition: button, input, label, Sonner, plus essential files as validated after pruning.
- Removed unused Radix modules and UI packages, `lovable-tagger`, its Vite plugin, unused date-fns, and the animation plugin after confirming its UI-only utility classes were confined to removed primitives. Kept `autoprefixer`, `postcss`, and `@testing-library/jest-dom`; depcheck reported them as unused, but PostCSS config and test setup import them directly.
- Regenerated `package-lock.json` with npm; it is now the only frontend lockfile. The last audit reported 39 dependency vulnerabilities (2 critical), not remediated in this visual/hygiene phase.
- Final checks: lint reports zero errors and three retained fast-refresh warnings; strict `tsc --noEmit` and Vite build pass. The build output is approximately 426 kB JS and 23 kB CSS before gzip.

## Phase 4.1–4.3: Box Office foundations and signature booking surfaces

### Theme tokens and typography

- Replaced the purple/neon HSL palette with CSS variables for Paper `#EFE8D8`, Ink `#16130F`, and Vermilion `#D9482B`; semantic `primary`/`accent` map to vermilion and the text/border tokens map to ink.
- Tailwind semantic fonts are `Big Shoulders Display` for display text, `Public Sans` for body text, and `DM Mono` for ticket data. Google Fonts are imported in `index.css`; the Phase 5 CSP permits only the corresponding Google Fonts stylesheet and font hosts. Self-hosting those fonts remains a stricter-CSP follow-up.
- Tailwind radius tokens are capped at 2px. `print-shadow` and `print-shadow-sm` are hard offset shadows; there are no blur/glow theme utilities or Lucide dependencies. UI symbols use small text marks instead.
- Shared button variants now use the vermilion fill or ink outline. Existing pages retain their copy, but their shared controls and booking surfaces use the Box Office palette.

### Venue map and ticketing surfaces

- `ZoneMap` renders SVG paths for stage-adjacent pit, left, right, and back zones. Each available backend zone path is keyboard operable and reports the zone name, live capacity, and price. Fill opacity indicates relative remaining availability; selection uses vermilion.
- Event cards use a poster-like local image surface, condensed uppercase title, stacked day/month block, venue, and mono-spaced INR starting price. The backend has no owned poster image, so the current local placeholder is intentionally used until assets are supplied.
- The shared `TicketStub` uses a CSS mask for a perforated edge, real booking ID/status/zone/quantity/total, and a deterministic barcode pattern derived from that ID. Dashboard and confirmation both use it.
- Checkout shows a ten-minute vermilion hold countdown and attempts to cancel the pending booking at zero. Limitation: the current backend response does not carry a hold-expiration timestamp or enforce scheduled expiry, so this timer is client-side only and is not authoritative across refreshes/tabs. A backend expiry contract is needed before presenting it as a guaranteed server hold.

## Phase 4.4–4.6: Copy, branding, and required pages

- Rebranded the visible frontend as Stubline, including navigation, footer, auth marks, document/social metadata, and frontend README. Landing-page copy now describes event browsing and reservations directly and attributes the build to Yash Sharma with a link to the GitHub profile.
- Added a landing-page build-notes section documenting row-level database locking for seat counts, React Query server state, and the Spring Boot 3 / React 18 stack. Removed the remaining promotional filler and replaced it with literal interface copy; no fake audience metrics or UI emojis are used.
- Added `/about` with the project colophon, plus `/terms` and `/privacy` demo documents. Footer links expose all three pages. Registration requires explicit acceptance of the demo terms and privacy notice before submitting.
- Added a visible booking-summary notice that no real payments are processed. Legal copy marks itself as demo-only, explains that reservations are not valid tickets, describes the token's local-storage behavior, and advises against entering sensitive data.
- The shared application shell uses semantic `<nav>`, `<main>`, and `<footer>` landmarks. Phase 4 redesign tasks in sections 4.4, 4.5, and 4.6 are complete.

## Phase 5.1–5.5: Hosting preparation, CI, and production dependency audit

- Added `FrontEnd/vercel.json` with the `/api/:path*` same-origin proxy rewrite, an SPA fallback that excludes API paths, and CSP, HSTS, MIME-sniffing, referrer, permissions, and frame protections. The API rewrite currently targets `https://YOUR-SERVICE.onrender.com`; replace `YOUR-SERVICE` with the deployed Render hostname before publishing. The CSP allows Google Fonts because the current stylesheet imports those fonts; scripts and API connections remain same-origin.
- Added a two-stage Java 17 Docker build in `demo/Dockerfile`. The runtime uses a non-root account, binds to `${PORT:-8081}`, includes a health check for `/actuator/health`, and applies container-aware JVM limits for a 512 MB instance.
- Added pull-request CI at `.github/workflows/ci.yml` for frontend install, lint, typecheck, tests, production dependency audit and build, plus Maven verification on Java 17. Added weekly Dependabot updates for npm, Maven and GitHub Actions.
- Ran `npm audit --omit=dev`: compatible remediation removed the Axios, `form-data`, and `follow-redirects` findings. Two moderate React Router advisories remain; npm's suggested automatic fix requires the breaking React Router 7 upgrade, so it was not forced. There are no remaining high or critical production findings.
- Validation: `demo/mvnw clean package -DskipTests` passed with Java 17. Frontend lint, `npx tsc --noEmit`, Vitest (1 test), and `npm run build` passed; lint retains three existing Fast Refresh warnings. A local `npm ci` attempt was blocked because the running Windows dev server held native esbuild/Rollup binaries open; dependencies were restored with `npm install`, and all frontend checks passed afterward. The clean install remains for the Linux CI runner to confirm.
- Phase 5 deployment prerequisites and the requested local production dependency audit are complete. No service has been deployed, and the Render URL, provider secrets/spend limits, full-history secret scan, Maven CVE scan, and live security/header/Lighthouse checks remain deployment/release gates.