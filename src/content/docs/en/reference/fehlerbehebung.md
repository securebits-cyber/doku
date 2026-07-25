---
title: "Troubleshooting"
description: "Common operational problems and how to solve them."
sidebar:
  order: 7
---

Common operational problems and their fixes. See also [Configuration](/en/guides/konfiguration/) and [Installation](/en/guides/installation/).

## `.env` changes have no effect

`docker compose restart` only restarts the running containers and does **not** re-read `.env`. After any change to `.env`, run:

```bash
docker compose up -d
```

This recreates the affected containers with the new values. A plain `restart` does not pick up changed environment variables — a frequent reason a change "doesn't apply".

## Dashboard unreachable / redirect loop (behind a reverse proxy)

**Symptom:** The dashboard won't load; the upstream reverse proxy receives a **308 redirect** from Caddy (often to the server IP, e.g. `https://10.x.x.x/`), sometimes with certificate errors in the Caddy logs (`could not get certificate … forbidden by policy`).

**Cause:** `CADDY_SITE_ADDRESS` in `.env` is set to a (placeholder) domain such as `sentrymail.example.com`. Caddy then binds a host-specific site block to that exact domain and tries to obtain a Let's Encrypt certificate for it. An upstream proxy (e.g. Netbird, Cloudflare, nginx) that already terminates TLS to the client talks to Caddy over HTTP and usually with the **server IP as the Host header** — which does not match the domain block, so Caddy redirects in a loop.

**Fix:** Behind an external TLS-terminating proxy, set Caddy to catch-all HTTP:

```ini title=".env"
CADDY_SITE_ADDRESS=:80
```

Then `docker compose up -d caddy`. Caddy now listens on HTTP :80 without host binding and without ACME/certificates. If you run the app **without** an upstream proxy, directly under a real, publicly reachable domain, put that domain here instead — Caddy then handles Let's Encrypt TLS automatically.

**Verify** (simulates the proxy with a foreign Host header):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: 10.0.0.1" http://<server>/    # expected: 200, not 308
```

## Passkey / WebAuthn sign-in fails

**Symptom:** Signing in with a passkey does not work (the browser does not offer the passkey, or aborts with a security error) — especially **behind a reverse proxy** or after the access domain changed.

**Cause:** WebAuthn binds passkeys to the **RP ID = `APP_DOMAIN`** and expects the origin `https://{APP_DOMAIN}` (overridable via `WEBAUTHN_ORIGIN`). If `.env` holds a placeholder (`sentrymail.example.com`) but you open the dashboard under the real domain (e.g. `phish.example.com`), the browser refuses the passkey because the RP ID and the actual origin do not match.

**Fix:** Set `APP_DOMAIN` to the **public domain** users actually reach the dashboard on, and set the origin explicitly:

```ini title=".env"
APP_DOMAIN=phish.example.com
WEBAUTHN_ORIGIN=https://phish.example.com
```

Then `docker compose up -d` (not just `restart` — see above). `APP_DOMAIN` is also used for Vite's `allowedHosts`, the Host header forwarded to the frontend, and the tracking links; it should always match the actually reachable domain.

> ⚠️ **Existing passkeys are bound to the RP ID they were created with.** If `APP_DOMAIN` (= RP ID) changes, existing passkeys must be **re-registered** (under **My Profile**). Signing in via backup code or password remains possible.

## Enforced 2FA: login stops at the setup step

**Symptom:** Logging in with the correct password does not reach the dashboard but shows the 2FA setup step (response `twofa_required: true, setup_required: true`, no session cookie).

**Cause (not a bug):** If 2FA is enforced by policy (**Settings → Security**, e.g. "for admins"), an account must set up a 2FA method **before the first full login**. Until then there is no session.

**Fix:** Complete a method in the setup step — **authenticator app (TOTP)**, **email code** or **passkey**. After that the login completes.

> ℹ️ **Passkey as the first method:** In older Business add-on versions a **passkey could not** be registered as the *first* 2FA method during enforced setup (the license check required an already-full session token → HTTP 401). Fixed in current versions. If the add-on is not yet updated: set up **authenticator app/email** first, sign in, then add the passkey under **My Profile**.

## Backend won't start: "password authentication failed"

**Symptom:** The backend exits on start with `FATAL: password authentication failed for user "…"` / `Application startup failed`.

**Cause:** The password in the PostgreSQL data volume differs from `POSTGRES_PASSWORD` / `DATABASE_URL` in `.env`. The volume password is set **only on the very first init**; if `.env` is changed later, a mismatch arises that only surfaces when the backend container is recreated.

> ℹ️ `docker compose exec postgres psql -U <user>` does **not** check the password (local socket = trust). A real test only works over TCP from another container.

**Fix (non-destructive, all data preserved):** Align the DB role password with the `.env` value:

```bash
docker compose exec -T postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB> \
  -c "ALTER USER <POSTGRES_USER> WITH PASSWORD '<POSTGRES_PASSWORD from .env>';"
docker compose restart backend
```

Do **not** delete the data volume to "fix" this — that would discard all campaigns and recipients.

## Add-on route returns 404 after an update

**Symptom:** The frontend calls a new Business/Enterprise feature and gets an HTTP 404 / a generic error.

**Cause:** uvicorn `--reload` only watches the app directory, **not** the mounted add-on packages.

**Fix:**

```bash
docker compose restart backend
```

See also [Installation](/en/guides/installation/) (section "Add-ons & backend restart").
