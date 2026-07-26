---
title: "Security"
description: "Security mechanisms of SentryMail and recommendations for operation."
sidebar:
  order: 3
---

Overview of SentryMail's security mechanisms and recommendations for operation.

## Authentication

- **Passwords:** hashing with **Argon2id** (OWASP's primary recommendation).
- **Local login** as the primary method; **OIDC/SSO** optional as a second method.
- **Two-factor authentication:** TOTP (authenticator app) or email one-time code, with **backup codes**. Enforceable by admins (off / admins only / everyone).
- **Two-step login** when 2FA is active: after the password, a short-lived, **scoped pre-auth token** that permits only the 2FA step — no regular API access.

## Handling secrets

- **Runtime credentials** (SMTP of the sending profiles and the fallback SMTP, LDAP bind password, OIDC client secret, TOTP secret): encrypted **at rest via Fernet**, key derived from `SECRET_KEY`.
- Such secrets are **never returned in plain text** via the API — only a `has_*` flag.
- **Operator secrets** (`SECRET_KEY`, DB password): via `.env` — never in code, never in the repo.
- **Backup codes** are stored only as a **hash**; a used code is invalidated.

### Secrets from a secrets manager

A `.env` file is the simplest route and sufficient for many installations. If you run a **secrets manager**, the operator secrets can come from there without SentryMail needing to ship anything for it: the application reads them as environment variables, and where those come from is an operations decision.

**This is deliberately not an integration.** Building in one specific vendor would force every operator into that tool — the same reasoning as for SMTP delivery and the SMS gateway. All of the routes below work without any change to the application.

**Bitwarden Secrets Manager** — the CLI provides the secrets as environment variables:

```bash
bws run --project-id <PROJECT> -- docker compose up -d
```

**HashiCorp Vault** — render a `.env` with the agent template, or inject directly:

```bash
vault agent -config=agent.hcl     # renders .env from a template file
# or, without a file on disk:
export SECRET_KEY="$(vault kv get -field=secret_key secret/sentrymail)"
```

**Infisical, 1Password, AWS/GCP Secret Manager** — same pattern (`infisical run --`, `op run --`, sidecar or init container).

**Docker Swarm or Kubernetes** — secrets are built in there; under plain Compose you can also use `secrets:` with `*_FILE` variables, provided the images in use support them.

What matters regardless of the tool:

- **`SECRET_KEY` is the key to every credential encrypted at rest.** Lose it and the SMTP, LDAP, OIDC and gateway credentials become unreadable and have to be entered again. Protect it like a backup — and a database backup without it is only half a restore.
- **Changing `SECRET_KEY` invalidates the encrypted fields.** Note the affected credentials before a rotation and set them again afterwards.
- **`chmod 600` on `.env`** if you do use one — and never commit it.

## Data minimization in tracking

- Only recorded is **that** a recipient opened/clicked/submitted a form (awareness signal) — including time and IP.
- **Submitted form data is not stored by default.** "Data capture" and "capture passwords" are **opt-in** per landing page and should only be used after internal approval (data protection/works council).
- **Client fingerprinting is off by default** and can only be enabled by an explicit administrator decision.
- For workplaces with employee representation there is also the **data protection and co-determination mode** with a lock on individual-person evaluations, k-anonymity, four-eyes unlocking and automatic anonymisation — see [Data protection & co-determination](/en/reference/datenschutz/).

## Traceability

- **Audit log** (Settings → Activity): sign-ins (success/failure/blocked) and system changes (users, settings, 2FA) with timestamp and IP.

## Operation / hardening

- **Reverse proxy** (Caddy) with TLS; can run behind an external TLS proxy.
- **Containers** rootless and hardened, services on the internal Docker network.
- Recommendations:
  - Set a strong, random `SECRET_KEY` (≥ 32 characters) and keep it secret.
  - Protect `.env` with `chmod 600`, never commit it.
  - Restrict access to the dashboard (VPN/network segmentation).
  - Regular database backups.
  - Assign roles sparingly (principle of least privilege).

## Responsible use

Results serve to **improve awareness**, **not** to penalize individuals. Coordinate simulations and any data collection internally beforehand.

See also: [Configuration](/en/guides/konfiguration/) · [Compliance mapping](/en/reference/compliance/)
