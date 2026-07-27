---
title: "Installation"
description: "Install, update and operate SentryMail with Docker Compose."
sidebar:
  order: 1
---

SentryMail runs as a Docker Compose stack. All environment-specific values come from a `.env` — **no** values are hard-wired in the code.

## Requirements

- **Docker Engine** (recent version, ≥ 24) and **Docker Compose v2** — this is the current `docker compose` plugin integrated into Docker (invoked with a space). Compose **v2** is the current generation (2.x releases); the old, separate `docker-compose` (v1, Python) is discontinued and not supported. Check with `docker compose version`.
- A domain or an upstream reverse proxy (optional, but recommended for TLS)
- An SMTP mailbox for sending mail (any provider)

## Hardware requirements

The entire stack (PostgreSQL, Redis, FastAPI backend, frontend, Caddy) runs on **one** Docker host. The values are guidelines; demand grows with the number of recipients, concurrent usage and optional business features (PDF reports, AI integration).

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 2–4 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 15 GB SSD | 20–40 GB SSD |
| Operating system | Linux (x86-64 or ARM64) with Docker Engine (≥ 24) + Docker Compose v2 (`docker compose`) | same |

**Component sizing (idle reference values):** PostgreSQL ~150 MB, Redis ~30 MB, backend (Python/uvicorn incl. add-ons) ~300 MB, frontend ~300 MB, Caddy ~40 MB. Short-term peaks occur during PDF generation, AI calls and large send batches.

**Notes:**
- **Minimum** is sufficient for smaller organizations (up to a few hundred recipients, occasional campaigns).
- **Recommended** provides headroom for larger campaigns, reporting/AI and the tracking data that grows with each campaign.
- An **SSD** is recommended for the database (many small writes from tracking events).
- **Network:** outbound SMTP access (sending) and reachability of `APP_DOMAIN` for the target persons (tracking).
- The optional GeoIP country lookup requires a local MMDB file (~10–60 MB, see [Configuration](/en/guides/konfiguration/)).

## Components

| Service | Role |
|---|---|
| `postgres` | Database |
| `redis` | Cache/queue |
| `backend` | API (FastAPI) |
| `frontend` | Dashboard (React/Vite) |
| `caddy` | Reverse proxy / TLS |

## Guided install (recommended)

The interactive install routine walks you through all important settings, produces a valid `.env` from `.env.example`, generates strong secrets (`SECRET_KEY`, DB password) and keeps `DATABASE_URL` in sync automatically. It is bilingual (German/English).

1. **Clone the repository** — fetches the complete stack (code, `install.sh`, `docker-compose.yml`, `.env.example`) from GitHub onto your server:

   ```bash
   # If Git is not installed yet (Debian/Ubuntu):
   sudo apt install -y git

   # Change to a directory of your choice, e.g. /opt:
   cd /opt

   # Clone the repository — this creates the subfolder "sentrymail":
   git clone https://github.com/securebits-cyber/sentrymail.git

   # Enter the new folder — all following commands run from here:
   cd sentrymail
   ```

   Notes:
   - After cloning you have the **current state of the `main` branch**. To run a **specific version**, check out the corresponding release tag, e.g. `git checkout v0.15.0` (available versions: GitHub → **Releases**).
   - For **updates** later, run `git pull` in the same folder, then rebuild/start the stack with `docker compose up -d --build`.
   - **Without Git** it also works: download via **Code → Download ZIP** on the GitHub page and extract it. You lose the convenient update path via `git pull`, though.
2. Run the routine:
   ```bash
   ./install.sh
   ```
   > ⚠️ If the install directory is in a location your user has **no write access** to (e.g. under `/opt`), the routine must run with root privileges: `sudo ./install.sh`. Without root privileges, installation and later updates there fail with permission errors.
3. Follow the prompts (domain, database, admin account, SMTP, optional license). An empty field keeps the default.
4. Optionally let it start the stack right away at the end.

The routine only writes to `.env` (mode `600`) — nothing is hard-wired in the code. An existing `.env` can optionally be reused as a base.

## Quick start (manual)

1. Clone the repository (as described in "Guided install", step 1) and copy `.env.example` to `.env`.
2. Fill `.env` with real values (see below) — **never commit it**.
3. Start the stack:
   ```bash
   docker compose up -d
   ```
