---
title: "Architecture and tech stack"
description: "How HumanShield.APP is built: FastAPI backend, React frontend, PostgreSQL, Redis and Caddy as reverse proxy – plus routing, tracking tokens and the data model."
sidebar:
  label: "Architecture"
  order: 2
---

HumanShield.APP is a Docker Compose stack of five services: Caddy terminates TLS and routes requests, a FastAPI backend holds the logic and the tracking endpoints, a React frontend serves the dashboard, PostgreSQL stores the data and Redis provides cache and queue. This page describes that structure for operators who need to assess, harden or integrate the stack.

## Stack

- **Backend:** FastAPI (Python), SQLAlchemy, Alembic migrations
- **Frontend:** React + Vite + TypeScript, Tailwind CSS (design-token system, light/dark)
- **Database:** PostgreSQL
- **Cache/queue:** Redis
- **Reverse proxy / TLS:** Caddy
- **Operation:** Docker Compose (rootless, hardened)

## Routing (Caddy)

- `/api/*` → backend (prefix is stripped)
- `/track/*` → backend (public tracking endpoints: pixel, click, landing, submit)
- everything else → frontend

```mermaid
flowchart LR
    Client([Client]) --> Caddy[Caddy<br>reverse proxy / TLS]
    Caddy -->|/api/*| Backend[FastAPI backend]
    Caddy -->|/track/*| Backend
    Caddy -->|everything else| Frontend[React frontend]
    Backend --> PG[(PostgreSQL)]
    Backend --> Redis[(Redis)]
```

## Key concepts

- **Singleton configs** in the DB: LDAP, OIDC, SMTP, security policy — created on first access.
- **Tracking token** per recipient: unguessable, embedded in links and the pixel.
- **Two-step login** when 2FA is active: password → 2FA code; in between a short-lived, scoped pre-auth token that grants no regular API access.

## Security

- **Passwords:** Argon2id (OWASP recommendation).
- **Runtime secrets** (SMTP/LDAP/OIDC credentials, TOTP secret): encrypted at rest via **Fernet**, key derived from `SECRET_KEY`. Never returned in plain text via the API.
- **Operator secrets** (`SECRET_KEY`, DB password): exclusively via `.env`.
- **Backup codes:** stored only as a hash.

## Data (excerpt)

- `users`, `templates` (incl. attachments, optional Markdown source), `groups` / `group_members`, `sending_profiles`, `landing_pages`, `campaigns`, `recipients`, `tracking_events`, `audit_events`, `security_config`.

See also: [Installation](/en/guides/installation/)
