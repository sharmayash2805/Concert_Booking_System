# TODO.md: Concert Booking System, fix, harden, redesign

Repo: `sharmayash2805/Concert_Booking_System` (branch `master`)
Layout: `demo/` = Spring Boot backend (Java 17, MySQL) | `FrontEnd/` = Vite + React + TS + shadcn/ui
Owner/profile to credit in the UI: https://github.com/sharmayash2805

> **How to use this file (human or AI agent)**
> Work top to bottom. Each phase ends with a **Gate**: do not start the next phase until the gate passes.
> Tick boxes as you go. File paths are relative to the repo root. Every item says *why* so you can judge it, not just copy it.
> Findings marked **[VERIFIED]** were reproduced (build, lint, audit) on a fresh clone. Findings marked **[READ]** come from reading the code; the backend could not be compiled in the analysis sandbox, so confirm those by running it.

---

## 0. What I found: the short version

### Why it "worked before and now errors"

Ranked by likelihood. The first three alone explain most "it was fine on my machine" failures.

1. **The frontend only works against a database that happens to contain specific rows.** [READ]
   `FrontEnd/src/pages/EventDetails.tsx` hardcodes `userId: 1` and a `zoneIdMap` of `{left:5, right:6, front:7, away:8}`.
   On any fresh or reset MySQL (new laptop, dropped schema, `ddl-auto=update` on an empty DB), those IDs do not exist.
   `BookingController.holdTickets` then hits `userRepository.findById(1).orElseThrow()` and the user sees "Failed to reserve zone".
   Your old DB had those rows. A new one does not. There is no seed script in the repo.
2. **MySQL itself.** [READ] `application.properties` points to `localhost:3306/concert_booking` with `root` and a password committed in plain text. If MySQL is not running, the schema `concert_booking` does not exist (no `createDatabaseIfNotExist=true`), or the password differs on the new machine, the backend will not start.
3. **Hosting mismatch.** [READ] The API base URL is hardcoded to `http://localhost:8081/api` in `FrontEnd/src/api/api.js`. It can never work on Vercel (and an `https` page calling `http` is blocked as mixed content anyway).
4. **Spring Boot `4.0.5` + JJWT `0.11.5`.** [READ] Boot 4 moved to Spring Framework 7, Hibernate 7 and Jackson 3. JJWT 0.11.5 is old and its Jackson module targets Jackson 2. It may work, but it is the first suspect if the app fails at startup with `NoSuchMethodError` / `ClassNotFoundException`. IntelliJ is set to JDK 21 while `pom.xml` says Java 17: fine, but make them match.
5. **A real logic bug that corrupts bookings** (see 1.1, "cancel on unmount"). [READ] A confirmed booking is cancelled the moment you navigate to the confirmation page. This looks like "bookings randomly vanish".
6. **Port clash.** Backend `8081`, Vite `8080`. If anything else holds those ports, startup fails.

### What the app actually is right now

- The **login and register pages do not call the backend at all.** They only show a success toast. There is no real session.
- **Events, bookings, dashboard and admin are all mock data** (`src/data/mockData.ts`). The backend has no endpoint to list events or zones; `EventController` only has an unauthenticated `DELETE`.
- **Every mock concert date is already in the past** (May to Sep 2026; today is Oct 2026). [VERIFIED]
- Prices are shown in `$` on cards, dashboard and admin but in `₹` on the zone map. Mixed currency.
- `SeatGrid.tsx` and `Index.tsx` are dead code from an earlier seat-based design.
- The security config is `anyRequest().permitAll()`: **every endpoint is public**, including deleting events.

### Measured on a fresh clone [VERIFIED]

| Check | Result |
|---|---|
| `npm ci` + `vite build` | passes (392 kB JS, 67 kB CSS) |
| `npm audit` | **43 vulnerabilities: 2 critical, 33 high, 7 moderate, 1 low** |
| `eslint .` | **7 errors**, 7 warnings (4x `no-explicit-any` in `EventDetails.tsx`, `require()` in `tailwind.config.ts`, empty interface in `textarea.tsx`) |
| Tests | 1 placeholder test (`expect(true).toBe(true)`) |
| Lockfiles | **three** (`package-lock.json`, `bun.lock`, `bun.lockb`). Vercel picks the package manager from the lockfile it finds, so you can get a different install than local. |
| Secrets in git | DB password `Sharma@2805` and JWT secret in the public repo history |
| `.idea/` committed | yes, at repo root (the ignore rule is only inside `demo/`) |

---

## PHASE 1: Get it running locally (stop the bleeding)

**Goal:** a fresh clone runs end to end with one documented command per side.

- [ ] **1.1 Fix the cancel-on-unmount bug.** `FrontEnd/src/pages/EventDetails.tsx`, the `useEffect` that returns a cleanup calling `/bookings/cancel/${pendingBookingId}`.
  - Problem A: the cleanup runs when you navigate to `/booking-confirmation` after a successful confirm, so it cancels the booking you just confirmed and releases the seats.
  - Problem B: the effect depends on `pendingBookingId`, so the cleanup also fires on every zone switch, double-cancelling a booking `handleZoneSelect` already cancelled. The backend then adds the capacity back twice (capacity inflation).
  - Fix: clear `pendingBookingId` (or set a `confirmedRef`) before navigating; make the cleanup run only on real unmount and only if not confirmed; make the backend idempotent (1.9). Better still: drop the client-side cancel and rely on server-side hold expiry (1.8).
