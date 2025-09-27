# Flashlearn Auth Overhaul — Engineering Log

_Last updated: 2025-09-20_

This document captures what we built, the snags we hit, and how we solved them—end-to-end across backend, frontend, DB, and ops.

---

## Goals

- Move auth to **JWT in Authorization headers** (no cookies).
- Add **email verification** via OTP for **new accounts only**.
- Keep **login** simple for verified users (no OTP).
- Add **password reset** flow (OTP-based).
- Add **admin tools** to clean test data safely.
- Harden against abuse (rate limits, anti-enum, CORS, HTTPS, etc.).

---

## Architecture at a glance

- **Transport**: `Authorization: Bearer <JWT>` only; tokens stored client-side (in-memory/localStorage).
- **Email verification**: OTP sent on **signup** (or when an unverified user attempts login).
- **Login**:

  - If `email_verified == true` → return JWT immediately.
  - If not verified → request OTP → verify → auto-issue JWT.

- **Password reset**: OTP → set new password → auto-login (if verified).
- **Admin**: domain-allowlisted bulk delete by email with dry-run; username check.

---

## Backend

### 1) Config (`config.py`)

Key settings:

- DB: `SQLALCHEMY_DATABASE_URI`
- JWT (header-only):

  - `JWT_TOKEN_LOCATION = ["headers"]`
  - `JWT_HEADER_TYPE = "Bearer"`
  - `JWT_ACCESS_TOKEN_EXPIRES = 48h`

- CORS: `supports_credentials = False` and an allowlist of origins
- Rate-limit headers: `RATELIMIT_HEADERS_ENABLED = True`
- OTP toggles:

  - `OTP_TTL_SECONDS`, `OTP_MAX_ATTEMPTS`, `OTP_ECHO_IN_LOGS` (dev only)

- Admin flags:

  - `ADMIN_ENDPOINTS_ENABLED`, `ADMIN_API_KEY`, `ADMIN_ALLOWED_EMAIL_DOMAINS`

> Note: For production, configure Flask-Limiter with Redis storage.

### 2) Routes

#### Auth (`routes/auth_routes.py`)

- **POST `/signup`** — create account (no auto-verify).
  Anti-abuse limit: **20/hour** per IP.
- **POST `/login`** — issue JWT if `email_verified`; otherwise return `{ "mfa_required": true }`.

#### OTP + Reset (`routes/otp_routes.py`)

- **POST `/login/otp/request`** — send OTP for **email verification**.
  Response: `{ status: "sent", otp_id, dev_code? }` or `{ status: "skipped", reason: "already_verified" }`.
  Limits: **3/min; 10/hour** per account + **10/min** per email+IP guard.
- **POST `/login/otp/verify`** — verify, mark `email_verified`, return `{ access_token }`.
  Limit: **10/min**.
- **POST `/forgot-password`** — send reset OTP (soft-success if email doesn’t exist).
  Limit: **3/min; 10/hour** per account.
- **POST `/reset-password`** — verify code + set new password.
  Limit: **10/min**.

> Ensure registration in `app.py`:
>
> ```python
> from routes.otp_routes import RequestLoginOTP, VerifyLoginOTP, ForgotPassword, ResetPassword
>
> api.add_resource(RequestLoginOTP, "/login/otp/request")
> api.add_resource(VerifyLoginOTP,  "/login/otp/verify")
> api.add_resource(ForgotPassword,  "/forgot-password")
> api.add_resource(ResetPassword,   "/reset-password")
> ```

#### Admin (`routes/admin_routes.py`)

- **POST `/admin/users/delete`** — delete users by email (allowlisted domains).
  Headers: `X-Admin-Key: <ADMIN_API_KEY>`
  Body: `{ "emails": [...], "dry_run": true|false }`
- **POST `/admin/usernames/check`** — bulk check username existence.
  Headers: `X-Admin-Key: <ADMIN_API_KEY>`

### 3) Database Cascades

**Issue:** Deleting a user raised `IntegrityError` on `otp_codes.user_id` (NOT NULL + no cascade).
**Fix:** Add `ondelete="CASCADE"` to FKs, `passive_deletes=True` + `cascade="all, delete-orphan"` in ORM relationships, and run Alembic migration.

- `OTPCode.user_id -> ForeignKey("users.id", ondelete="CASCADE")`
- `TrustedDevice.user_id -> ForeignKey("users.id", ondelete="CASCADE")`
- In `User`:

  ```python
  otp_codes = db.relationship("OTPCode", back_populates="user",
                              passive_deletes=True, cascade="all, delete-orphan")
  trusted_devices = db.relationship("TrustedDevice", back_populates="user",
                                    passive_deletes=True, cascade="all, delete-orphan")
  ```

**Result:** User deletion cleanly cascades to OTP codes & trusted devices.

---

## Frontend

Project paths used below match your tree under `src/`.

### 1) Routes (`src/App.jsx`)

Add Forgot Password page:

```diff
+ import ForgotPassword from "./components/Authentication/ForgotPassword.jsx";
  // ...
  <Route path="/signup" element={<Signup />} />
+ <Route path="/forgot-password" element={<ForgotPassword />} />
```

### 2) Context (`src/components/context/UserContext.jsx`)

Key responsibilities:

