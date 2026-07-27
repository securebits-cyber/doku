---
title: "Installation"
description: "SentryMail mit Docker Compose installieren, aktualisieren und betreiben."
sidebar:
  order: 1
---

SentryMail wird als Docker-Compose-Stack betrieben. Alle umgebungs­spezifischen Werte kommen aus einer `.env` — es sind **keine** Werte im Code fest verdrahtet.

## Voraussetzungen

- **Docker Engine** (aktuelle Version, ≥ 24) und **Docker Compose v2** — das ist das aktuelle, in Docker integrierte `docker compose`-Plugin (Aufruf mit Leerzeichen). Compose **v2** ist die aktuelle Generation (Versionsstände 2.x); das alte, separate `docker-compose` (v1, Python) ist eingestellt und wird nicht unterstützt. Prüfen mit `docker compose version`.
- Eine Domain oder ein vorgelagerter Reverse Proxy (optional, aber empfohlen für TLS)
- Ein SMTP-Postfach für den Mailversand (beliebiger Anbieter)

## Hardware-Anforderungen

Der gesamte Stack (PostgreSQL, Redis, FastAPI-Backend, Frontend, Caddy) läuft auf **einem** Docker-Host. Die Werte sind Richtwerte; der Bedarf steigt mit Empfängerzahl, paralleler Nutzung und optionalen Business-Features (PDF-Reports, KI-Anbindung).

| Ressource | Minimum | Empfohlen |
|---|---|---|
| CPU | 2 vCPU | 2–4 vCPU |
| RAM | 2 GB | 4 GB |
| Datenträger | 15 GB SSD | 20–40 GB SSD |
| Betriebssystem | Linux (x86-64 oder ARM64) mit Docker Engine (≥ 24) + Docker Compose v2 (`docker compose`) | dito |

**Einordnung der Komponenten (Anhaltswerte im Leerlauf):** PostgreSQL ~150 MB, Redis ~30 MB, Backend (Python/uvicorn inkl. Add-ons) ~300 MB, Frontend ~300 MB, Caddy ~40 MB. Spitzen entstehen kurzfristig bei PDF-Erzeugung, KI-Aufrufen und großen Versand-Batches.

**Hinweise:**
- **Minimum** genügt für kleinere Organisationen (bis einige Hundert Empfänger, gelegentliche Kampagnen).
- **Empfohlen** gibt Reserve für größere Kampagnen, Reporting/KI und die mit jeder Kampagne wachsenden Tracking-Daten.
- Eine **SSD** wird für die Datenbank empfohlen (viele kleine Schreibvorgänge durch Tracking-Ereignisse).
- **Netzwerk:** ausgehender SMTP-Zugang (Versand) und Erreichbarkeit der `APP_DOMAIN` für die Zielpersonen (Tracking).
- Optionaler GeoIP-Länder-Lookup benötigt eine lokale MMDB-Datei (~10–60 MB, siehe [Konfiguration](/guides/konfiguration/)).

## Komponenten

| Dienst | Rolle |
|---|---|
| `postgres` | Datenbank |
| `redis` | Cache/Queue |
| `backend` | API (FastAPI) |
| `frontend` | Dashboard (React/Vite) |
| `caddy` | Reverse Proxy / TLS |

## Geführte Installation (empfohlen)

Die interaktive Installationsroutine führt dich durch alle wichtigen Einstellungen, erzeugt eine gültige `.env` aus `.env.example`, generiert sichere Secrets (`SECRET_KEY`, DB-Passwort) und hält `DATABASE_URL` automatisch synchron. Sie ist zweisprachig (Deutsch/Englisch).