- [ ] **1.2 Remove hardcoded `userId: 1` and `zoneIdMap`.** Zones must come from the API (`GET /api/events/{id}`); the user must come from the JWT on the server (see 2.3). Nothing in the frontend should know a database ID in advance.
- [ ] **1.3 Add a seed + schema strategy.**
  - Add Flyway (`spring-boot-starter-flyway` / `flyway-mysql`) with `V1__schema.sql` and `V2__seed_demo.sql` (events with **future-relative** dates, zones, one demo admin, one demo user with a BCrypt hash).
  - Set `spring.jpa.hibernate.ddl-auto=validate` (not `update`).
  - Add `?createDatabaseIfNotExist=true&useSSL=...&serverTimezone=UTC` handling in the JDBC URL, or document `CREATE DATABASE`.
- [ ] **1.4 Move all config to environment variables** (details in section 2). The app must refuse to start with a missing `JWT_SECRET`.
- [ ] **1.5 Align versions.**
  - Backend: pin Java 17 or 21 in `pom.xml` (`<java.version>`) and in IntelliJ project SDK. Add `.sdkmanrc` or document it.
  - Confirm Spring Boot `4.0.x` resolves and starts. If it fights you, drop to the latest 3.5.x line. Do not chase Boot 4 ecosystem gaps for a portfolio project.
  - Upgrade JJWT from `0.11.5` to the current 0.12.x+ and rewrite `JwtUtil` to the 0.12 API (`Jwts.parser().verifyWith(key)...`, `.signWith(key)`).
  - Frontend: add `"engines": {"node": ">=20"}` and a `.nvmrc`.
- [ ] **1.6 One package manager.** Keep `package-lock.json`; delete `bun.lock` and `bun.lockb`. Re-run `npm ci`.
- [ ] **1.7 Add a root `.gitignore`** (`.idea/`, `.vscode/`, `*.env*`, `target/`, `node_modules/`, `dist/`, `.DS_Store`), then `git rm -r --cached .idea`.
- [ ] **1.8 Hold expiry.** Holds currently never expire; an abandoned tab keeps seats forever. Add `holdExpiresAt` to `Booking`, a `@Scheduled` job (every 30 to 60 s) that releases expired `PENDING` holds, and return `holdExpiresAt` to the client for a countdown (this becomes a signature UI element, see Phase 4).
- [ ] **1.9 Make booking state transitions explicit and idempotent.** `PENDING -> CONFIRMED | CANCELLED | EXPIRED`, nothing else. `releaseTickets` must no-op unless status is `PENDING` (today it releases capacity again for an already cancelled or even confirmed booking). Replace the `String status` with an enum.
- [ ] **1.10 Real "does it run" smoke test.** Backend: `./mvnw spring-boot:run`, then `curl localhost:8081/actuator/health`. Frontend: `npm run dev`. Write both commands in the root `README.md`.

**Gate 1:** on a machine with an empty MySQL, `README` steps alone produce a working app: browse events (from DB), hold a zone, confirm, see the booking in My Bookings (from DB), and it survives a page refresh.

---

## PHASE 2: Backend correctness and security (`demo/`)

All of these are **[READ]**. Paths are under `demo/src/main/java/com/example/booking/`.

### 2.1 Secrets and config (`resources/application.properties`, `security/JwtUtil.java`)
- [ ] Replace literals with env placeholders: `spring.datasource.url=${DB_URL}`, `...username=${DB_USER}`, `...password=${DB_PASSWORD}`, `jwt.secret=${JWT_SECRET}`, `server.port=${PORT:8081}`.
- [ ] `JwtUtil`: read the secret via `@Value("${jwt.secret}")`, require at least 32 bytes, fail fast if absent. Remove the hardcoded `"mysecretkey..."`. Make the expiry configurable.
- [ ] **Rotate everything that ever touched git:** change the MySQL root password and treat the JWT secret as burned. Both are in public history. Deleting the line does not remove it from history.
- [ ] Create `application-prod.properties` and `application-dev.properties`. Production: `spring.jpa.show-sql=false`, `server.error.include-message=never`, `server.error.include-stacktrace=never`, `spring.jpa.open-in-view=false`.
- [ ] Add `demo/.env.example` (names only, no values) and document it.
- [ ] Stop running as MySQL `root`. Create a dedicated user with only the privileges the app needs on one schema.

### 2.2 Authentication (`controller/AuthController.java`, `model/User.java`)
- [ ] **Hash passwords.** Passwords are stored and compared in plain text (`getPassword().equals(...)`). Add a `BCryptPasswordEncoder` (or `Argon2`) bean; hash on register; `matches()` on login. Migrate or drop existing plain-text rows.
- [ ] **Stop returning the password.** `register` returns the saved `User` entity (including the password field) as JSON. Return a `UserResponse` DTO (id, name, email, role).
- [ ] **Stop mass assignment of `role`.** A client can `POST /api/auth/register` with `"role":"ADMIN"` and become admin. Ignore any client-supplied role; force `USER`. Create admins via seed or a protected admin-only endpoint.
- [ ] Make `User.email` `@Column(unique = true, nullable = false)`; return `409` on duplicate email, not a 500 stack.
- [ ] Login: return JSON `{token, user}` with `401` on failure. It currently `throw new RuntimeException("Invalid credentials")` which becomes a 500. Use one generic message for both unknown email and wrong password, and constant-time compare (BCrypt handles it).
- [ ] Add `GET /api/auth/me`.
- [ ] Password policy (min length 8+, reject trivially common ones) and email normalisation (lowercase, trim).

