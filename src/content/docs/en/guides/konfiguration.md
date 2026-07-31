---
title: "Configuration: SSO, 2FA and SMTP"
description: "Set up HumanShield.APP: local login, OIDC and SAML single sign-on, two-factor authentication, SMTP delivery, LDAP import, GeoIP and the audit log."
sidebar:
  label: "Configuration"
  order: 2
---

Most configuration is done via the dashboard under **Settings** (admin-only); only the operator secrets (app `SECRET_KEY`, DB password) stay in the `.env`. This assumes a running stack — see [Installation](/en/guides/installation/).

On this page: [sign-in](#sign-in) (local, OIDC, SAML) · [2FA](#two-factor-authentication-2fa) · [SMTP](#smtp) · [LDAP](#ldap) · [PDF reports](#pdf-reports-logo-and-company-data-business) · [GeoIP](#geoip--country-statistics-optional) · [audit log](#activity--audit-log).

## Sign-in

- **Local login** (email/password) is the primary method. Accounts are created by admins (no self-signup). Passwords: Argon2id.
- **OIDC / Single Sign-On** is an optional second method for any provider (Authentik, Keycloak, Entra ID, Okta, …). Configuration in the dashboard: issuer URL, client ID, client secret, redirect URI. Without an active OIDC config, the app runs fully without an IdP.
- **SAML SSO** (Enterprise add-on) is another optional second method. Configured under **Settings → SAML/SSO**: IdP entity ID, IdP SSO URL (HTTP redirect), IdP signing certificate (X.509), SP entity ID, SP ACS URL and optional attribute mapping (email/display name; empty = NameID as email). The assertion must be signed; the app validates signature, validity period and audience. SP metadata at `/auth/saml/metadata`.

## Two-factor authentication (2FA)

- Methods: **authenticator app (TOTP)**, **email one-time code** or — with a Business license — **passkey (WebAuthn)** — selectable per user.
- **Passkeys** (Business): registration and sign-in via WebAuthn (fingerprint, face or security key). Multiple passkeys per account possible; managed under **My Profile**. The RP ID is derived from `APP_DOMAIN`; the origin can be overridden via `WEBAUTHN_ORIGIN` (default `https://{APP_DOMAIN}`). Backup codes serve as recovery in case of device loss.
- **Backup codes** at setup (single-use).
- **Enforceable** by admins under **Settings → Security**: off / admins only / everyone. Affected users are guided through setup on their next login.
- Admins can reset a user's 2FA (device loss).
- Secrets are stored encrypted (Fernet), backup codes only as a hash.

## SMTP

- **Global fallback SMTP** under **Settings → SMTP** (applies when a campaign uses no dedicated sending profile).
- **Sending profiles** bundle SMTP credentials and sender identity per campaign.
- Provider-agnostic (IONOS, Hetzner, Mailgun, SES, Postmark, your own mail server …). Passwords encrypted at rest; the API never returns them (only a `has_*` flag).

## LDAP

Recipient import from a directory service (Active Directory / OpenLDAP) under **Settings → LDAP**: host/port, LDAPS/StartTLS, bind DN + password, base DN, user filter, attribute mapping. Then import under **Groups → LDAP import**.

For **LDAPS/StartTLS**, a **CA/server certificate** (PEM) can optionally be provided. If set, the server certificate is verified (recommended for internal or self-signed CAs); without a certificate no validation is performed.

## PDF reports: logo and company data (Business)

Under **Settings → PDF reports** you can upload a logo (PNG/JPG/SVG, no GIF, max. 512 KB) that is embedded at the top of the exported **PDF reports**. This feature is part of the **Business add-on**: without a valid Business license the page is locked. The logo is stored in the database and can be replaced or removed at any time.

On the same page you can also maintain **company data**: **company name, street, postal code, city, responsible person, department, phone number**. All fields are optional. Filled-in fields appear as a header block below the logo in **all PDF exports** — management, executive and compliance reports, training records, certificates and campaign results, as well as the individual reports and certificates of the Enterprise edition. Clearing the fields removes the block from the reports again.

## GeoIP / country statistics (optional)

For the country breakdown in the dashboard, the operator stores in the `.env` the path to a **local country database in MMDB format** (`GEOIP_DB_PATH`), e.g. MaxMind GeoLite2-Country or DB-IP Country Lite. The lookup runs entirely locally — **no external service** is ever called. Without a configured file, the country statistics simply stay empty; private/internal IP addresses are never resolved.

```ini title=".env"
GEOIP_DB_PATH=/path/to/GeoLite2-Country.mmdb
```

## Activity / audit log

Under **Settings → Activity → Audit Events**: sign-in events (success/failure/blocked) and system changes (users, settings, 2FA) — with timestamp and IP.

See also: [Features](/en/reference/funktionen/)