1. **Repository klonen** — holt den kompletten Stack (Code, `install.sh`, `docker-compose.yml`, `.env.example`) von GitHub auf den Server:

   ```bash
   # Falls Git noch fehlt (Debian/Ubuntu):
   sudo apt install -y git

   # In ein Verzeichnis deiner Wahl wechseln, z. B. /opt:
   cd /opt

   # Repository klonen — erzeugt den Unterordner "sentrymail":
   git clone https://github.com/securebits-cyber/sentrymail.git

   # In den neuen Ordner wechseln — hier laufen alle weiteren Befehle:
   cd sentrymail
   ```

   Hinweise:
   - Nach dem Klonen liegt der **aktuelle Stand des `main`-Branch** vor. Wer eine **bestimmte Version** betreiben möchte, checkt den zugehörigen Release-Tag aus, z. B. `git checkout v0.15.0` (verfügbare Versionen: GitHub → **Releases**).
   - **Updates** später im selben Ordner mit `git pull` holen, danach den Stack mit `docker compose up -d --build` neu bauen/starten.
   - **Ohne Git** geht es auch: auf der GitHub-Seite über **Code → Download ZIP** herunterladen und entpacken. Der bequeme Update-Weg über `git pull` entfällt dann allerdings.
2. Routine starten:
   ```bash
   ./install.sh
   ```
   > ⚠️ Liegt das Installationsverzeichnis an einem Ort, an dem dein Benutzer **keine Schreibrechte** hat (z. B. unter `/opt`), muss die Routine mit Root-Rechten laufen: `sudo ./install.sh`. Ohne Root-Rechte schlagen Installation und spätere Updates dort mit Permission-Fehlern fehl.
3. Den Fragen folgen (Domain, Datenbank, Admin-Konto, SMTP, optional Lizenz). Leeres Feld = Vorgabe übernehmen.
4. Am Ende optional direkt den Stack starten lassen.

Die Routine schreibt ausschließlich in die `.env` (Rechte `600`) — es wird nichts im Code fest verdrahtet. Eine bestehende `.env` kann auf Wunsch als Basis weiterverwendet werden.

## Schnellstart (manuell)