### 2.3 Authorisation (`security/SecurityConfig.java`)
Today: `.requestMatchers("/api/auth/**").permitAll().anyRequest().permitAll()` and `csrf.disable()` with no JWT filter. **Nothing is protected.** `JwtUtil.extractEmail` is never called anywhere.
- [ ] Add a `OncePerRequestFilter` that reads `Authorization: Bearer ...` (or an httpOnly cookie, see 3.2), validates it, and sets the `SecurityContext`.
- [ ] Rules: `GET /api/events/**` public; `/api/auth/register|login` public; `/api/bookings/**` authenticated; `POST/PUT/DELETE /api/events/**` and `/api/admin/**` require `ROLE_ADMIN`; `anyRequest().denyAll()` as the default (deny by default, allow explicitly).
- [ ] **Never trust `userId` from the request body.** `BookingRequest.userId` lets anyone book as anyone. Remove it; take the user from the authenticated principal.
- [ ] **Fix IDOR.** `confirm/{id}`, `cancel/{id}`, `update-quantity/{id}` accept any booking ID. Verify `booking.user.id == principal.id` (or admin) in the service.
- [ ] Session policy `STATELESS`. If you use cookie-based auth, re-enable CSRF properly (see 3.2); if you use Bearer tokens in a header, CSRF can stay off, but then say so in a comment.
- [ ] Add `@EnableMethodSecurity` and `@PreAuthorize("hasRole('ADMIN')")` on admin controllers as a second layer.

### 2.4 Input validation and error handling
- [ ] Add `spring-boot-starter-validation`. Use request DTOs with `@NotBlank`, `@Email`, `@Size`, `@Min(1) @Max(6)` and `@Valid` on every `@RequestBody`. Stop binding JSON straight onto entities (`@RequestBody User user`).
- [ ] **Negative / zero quantities.** `ticketCount` and `quantity` are never validated. `ticketCount = -50` *increases* a zone's capacity; `update-quantity` with `0` or a negative number does the same. Enforce `1..N` per booking and a per-user cap.
- [ ] `body.get("quantity")` unboxes a possible `null` -> NPE. Use a DTO.
- [ ] Add a `@RestControllerAdvice` returning consistent JSON errors (`{status, code, message}`): `400` validation, `401`, `403`, `404`, `409`, never leak stack traces or raw exception messages. Replace every `orElseThrow()` (no message) and `RuntimeException` with typed exceptions.
- [ ] Delete `System.out.println("🔥 DELETE EVENT HIT: ...")` (emoji + console debugging + it logs user-controlled input). Use SLF4J at the right level.

### 2.5 Data integrity and concurrency (`service/BookingService.java`, `repository/ZoneRepository.java`)
- [ ] `ZoneRepository` overrides `findById` with `@Lock(PESSIMISTIC_WRITE)`. This silently changes every `findById` into `SELECT ... FOR UPDATE`. Give it an explicit name (`findByIdForUpdate`) and use it only where needed.
- [ ] `updateHoldQuantity` modifies zone capacity through `booking.getZone()` **without** taking that lock, so two users changing quantity at once can oversell. Lock the zone there too, or add `@Version` for optimistic locking and handle `OptimisticLockException` with a retry or `409`.
- [ ] Add DB constraints: `CHECK (available_capacity >= 0)`, `CHECK (available_capacity <= total_capacity)`, foreign keys, indexes on `booking.user_id`, `booking.zone_id`, `booking.status`.
- [ ] Money: `Zone.price` is `double`, cast to `int` for `totalPrice`. Store prices as integer minor units (paise) or `BigDecimal`. Compute totals only on the server (the client total in `EventDetails.tsx` is for display only).
- [ ] Replace `@Data` on JPA entities (`equals/hashCode/toString` over lazy relations can trigger loads and recursion). Use `@Getter/@Setter`, and DTOs at the API boundary.
- [ ] `EventRepository.deleteById` on an event with zones/bookings will hit FK violations or orphan rows. Define the cascade/soft-delete rule (recommended: soft delete or block deletion when bookings exist).
- [ ] `Booking.status` and `User.role` should be enums (`@Enumerated(EnumType.STRING)`).

### 2.6 Missing endpoints the frontend needs
- [ ] `GET /api/events` (filters: `q`, `city`, pagination), `GET /api/events/{id}` (with zones and live availability).
- [ ] `POST /api/events`, `PUT /api/events/{id}`, `DELETE /api/events/{id}` (admin only).
- [ ] `GET /api/bookings/me`.
- [ ] `GET /actuator/health` (and nothing else exposed by Actuator).
- [ ] Add `Event` fields the UI already shows: `artist`, `city`, `imageUrl`, `doorsTime`. Today the entity only has title/description/venue/dateTime, so the UI's `artist`, `city`, `image` have no backend source.