4. Database migrations run automatically when the backend starts.
5. Open the dashboard via the configured domain (or `https://localhost`).

## Important `.env` values (generic)

```ini title=".env"
# App / domain
APP_DOMAIN=sentrymail.example.com
CADDY_SITE_ADDRESS=sentrymail.example.com   # or ":80" behind an external TLS proxy

# Database
POSTGRES_DB=sentrymail
POSTGRES_USER=sentrymail
POSTGRES_PASSWORD=change-me-strong-password

# Security
SECRET_KEY=change-me-min-32-characters-random

# First admin (only effective on the very first start)
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=change-me

# SMTP (any provider)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@example.com
SMTP_PASSWORD=change-me
SMTP_FROM_EMAIL=noreply@example.com
SMTP_FROM_NAME=SentryMail
SMTP_TLS_MODE=starttls
```

## First login

On the first start, an admin account is created from `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`. Afterwards, manage further accounts under **Users** and change the initial password.

## Update

Your `.env` and data (the database volume) are preserved during an update — only the **code** is updated. Database migrations run **automatically when the backend starts**; no separate migration command is needed.

### Guided update (recommended)

The `update.sh` routine bundles all steps in the right order: check prerequisites → optional **DB backup** → update code via `git` (branch or pinned release tag) → rebuild/restart the stack → **health check**. It is bilingual and does not modify `.env`.

```bash
cd /opt/sentrymail   # your install directory
git pull                  # also fetches the latest update.sh itself
./update.sh
```

> 💡 On the very first run `update.sh` may not exist yet — run `git pull` once, then the script is available.

> ⚠️ If the install directory is owned by root (e.g. under `/opt`), `git pull` and the routine must run with root privileges: `sudo git pull && sudo ./update.sh` — otherwise the update aborts with permission errors.

### Manual update

If you prefer to run the steps individually:

1. **Back up** the database (strongly recommended before every update):
   ```bash
   mkdir -p backups
   docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > backups/db-$(date +%Y%m%d-%H%M%S).sql.gz
   ```
2. **Update the code:**
   ```bash
   git pull                       # latest state of the current branch
   # or a pinned version:  git fetch --tags && git checkout v0.15.0
   ```
3. **Rebuild and restart the stack** (migrations run automatically):
   ```bash
   docker compose up -d --build
   ```
   - Pure core code changes are picked up immediately via the mounted volume + uvicorn `--reload`, but **new migrations and changed dependencies** (`requirements.txt`, `package.json`) only take effect after `up -d --build`, or at least `docker compose restart backend`.
4. **Verify:**
   ```bash
   docker compose ps           # all services "Up"/"healthy"?
   docker compose logs -f backend
   ```

### Rollback

If something breaks after the update, switch back to the previous version (`git checkout <previous-tag>` / `git log`), restart the stack with `docker compose up -d --build`, and restore the backup you created if needed:

```bash
zcat backups/db-<timestamp>.sql.gz | docker compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

> ⚠️ A restored backup only matches a code state with the **same or older** migration schema. When downgrading, always reset the code first, then restore the backup.

### Add-ons & versions

The **Business** and **Enterprise add-ons** have **their own releases** (separate from the core). In a production install they are part of the backend image — the rebuild above updates them too. In the developer setup (mounted via volume) they are updated separately via `git pull` in their repos, followed by `docker compose restart backend`.

## Add-ons & backend restart

The paid **Business** and **Enterprise add-ons** are mounted into the `backend` container as separate packages (via volume to `/addons/…`) and loaded automatically when the backend starts.

> ⚠️ **Important for add-on changes:** The backend runs with uvicorn `--reload`, which only watches **the app directory** — **not** the mounted add-on packages. Changes to add-on code (new routes, fields, etc.) therefore only take effect after a manual backend restart:
>
> ```bash
> docker compose restart backend
> ```
>
> Symptom if the restart is forgotten: the frontend calls a new add-on route that does not yet exist in the running process (HTTP 404) and shows a generic error. After the restart the route is available.

## Tracking reachability

Open/click tracking only works if recipients can **reach** the address set in `APP_DOMAIN`. For purely internal/VPN domains, external recipients register no events. Many mail clients also block the open pixel — **clicks** are therefore the more reliable signal.

See also: [Configuration](/en/guides/konfiguration/)