1. Repository klonen (wie oben unter „Geführte Installation", Schritt 1) und `.env.example` nach `.env` kopieren.
2. `.env` mit echten Werten füllen (siehe unten) — **niemals committen**.
3. Stack starten:
   ```bash
   docker compose up -d
   ```
4. Datenbank-Migrationen laufen beim Start des Backends automatisch mit.
5. Dashboard über die konfigurierte Domain (bzw. `https://localhost`) öffnen.

## Wichtige `.env`-Werte (generisch)

```ini title=".env"
# App / Domain
APP_DOMAIN=sentrymail.example.com
CADDY_SITE_ADDRESS=sentrymail.example.com   # oder ":80" hinter externem TLS-Proxy

# Datenbank
POSTGRES_DB=sentrymail
POSTGRES_USER=sentrymail
POSTGRES_PASSWORD=change-me-strong-password

# Sicherheit
SECRET_KEY=change-me-min-32-characters-random

# Erster Admin (nur beim allerersten Start wirksam)
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=change-me

# SMTP (beliebiger Anbieter)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@example.com
SMTP_PASSWORD=change-me
SMTP_FROM_EMAIL=noreply@example.com
SMTP_FROM_NAME=SentryMail
SMTP_TLS_MODE=starttls
```

## Erster Login

Beim ersten Start wird aus `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` ein Admin-Konto angelegt. Danach weitere Konten über **Benutzer** verwalten und das Start-Passwort ändern.

## Update / Aktualisierung

Die `.env` und deine Daten (Datenbank-Volume) bleiben bei einem Update erhalten — aktualisiert wird nur der **Code**. Datenbank-Migrationen laufen **automatisch beim Start des Backends**; ein separater Migrationsbefehl ist nicht nötig.

### Geführtes Update (empfohlen)

Die Routine `update.sh` fasst alle Schritte in der richtigen Reihenfolge zusammen: Voraussetzungen prüfen → optionales **DB-Backup** → Code per `git` aktualisieren (Branch oder fester Release-Tag) → Stack neu bauen/starten → **Health-Check**. Sie ist zweisprachig und verändert die `.env` nicht.

```bash
cd /opt/sentrymail   # dein Installationsverzeichnis
git pull                  # holt auch die neueste update.sh selbst
./update.sh
```

> 💡 Beim allerersten Mal ist `update.sh` evtl. noch nicht vorhanden — dann einmal `git pull` ausführen, danach steht das Skript bereit.

> ⚠️ Gehört das Installationsverzeichnis root (z. B. unter `/opt`), müssen `git pull` und die Routine mit Root-Rechten laufen: `sudo git pull && sudo ./update.sh` — sonst bricht das Update mit Permission-Fehlern ab.

### Manuelles Update

Wer die Schritte einzeln ausführen möchte:

1. **Backup** der Datenbank anlegen (dringend empfohlen vor jedem Update):
   ```bash
   mkdir -p backups
   docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > backups/db-$(date +%Y%m%d-%H%M%S).sql.gz
   ```
2. **Code aktualisieren:**
   ```bash
   git pull                       # neuester Stand des aktuellen Branch
   # oder eine feste Version:  git fetch --tags && git checkout v0.15.0
   ```
3. **Stack neu bauen und starten** (Migrationen laufen dabei automatisch):
   ```bash
   docker compose up -d --build
   ```
   - Reine Code-Änderungen im Core werden durch das gemountete Volume + uvicorn-`--reload` zwar sofort übernommen, aber **neue Migrationen und geänderte Abhängigkeiten** (`requirements.txt`, `package.json`) greifen erst nach `up -d --build` bzw. mindestens `docker compose restart backend`.
4. **Prüfen:**
   ```bash
   docker compose ps           # alle Dienste "Up"/"healthy"?
   docker compose logs -f backend
   ```

### Rollback

Läuft nach dem Update etwas nicht, auf die vorherige Version zurückwechseln (`git checkout <vorheriger-Tag>` bzw. `git log`), Stack mit `docker compose up -d --build` neu starten und bei Bedarf das zuvor erzeugte Backup einspielen:

```bash
zcat backups/db-<zeitstempel>.sql.gz | docker compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

> ⚠️ Ein zurückgespieltes Backup passt nur zu einem Code-Stand mit **demselben oder älteren** Migrations-Schema. Beim Downgrade daher immer erst den Code zurücksetzen, dann das Backup einspielen.

### Add-ons & Versionen

Die **Business-** und **Enterprise-Add-ons** haben **eigene Releases** (getrennt vom Core). In einer Produktions­installation sind sie Teil des Backend-Images — der Rebuild oben aktualisiert sie mit. Im Entwickler-Setup (per Volume gemountet) werden sie separat per `git pull` in ihren Repos aktualisiert, gefolgt von `docker compose restart backend`.

## Add-ons & Backend-Neustart

Die kostenpflichtigen **Business-** und **Enterprise-Add-ons** werden als separate Pakete in den `backend`-Container eingehängt (per Volume nach `/addons/…`) und beim Start des Backends automatisch geladen.

> ⚠️ **Wichtig bei Add-on-Änderungen:** Das Backend läuft mit uvicorn `--reload`, das aber **nur das App-Verzeichnis** überwacht — **nicht** die eingehängten Add-on-Pakete. Änderungen am Code der Add-ons (neue Routen, Felder usw.) werden daher erst nach einem manuellen Neustart des Backends aktiv:
>
> ```bash
> docker compose restart backend
> ```
>
> Symptom bei vergessenem Neustart: Das Frontend ruft eine neue Add-on-Route auf, die im laufenden Prozess noch nicht existiert (HTTP 404) und zeigt eine generische Fehlermeldung. Nach dem Neustart ist die Route verfügbar.

## Tracking-Erreichbarkeit

Öffnungs-/Klick-Tracking funktioniert nur, wenn Empfänger die unter `APP_DOMAIN` gesetzte Adresse **erreichen** können. Bei rein internen/VPN-Domains registrieren externe Empfänger keine Events. Viele Mail-Clients blockieren zudem das Öffnungs-Pixel — **Klicks** sind daher das verlässlichere Signal.

Siehe auch: [Konfiguration](/guides/konfiguration/)