### 2.7 Network and production hardening
- [ ] **CORS.** Remove the four `@CrossOrigin` (wildcard) annotations. Define one `CorsConfigurationSource` bean with allowed origins from `${ALLOWED_ORIGINS}`, explicit methods and headers, no `*` together with credentials.
- [ ] **Rate limiting.** Add Bucket4j (or a small filter) on `/api/auth/**` (e.g. 5 attempts/min/IP) and a looser global limit. Add account lockout/backoff after repeated failed logins. Return `429` with `Retry-After`.
- [ ] **Security headers** (Spring Security `headers()` config): `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, HSTS (production), `Permissions-Policy`. The API returns JSON so a strict CSP like `default-src 'none'` is fine here.
- [ ] `server.forward-headers-strategy=framework` so redirects and HTTPS detection work behind Render's proxy.
- [ ] Add `Dockerfile` (multi-stage, non-root user, container-aware JVM flags for a 512 MB box, see `DEPLOYMENT.md`).
- [ ] Add `spring-boot-starter-actuator`, expose only `health` (and `info`).
- [ ] Tests: add `@SpringBootTest` + Testcontainers (or H2 in MySQL mode) covering register/login, hold/confirm/cancel, oversell race, IDOR, role escalation attempts.
- [ ] Remove or pin the unused Lombok if you move to records/DTOs; run `./mvnw dependency:analyze` and `./mvnw versions:display-dependency-updates`.

**Gate 2:** `curl` proof for each: anonymous `DELETE /api/events/1` returns 401; user token on admin route returns 403; user A cannot confirm user B's booking; negative quantity returns 400; register with `role=ADMIN` yields a `USER`; wrong password returns 401 JSON; 6th rapid login attempt returns 429.

---

## PHASE 3: Frontend correctness and security (`FrontEnd/`)

### 3.1 Wire it to the real backend
- [ ] Replace `src/api/api.js` with a typed `src/lib/api.ts`. Base URL from `import.meta.env.VITE_API_URL` (default `/api`). Add `FrontEnd/.env.example`. Never hardcode `localhost`.
- [ ] Implement `Login.tsx` and `Register.tsx` against the real endpoints, using `react-hook-form` + `zod` (already installed and unused). Show real field errors. Disable the button while submitting. Do not show "Login successful" before the server says so.
- [ ] Add `AuthContext` (user, login, logout, loading) and `ProtectedRoute` / `AdminRoute`. **A route guard is UX only; the server enforces access** (2.3). `/admin` and `/dashboard` are reachable by anyone today and the Navbar links to `/admin` for everybody.
- [ ] Hide the Admin link unless `user.role === 'ADMIN'`; show Login/Logout properly (the Navbar always shows "Login").
- [ ] Replace mock data usage with React Query hooks (`useEvents`, `useEvent(id)`, `useMyBookings`, mutations for hold/update/confirm/cancel). `QueryClientProvider` is already set up and unused. Delete `mockData.ts` once the API serves everything (keep a typed fixture only for tests/Storybook).
- [ ] Admin page: call the real CRUD endpoints. Today "Save" and "Delete" only mutate local React state and are lost on refresh; it also labels price in `$`.
- [ ] Dashboard: render real bookings with real status (`CONFIRMED`/`CANCELLED`/`EXPIRED`). It hardcodes the "Confirmed" badge and shows `Seats: ...` from the abandoned seat model.
- [ ] `BookingConfirmation.tsx`: it shows a **fake** processing spinner (`setTimeout 1500`) and a **fake** booking ID (`CNC-${Date.now()...}`). Show the real booking ID returned by the API, and make the page reload-safe (fetch by ID instead of relying on `location.state`, which is lost on refresh).
- [ ] `Home.tsx`: the skeleton loader is a fake `setTimeout(1200)`. Drive it from the real `isLoading`. Add an error state with retry, and a "server is waking up" state (Render free tier cold start, see `DEPLOYMENT.md`).
- [ ] Typecheck for real: turn on `"strict": true` (`strictNullChecks`, `noImplicitAny`) in `tsconfig*.json`, remove the 4 `any`s, fix `tailwind.config.ts` `require()`, and make `npm run lint` and `tsc --noEmit` pass with zero errors. Add them to `npm run build`'s pre-step or CI.
- [ ] Add a React error boundary and a real 404 route (the `NotFound` page exists; check it is styled to match).
- [ ] Currency and dates: one currency (INR, using `Intl.NumberFormat('en-IN')`), one date formatter, fixture/seed dates relative to today.

### 3.2 Token storage and CSRF decision
Currently the JWT would sit in `localStorage` (`api.js` reads `localStorage.getItem("token")`), readable by any XSS. Choose one and document it in the README:
- **Option A (recommended): same-origin proxy + httpOnly cookie.** Vercel rewrites `/api/*` to the Render service (see `DEPLOYMENT.md`), so the browser sees one origin. Backend sets the JWT as `HttpOnly; Secure; SameSite=Lax` cookie. No CORS needed, token unreachable from JS. Re-enable CSRF protection (double-submit or `SameSite` plus an `Origin` header check on state-changing requests).
- **Option B: Bearer token kept in memory** (not `localStorage`), short expiry + refresh via httpOnly cookie. Simpler, but a page refresh needs a silent refresh call.
- Either way: add 401 handling in the axios/fetch layer (clear session, redirect to login), and remember the Render cold start can make the first call slow.

### 3.3 XSS and input handling
- [ ] No `dangerouslySetInnerHTML` exists today. Keep it that way; if you ever render user text (event descriptions from admin), render as text.
- [ ] Validate every form with `zod` on the client **and** trust only the server's validation. Constrain lengths, trim, normalise.
- [ ] Remote images: events use Unsplash hotlinks (`images.unsplash.com`). Use your own optimised assets (`/public/events/*.webp`) so a third-party outage or CSP rule does not break the page, and so you control licensing and attribution.
- [ ] Add a **Content-Security-Policy** via `vercel.json` headers (see 5.3). Self-host the font instead of the Google Fonts `@import` in `index.css` so the CSP can stay `default-src 'self'` and you remove a render-blocking third-party request.

### 3.4 Hygiene
- [ ] `index.html`: replace `<title>Concert Booking App</title>`, `description = "Lovable Generated Project"`, `author = "Lovable"`, `og:title = "Lovable App"`, `og:image` and `twitter:site/@Lovable` + the TODO comments. This is the most obvious "generated" tell and it leaks into every link preview.
- [ ] `FrontEnd/README.md` is `# Welcome to your Lovable project / TODO: Document your project here`. Replace with real docs.
- [ ] Remove `lovable-tagger` from `devDependencies` and `vite.config.ts`.
- [ ] `public/placeholder.svg`, default `favicon.ico`: replace with your own mark.
- [ ] Delete dead code: `SeatGrid.tsx`, `pages/Index.tsx`, `App.css`, `NavLink.tsx` (if unused), `bun.lock*`.
- [ ] Delete the ~35 unused shadcn/ui components in `src/components/ui/` (sidebar, carousel, menubar, chart, calendar, input-otp, etc.) and the matching `@radix-ui/*`, `recharts`, `embla-carousel-react`, `react-day-picker`, `vaul`, `cmdk`, `input-otp`, `react-resizable-panels`, `next-themes` dependencies. Use `npx depcheck` to confirm.
- [ ] Footer: "Careers", "Press", "Help Center", "About Us" link to nothing and the social icons are `div`s. Remove fake corporate links or build them for real (see 4.6).

**Gate 3:** `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test` all pass; `npm audit --omit=dev` shows 0 high/critical; the app works against the real API with zero mock data.

---

## PHASE 4: Design overhaul: make it look like *your* project

### 4.1 Diagnosis: what reads as AI-generated in the current UI [VERIFIED in `index.css`, `Home.tsx`, etc.]
- Purple-to-pink gradient everywhere (`--gradient-primary`, `.gradient-text`, `.gradient-bg`)
- Purple on near-black (`262 83% 58%` on `240 10% 6%`), plus neon pink/cyan/purple tokens named "neon"
- Radial orbs (`absolute ... rounded-full bg-primary/5 blur-3xl`) on Home, Login, Register
- "Liquid glass" (`.glass` = `backdrop-blur-xl` on cards, navbar, forms)
- Glow shadows (`.glow-primary`, `.glow-accent`) and `hover-lift` with `shadow-xl`
- Inter font loaded from Google Fonts; Lucide icons on every element; icon in a rounded gradient square as the logo
- Soft rounded corners everywhere (`--radius: 0.75rem`, `rounded-2xl`)
- Pill badge above the hero headline; generic headline "Unforgettable Live Music Experiences"
- Three-column equal card grid; hover-scale on every card; fade/slide-up animation on everything
- Mixed `$` / `₹`; `ConcertHub`, a generic name

### 4.2 Design direction: "Box Office"
A concept with a point of view, so it cannot be mistaken for a template. The idea: **a printed gig poster and a paper ticket stub**, not a SaaS dashboard.

| Token | Value | Notes |
|---|---|---|
| Paper (light bg) | `#EFE8D8` warm off-white | never pure `#FFFFFF` |
| Ink (text) | `#16130F` | warm near-black, not `#000` |
| Accent (one only) | `#D9482B` vermilion | the single colour; used for CTAs, the hold timer, selected zone |
| Night mode (optional) | bg `#14110F`, text `#EFE8D8`, accent `#F0A030` amber | dark mode that is warm, not purple/black |
| Corners | `0` to `2px` | square like a printed ticket |
| Depth | 1.5px solid ink borders and hard offset blocks (`box-shadow: 4px 4px 0 var(--ink)`), no blur | one deliberate "print" shadow style, not soft drop shadows |
| Display font | **Big Shoulders Display** (condensed, poster) 700/800 | uppercase for headings only |
| Body font | **Public Sans** or **Hanken Grotesk** | avoid Inter / Geist / Space Grotesk |
| Mono font | **DM Mono** or **JetBrains Mono** | ticket numbers, prices, timers |
| Icons | few, custom inline SVG (stroke 1.5, square caps) or none; use typographic markers instead | drop `lucide-react` from the UI |
| Motion | one signature motion: perforated stub "tears" on confirm; page load is static and fast | no scroll fade-ins, no hover scale |

Self-host fonts (`@fontsource/*` or woff2 in `public/fonts`), `font-display: swap`.

### 4.3 Signature elements (these are what make it yours)
- [ ] **Real venue plan, not four rectangles.** Draw the zone map as an SVG floor plan (stage, pit, left/right wings, back) with the live availability per zone shown as a fill level. Replace `ZoneMap.tsx` blocks.
- [ ] **Hold timer.** The backend's seat hold (1.8) becomes a visible 10:00 countdown ring/bar in vermilion on the booking summary. Honest, functional, memorable.
- [ ] **Ticket stub component.** Confirmation and dashboard render the booking as a physical ticket: perforated edge via CSS `mask`, mono booking ID from the **real** API ID, barcode/QR drawn client-side from that ID, "ADMIT N" in display type.
- [ ] **Poster-style event cards.** Big condensed artist name, date as a large stacked block (`15 / MAY`), venue and city in mono, price as `FROM INR 2,500`. Vary the card layout (one featured event larger than the rest) instead of 3 identical cards in a row.
- [ ] **Backstage "colophon" strip** in the footer and an `/about` page: stack, repo link, commit hash injected at build time (`VITE_COMMIT_SHA`), live API status dot driven by `/actuator/health`, "last deployed" timestamp. This is the part that tells a recruiter it is a real, running project.

### 4.4 Landing page and the "built by me" attribution
The landing page (`Home.tsx`) must say, plainly and without marketing filler, that this is your project, and link your GitHub.
- [ ] Hero: one sentence on what it is, then the byline: **"Built by Yash Sharma"** linking to `https://github.com/sharmayash2805`, plus the repo link and a "How it works" anchor. Use an actual profile photo or a monogram stamp (round rubber-stamp SVG: `YS · 2026 · BOX OFFICE`), not a gradient avatar.
- [ ] Navbar: small `by @sharmayash2805` link on desktop (hidden on tiny screens, present in the footer always).
- [ ] A short **"Notes from the build"** section: 4 to 6 honest, specific lines (e.g. "Holds expire after 10 minutes via a scheduled job", "Seat counts are guarded by row locks, with a race test in CI"). Real engineering facts, no superlatives.
- [ ] A **real demo path**: a "Try it" button that logs into a seeded demo account (read-only or auto-reset), with a visible note that it is demo data. Add real screenshots or a short screen recording to the README (no mockup renders).
- [ ] Set `<title>`, meta description, canonical, OG image (your own 1200x630 render of the poster/ticket), `twitter:creator=@yourhandle`, favicon set, `theme-color`, `lang`, and a `manifest.webmanifest`.
- [ ] Rename the product. `ConcertHub` is generic. Pick a distinctive name (working title idea: **Stubline**) and replace it in the Navbar, Footer, `index.html`, README, toasts ("Welcome to ConcertHub").

### 4.5 Copy rules (the "vibecoded" tells in the text)
- [ ] No em dashes anywhere in UI copy (there are several in `BookingConfirmation.tsx`, `ZoneMap.tsx`, comments). Use commas, colons, or full stops.
- [ ] No "It's not X, it's Y" constructions, no "Your gateway to...", "Unforgettable", "revolution", "Discover", "Your next favorite memory starts here". Write like a person describing a ticket site: short, concrete, specific.
- [ ] No emojis in UI, toasts, logs or code comments (the `🔥` in `EventController`, the `✓` glyph in `ZoneMap`).
- [ ] No checkmark bullet lists, no sparkle icons, no animated arrows on buttons (`My Bookings ->` with `ArrowRight`).
- [ ] No fake social proof. The repo has none now; do not add testimonials, "10,000+ fans", "Trusted by", or star ratings. If you want proof, show the real commit count, real test count, real uptime.
- [ ] No pricing tiers or feature-trio grids. This is a booking site: show events and prices only.

### 4.6 Required pages and states
- [ ] `/terms` and `/privacy` (real text, plain language, states it is a portfolio/demo project, lists what is collected: name, email, hashed password, bookings; no payment data is processed; how to delete the account). Link both from the footer and the register form with a consent checkbox. Add an account-deletion path.
- [ ] `/about` (the colophon from 4.3).
- [ ] Skeletons that mirror the real card layout and are shown only while data is truly loading; error and empty states for every list.
- [ ] A visible "demo only, no real payments" notice on checkout.
- [ ] Accessibility: contrast >= 4.5:1 on paper/ink/vermilion (check vermilion on paper for small text), visible focus rings, `prefers-reduced-motion`, semantic landmarks, labelled form fields, keyboard operable zone map (it is `button`s now; keep it that way in the SVG).
- [ ] Responsive pass at 360 / 768 / 1280; test the zone map and the stub on a phone.

**Gate 4:** screenshot the Home, Event, Confirmation and Dashboard pages; run through the 23 design items and the 7 content items in section 6 and tick each with evidence.

---

## PHASE 5: Hosting prerequisites, CI and audit

**Workspace preparation status:** the Vercel configuration, Docker image, PR workflow, Dependabot configuration, and local production dependency audit are prepared. This does not mean production deployment or the full ship checklist is complete. Keep provider-account actions and release checks below unchecked until their results are verified; the Render hostname is still a placeholder and two moderate React Router advisories remain.

### 5.1 Vercel (frontend)
- [x] Add `FrontEnd/vercel.json` with an API proxy and SPA fallback rewrite so refreshing `/event/3` or `/dashboard` does not 404. Replace the Render hostname placeholder before deployment:
  ```json
  {
    "rewrites": [
      { "source": "/api/:path*", "destination": "https://YOUR-SERVICE.onrender.com/api/:path*" },
      { "source": "/((?!api/).*)", "destination": "/index.html" }
    ]
  }
  ```
- [ ] Vercel project root directory = `FrontEnd`; framework preset Vite; build `npm run build`; output `dist`.
- [ ] Env: `VITE_API_URL=/api` (same-origin via the rewrite), `VITE_COMMIT_SHA` from `VERCEL_GIT_COMMIT_SHA`. Remember: **anything prefixed `VITE_` is public in the browser bundle.** Never put a secret there.

### 5.2 Render (backend)
- [x] Add a multi-stage Dockerfile, `PORT` binding, non-root runtime user, 512 MB JVM flags, and `/actuator/health` check. Provider env vars must still be configured at deployment.

### 5.3 Headers (frontend, `vercel.json` `headers`)
- [x] Add CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `X-Frame-Options: DENY` in Vercel config. CSP allows Google Fonts for the current CSS import; self-host fonts to remove that exception.

### 5.4 CI
- [x] Add GitHub Actions PR checks for frontend install, lint, typecheck, tests, production audit and build, and backend `./mvnw -B verify`; configure Dependabot for npm, Maven, and GitHub Actions.
- [ ] Add GitHub secret scanning / push protection (free for public repos), and run `gitleaks detect` locally once.

### 5.5 Final audit (item 56)
- [ ] `gitleaks detect --source .` and `trufflehog git file://.` on full history. Everything found is rotated.
- [x] `npm audit --omit=dev --audit-level=high`: no high/critical production findings after compatible fixes; two moderate React Router findings remain and require evaluating the major-version upgrade.
- [ ] Run full npm/Maven dependency audit, historical secret scans, and live deployment checks before release.
- [ ] OWASP ZAP baseline scan against the deployed URL (`zap-baseline.py -t https://...`); review the report.
- [ ] Manual check list: try each Gate 2 `curl` again against production; check cookies in DevTools (`HttpOnly`, `Secure`, `SameSite`); check response headers at securityheaders.com; run Lighthouse (aim 90+ perf/a11y/best-practices/SEO).
- [ ] Confirm no source maps with secrets, no `.env` in the deployed bundle (`view-source`, search for `password`, `secret`, `localhost`).

---

## 6. The 56-point checklist, mapped to this repo

Status: **FAIL** = problem present now | **TODO** = missing, must add | **OK** = already fine, keep | **N/A** = does not apply, with reason.

### UI / design and styling (items 1 to 23)

| # | Item | Status | Where / what to do |
|---|---|---|---|
| 1 | Harsh gradients | FAIL | `index.css` `--gradient-*`, `.gradient-text/.gradient-bg` used in ~20 places. Remove; flat paper/ink/vermilion. |
| 2 | Lucide icons | FAIL | Imported in every page/component. Replace with a tiny custom SVG set or typography; uninstall `lucide-react`. |
| 3 | Pure white background | OK now, keep | Current bg is dark. New design uses warm paper `#EFE8D8`; never `#FFF`. Check the shadcn `--background` token and `bg-white` leftovers. |
| 4 | Rainbow coloring | FAIL | Purple + neon pink + cyan + gray zone colours in `EventDetails.tsx` `defaultZones`. One accent, tints of ink for the rest. |
| 5 | Drop shadows | FAIL | `shadow-lg/xl`, `.glow-*`, `hover-lift`. Use hard 1.5px borders and one offset-block style. |
| 6 | 3 feature cards in a row | FAIL | `Home.tsx` 3-col identical event grid. Featured first card + varied sizes, or a ruled list/table layout. |
| 7 | Emojis | FAIL | `🔥` in `EventController`, `✓` glyph in `ZoneMap`. Remove all. |
| 8 | Liquid glass | FAIL | `.glass` on navbar, filters, forms, cards. Delete the class. |
| 9 | Em dashes | FAIL | `BookingConfirmation.tsx`, `ZoneMap.tsx`, comments. Search `—` across `src/` and replace. |
| 10 | Inter / Geist / Space Grotesk | FAIL | `index.css` imports Inter. Switch to Big Shoulders Display + Public Sans + DM Mono, self-hosted. |
| 11 | Colored left stripe | OK | Not present. Do not add (e.g. on alerts/cards). |
| 12 | Bento grids | OK | Not present. Keep layouts poster/ledger-like instead. |
| 13 | Terminal window | OK | Not present. Do not add a fake terminal in the hero/about. |
| 14 | Checkmark bullets | FAIL | `✓` badge in `ZoneMap`; avoid check-lists in copy. |
| 15 | Soft corner radius | FAIL | `--radius: 0.75rem`, `rounded-2xl/xl`. Set to 0 to 2px. |
| 16 | Purple and black scheme | FAIL | Primary `262 83% 58%` on `240 10% 6%`. Replace palette per 4.2. |
| 17 | Radial orbs | FAIL | `blur-3xl rounded-full` blobs in `Home.tsx`, `Login.tsx`, `Register.tsx`. Delete. |
| 18 | Dot grids | OK | Not present. Do not add. |
| 19 | Sparkle icons | OK | Not present. |
| 20 | Animated arrows | FAIL | `ArrowRight` in `BookingConfirmation`, `ArrowLeft` button. Use text links. |
| 21 | Hover animations | FAIL | `group-hover:scale-110`, `hover-lift`, `animate-slide-up` on every card. Keep only colour/underline state changes. |
| 22 | Neon colors | FAIL | `neon-pink/cyan/purple` tokens and `variant="neon"` buttons (rename and restyle). |
| 23 | Basic pastel colors | OK | None; ensure vermilion/paper palette is not drifted to pastels in tints. |

### Content and product / UX (items 24 to 30)

| # | Item | Status | Where / what to do |
|---|---|---|---|
| 24 | Fake testimonials | OK | None. Do not add; show real build facts instead. |
| 25 | "It's not X, it's Y" copy | TODO | Audit all strings per 4.5 before release. |
| 26 | 3 pricing tiers | OK | None. Zone prices are real data, not tiers. Keep it that way. |
| 27 | No real product demos | FAIL | Everything is mock. Wire real API, add seeded demo login, real screenshots/GIF in README. |
| 28 | No skeleton loaders | FAIL (fake) | Skeleton exists but runs on a fixed `setTimeout`. Drive from real loading state; add to event page and dashboard. |
| 29 | No Terms of Service | TODO | `/terms` page + footer link + register consent (4.6). |
| 30 | No privacy policy | TODO | `/privacy` page + deletion path (4.6). |

### API, secrets and environment (items 31 to 34)

| # | Item | Status | Where / what to do |
|---|---|---|---|
| 31 | Hide API keys | FAIL | DB password and JWT secret hardcoded (`application.properties`, `JwtUtil.java`). Env vars only (2.1). No third-party API keys exist; if added later, they go server-side, never in `VITE_*`. |
| 32 | Check environment variables | TODO | Add `.env.example` for both apps; fail-fast on missing; remember `VITE_*` is public. |
| 33 | Check Git for secrets / keys | FAIL | Password + JWT secret in public history. Rotate, run gitleaks/trufflehog, optionally rewrite history. |
| 34 | Check for exposed files | FAIL | `.idea/` committed; both `bun.lockb` and `package-lock.json`; ensure no `.env`, `target/`, `dist/`, `*.sql` dumps. Root `.gitignore` (1.7). `public/robots.txt` review. |

### Authentication, access control and user management (items 35 to 38)

| # | Item | Status | Where / what to do |
|---|---|---|---|
| 35 | Protect admin routes | FAIL | `/admin` page open to all; `DELETE /api/events/{id}` unauthenticated. Server `ROLE_ADMIN` + frontend `AdminRoute` (2.3, 3.1). |
| 36 | Add / ensure proper authentication | FAIL | Login UI is a fake toast; backend never validates the JWT it issues. Implement end to end (2.2, 2.3, 3.1). |
| 37 | Check user permissions / access | FAIL | IDOR on confirm/cancel/update; `userId` from the body; client-chosen `role`. Ownership checks + principal from token. |
| 38 | Hash passwords properly | FAIL | Plain text in DB and compared with `equals`. BCrypt/Argon2 (2.2). |

### Input handling and vulnerability protection (items 39 to 42)

| # | Item | Status | Where / what to do |
|---|---|---|---|
| 39 | Sanitize user inputs / forms | FAIL | No validation on any DTO/form; negative quantities accepted. `@Valid` DTOs + zod (2.4, 3.1). |
| 40 | Protect against XSS | OK now, keep | React escapes by default, no `dangerouslySetInnerHTML`. Add CSP, httpOnly cookie, render admin text as text. |
| 41 | SQL injection protection | OK now, keep | Only Spring Data derived queries (parameterised). If you add `@Query`/native SQL, use bind params only; never string-concatenate. Add a test with `' OR 1=1 --` as email. |
| 42 | CSRF protection | FAIL | `csrf.disable()`. Fine for pure Bearer-header auth, **not** if you move to cookies (Option A). Re-enable and document the choice (3.2). |

### Database, API and network (items 43 to 47)

| # | Item | Status | Where / what to do |
|---|---|---|---|
| 43 | Check DB rules / secure DB access | FAIL | App connects as MySQL `root`; no FKs/CHECKs reviewed; `ddl-auto=update`. Least-privilege user, TLS to DB, constraints, Flyway + `validate`. |
| 44 | Secure API endpoints | FAIL | `anyRequest().permitAll()`. Deny-by-default with explicit allow list (2.3). |
| 45 | Add rate limiting | TODO | Bucket4j on auth + global (2.7). |
| 46 | Check CORS settings | FAIL | `@CrossOrigin` wildcard x4. Single env-driven CORS config; or same-origin proxy so none is needed. |
| 47 | Secure file uploads | N/A (today) | The app has no uploads. If you add event images in admin: allowlist MIME + extension, size cap, re-encode, random filenames, store outside web root / in object storage. Until then, serve fixed assets from `/public`. |

### Server, headers, transport and production hardening (items 48 to 53)

| # | Item | Status | Where / what to do |
|---|---|---|---|
| 48 | Enable HTTPS | TODO | Vercel and Render provide TLS automatically; enforce it: HSTS, `forward-headers-strategy`, cookies `Secure`, DB connection over TLS, no `http://` URLs left (the hardcoded `http://localhost:8081`). |
| 49 | Add security headers | TODO | Frontend `vercel.json` (5.3) and Spring Security headers (2.7). |
| 50 | Secure cookies | TODO | If cookie auth: `HttpOnly; Secure; SameSite=Lax`, short `Max-Age`, `Path=/`; rotate on login; clear on logout. |
| 51 | Disable debug mode | FAIL | `spring.jpa.show-sql=true` (logs every query incl. user data); `System.out` debug; `build:dev` mode includes `componentTagger`. Prod profile off (2.1). |
| 52 | Check production settings | TODO | `prod` profile; `ddl-auto=validate`; error details hidden; actuator limited to `health`; JVM memory flags for 512 MB; no dev deps in the build. |
| 53 | Set spend cap | TODO | Use free tiers with no card on file where possible. Vercel: enable Spend Management and set a hard limit. Render: stay on Free (hobby) with no paid add-ons; confirm no card-billed resources. Aiven free plan has no overage. Put a calendar reminder for the 30-day Render Postgres expiry if you use it. |

### Maintenance and auditing (items 54 to 56)

| # | Item | Status | Where / what to do |
|---|---|---|---|
| 54 | Remove unused packages | FAIL | ~35 unused shadcn components and their Radix deps, `recharts`, `embla-carousel-react`, `react-day-picker`, `vaul`, `cmdk`, `input-otp`, `react-resizable-panels`, `next-themes`, `lovable-tagger`, three lockfiles. `npx depcheck`. Backend: Lombok if unused after DTO refactor. |
| 55 | Update dependencies | FAIL | 43 npm vulnerabilities (2 critical). `npm audit fix`, then review majors one by one (Vite 5 to current, `react-router`, `axios`); JJWT 0.11.5 to 0.12.x+. Enable Dependabot. |
| 56 | Conduct a full security audit | TODO | Section 5.5, repeated before each release; record results in `SECURITY.md` with a contact/disclosure address. |

---

## 7. Definition of done (ship checklist)

The checklist below is a production release gate, not a local code-completion checklist. Do not mark an item complete until its stated live or historical evidence exists.

- [ ] Fresh clone + README = running app in under 10 minutes, no hidden DB rows needed
- [ ] No secret in the repo or its history; all rotated
- [ ] Every protected endpoint returns 401/403 correctly (Gate 2 proof saved)
- [ ] `lint`, `tsc`, `build`, frontend tests, backend tests all green in CI
- [ ] `npm audit --omit=dev`: 0 high/critical; Maven dependency-check: 0 high/critical
- [ ] 0 items marked FAIL in section 6; every TODO ticked with a link to the commit
- [ ] Landing page credits `https://github.com/sharmayash2805`, shows the repo link, and has a working demo login
- [ ] `/terms`, `/privacy`, `/about` live; footer has no dead links
- [ ] Lighthouse 90+ on all four categories (mobile); securityheaders.com grade A
- [ ] README has real screenshots, architecture sketch, honest limitations ("demo data, no real payments, free-tier cold start")
- [ ] `DEPLOYMENT.md` followed end to end on a clean account, and the live URL works from a phone on mobile data