- Centralized API calls with `API_URL` and Authorization header.
- Store token under one key, attach via `Authorization: Bearer`.
- Guard JSON parsing (avoid “Unexpected end of JSON”).
- Export helpers:

  - `signup(email, username, password)`
  - `login(email, password)` → returns `{ success: true }` or `{ verification_required: true }`
  - `requestOtp(email)` / `verifyOtp(email, otp_id, code)` (**email verification**)
  - `requestPasswordReset(email)` / `resetPassword(email, otp_id, code, new_password)` (**forgot password**)
  - `logout()`

### 3) Login (`src/components/Authentication/Login.jsx`)

Two phases:

1. **Password step**: if backend returns token → go `/dashboard`; if `{ mfa_required: true }`, request OTP and switch to phase 2.
2. **OTP step**: verify OTP → token → `/dashboard`.

   - Email field locked during OTP phase.
   - “Resend code” supported.
   - Dev code shown only when both backend and frontend are in dev.

### 4) Signup (`src/components/Authentication/SignUp.jsx`)

- Create account → request **verification OTP** → modal dialog for code input (non-dismissable by backdrop/Esc).
- On success → token → `/dashboard`.
- Dev code shown only in dev.

### 5) Forgot Password (`src/components/Authentication/ForgotPassword.jsx`)

- **Step 1**: Email → send reset code (always show generic success: “If that email exists, we’ve sent a reset code.”).
- **Step 2**: Code + new password → reset → attempt auto-login → `/dashboard` or `/login` with success banner.

---

## Admin Ops — Examples

**Dry-run delete**:

```bash
curl -X POST http://127.0.0.1:5000/admin/users/delete \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: dev-only-key" \
  -d '{"emails":["user1@gmail.com","user2@gmail.com"], "dry_run": true}'
```

**Execute delete**:

```bash
curl -X POST http://127.0.0.1:5000/admin/users/delete \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: dev-only-key" \
  -d '{"emails":["user1@gmail.com","user2@gmail.com"]}'
```

**Check usernames**:

```bash
curl -X POST http://127.0.0.1:5000/admin/usernames/check \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: dev-only-key" \
  -d '{"usernames":["alice","bob"]}'
```

---

## Troubles We Hit (and Fixes)

1. **Frontend 404s / JSON parse errors**

   - _Cause_: calling relative API paths (hit Vite dev server) + parsing non-JSON bodies.
   - _Fix_: API helper always prefixes `API_URL`; `parseMaybeJson` wrapper.

2. **Dev OTP code leaking**

   - _Cause_: always including `dev_code` in responses/UI.
   - _Fix_: backend includes `dev_code` only when `app.debug` & `OTP_ECHO_IN_LOGS`; frontend shows only when `import.meta.env.DEV`.

3. **User deletion `IntegrityError`**

   - _Cause_: FK without cascade (`otp_codes.user_id` NOT NULL).
   - _Fix_: `ondelete="CASCADE"`, ORM `passive_deletes=True`, migration to alter FKs.

4. **Login forcing OTP for verified users**

   - _Cause_: `/login` returned `mfa_required` regardless of verification.
   - _Fix_: If `email_verified`, return token directly; otherwise OTP.

5. **Rate-limit friction**

   - _Cause_: tight signup limit.
   - _Fix_: raised signup to **20/hour**; enabled rate-limit headers for visibility.

---

## Security Posture

- No cookies; JWT in Authorization header only.
- Anti-enumeration: forgot-password soft-success.
- Rate-limits on signup, OTP request, OTP verify, login.
- HTTPS in production; allow `localhost` for dev.
- Admin endpoints gated by config + API key + domain allowlist.

---

## Environment Variables (reference)

- `JWT_SECRET_KEY=...`
- `DATABASE_URL=...`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USE_TLS`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_FROM_NAME`
- `OTP_TTL_SECONDS=300`
- `OTP_MAX_ATTEMPTS=5`
- `OTP_ECHO_IN_LOGS=true` (dev only)
- `ADMIN_ENDPOINTS_ENABLED=true`
- `ADMIN_API_KEY=dev-only-key`
- `ADMIN_ALLOWED_EMAIL_DOMAINS=["gmail.com","yourco.com"]`
- `CORS_EXTRA_ORIGINS=...` (optional)
- `FLASK_ENV=development` or `production`

> For prod rate limiting, configure Redis storage for Flask-Limiter.

---

## Smoke Test Checklist

**Signup & Verify**

- [ ] Signup → receive OTP → verify → auto-login → `/user` works
- [ ] Resend OTP throttling behaves and shows clean errors
- [ ] Dev code visible only in dev

**Login**

- [ ] Verified user → direct token, no OTP
- [ ] Unverified user → OTP flow, verify → token
- [ ] Wrong password → consistent error (no enumeration)

**Forgot Password**

- [ ] Email step soft-success (unknown email not leaked)
- [ ] Reset code → new password → auto-login works for verified accounts
- [ ] Unverified accounts still require email verification for login

**Admin**

- [ ] Dry-run shows deletable users & usernames
- [ ] Actual delete cascades to OTP/trusted devices (no integrity errors)

**Security**

- [ ] Token only sent via Authorization header
- [ ] Logout clears storage
- [ ] HTTPS enforced in prod

---

## Future Enhancements

- “Remember this device” with trusted devices + long-lived token.
- JWT versioning (`pwd_version`) to invalidate old tokens on password reset.
- Password strength meter; “show password” toggles everywhere.
- Surface rate-limit backoff with `Retry-After` or `X-RateLimit-Remaining`.
