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
| `frontend` | Dashboard (React/Vite), im Regelbetrieb als fertig gebaute statische Dateien |
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

## Betriebsarten

`docker compose up -d` startet den **Produktionsbetrieb**. Das ist die Vorgabe und für jede echte Installation die richtige Wahl:

- Das Frontend wird beim Bauen zu statischen Dateien kompiliert und im Container von einem schlanken Webserver ausgeliefert — es läuft **kein** Vite-Devserver.
- Weder der Backend- noch der Frontend-Port wird auf dem Host veröffentlicht. Erreichbar ist der Stack ausschließlich über `caddy` (80/443).
- Der Quelltext wird **nicht** in die Container gemountet, das Backend läuft ohne `--reload`. Jede Code-Änderung wird erst durch einen Neubau wirksam (siehe [Update](#update--aktualisierung)).

Für die **Entwicklung** kommt `docker-compose.dev.yml` dazu — Vite mit Hot Reload, `uvicorn --reload`, Quelltext als Bind-Mount und die direkt veröffentlichten Ports 5173 (Dashboard) und 8000 (API):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

Dauerhaft bequemer über die `.env` — danach genügt weiterhin `docker compose up -d`:

```ini title=".env"
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml
```

> ⚠️ **Der Entwicklungs-Stack gehört nicht auf eine Maschine, die aus dem Internet erreichbar ist.** Der Vite-Devserver liefert den gesamten Frontend-Quelltext unauthentifiziert aus und meldet jeden serverseitigen Ladefehler per HMR-WebSocket an **alle** verbundenen Browser — auch Fehler, die ein fremder Portscanner ausgelöst hat. Die Ports 5173/8000 hören deshalb nur auf `127.0.0.1`. `DEV_BIND_ADDRESS` ist nur für den Fall gedacht, dass ein anderer Rechner im vertrauenswürdigen Netz zugreifen muss — dort niemals eine öffentlich erreichbare Adresse eintragen.

### Frontend-Werte wirken zur Bauzeit

Vite setzt die `VITE_*`-Werte beim Bauen fest in die ausgelieferten Dateien ein. Im Produktionsbetrieb wirkt eine Änderung in der `.env` deshalb **erst nach einem Neubau des Frontends**:

```bash
docker compose build frontend && docker compose up -d
```

Im Entwicklungs-Stack liest der Devserver dieselben Werte zur Laufzeit; dort genügt `docker compose up -d`.

### Auf welchen Schnittstellen das Dashboard antwortet

Ohne weitere Angabe lauscht `caddy` auf **allen** Netzwerkschnittstellen der Maschine (`0.0.0.0`). Bei einem Server mit öffentlicher IP heißt das: im Internet erreichbar — auch dann, wenn der Zugriff eigentlich nur über ein VPN gedacht war. `FRONTEND_BIND_ADDRESS` begrenzt das auf **eine** Schnittstelle; hinein gehört deren IP-Adresse (`ip -4 addr show` listet sie auf), z. B. die des VPN-/Overlay-Interfaces:

```ini title=".env"
FRONTEND_BIND_ADDRESS=100.64.0.5
```

> ⚠️ Hier **nicht** `127.0.0.1` eintragen: dann antwortet das Dashboard nur noch lokal auf dem Server selbst und ist auch über das VPN nicht mehr erreichbar.

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

# Frontend (wirkt erst nach "docker compose build frontend")
VITE_API_URL=/api                          # Vorgabe; nur im Dev-Stack abweichend
# VITE_WIKI_URL=https://wiki.example.com   # leer = offizielle Doku
# VITE_SUPPORT_EMAIL=support@example.com   # leer = support@sentrymail.de

# Netzwerk (optional)
# FRONTEND_BIND_ADDRESS=100.64.0.5         # nur diese Schnittstelle bedienen
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
   > 💡 Der Dump enthält die Datenbank, **nicht** die vom Backend abgelegten Dateien. Wer Schulungsvideos lokal speichert (`LMS_STORAGE_BACKEND=filesystem`, Enterprise), sichert zusätzlich das Volume `backend_data`:
   >
   > ```bash
   > docker compose exec -T backend tar -cz -C /app/data . > backups/backend-data-$(date +%Y%m%d-%H%M%S).tar.gz
   > ```
2. **Code aktualisieren:**
   ```bash
   git pull                       # neuester Stand des aktuellen Branch
   # oder eine feste Version:  git fetch --tags && git checkout v0.15.0
   ```
3. **Stack neu bauen und starten** (Migrationen laufen dabei automatisch):
   ```bash
   docker compose up -d --build
   ```
   - `--build` ist im Produktionsbetrieb **nicht optional**: Backend- und Frontend-Code stecken im Image, ein bloßes `up -d` oder `restart` startet weiterhin den alten Stand. Dasselbe gilt für geänderte `VITE_*`-Werte in der `.env` (siehe [Betriebsarten](#betriebsarten)).
   - Nur im Entwicklungs-Stack (`docker-compose.dev.yml`) werden reine Code-Änderungen durch Bind-Mount und `--reload` sofort übernommen; **neue Migrationen und geänderte Abhängigkeiten** (`requirements.txt`, `package.json`) greifen aber auch dort erst nach `up -d --build`.
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

Die **Business-** und **Enterprise-Add-ons** haben **eigene Releases** (getrennt vom Core). In einer Produktions­installation sind sie Teil des Backend-Images — der Rebuild oben aktualisiert sie mit.

## Add-ons & Backend-Neustart

Die kostenpflichtigen **Business-** und **Enterprise-Add-ons** sind eigene Python-Pakete, die im Backend-Image installiert sind und beim Start automatisch geladen werden. Welche Funktionen davon freigeschaltet sind, entscheidet die Lizenz — nicht die Installation.

Im Regelbetrieb gibt es dabei nichts zu tun: `docker compose up -d --build` baut das Backend-Image neu und startet den Container, die Add-ons kommen dabei auf den aktuellen Stand.

> ⚠️ **Nur im Entwicklungs-Stack:** Sind die Add-on-Repos per Volume in den Container gemountet, überwacht uvicorn `--reload` **nur das App-Verzeichnis** — **nicht** die eingehängten Pakete. Änderungen am Add-on-Code (neue Routen, Felder usw.) werden daher erst nach einem manuellen Neustart aktiv:
>
> ```bash
> docker compose restart backend
> ```
>
> Symptom bei vergessenem Neustart: Das Frontend ruft eine neue Add-on-Route auf, die im laufenden Prozess noch nicht existiert (HTTP 404) und zeigt eine generische Fehlermeldung. Nach dem Neustart ist die Route verfügbar.

## Tracking-Erreichbarkeit

Öffnungs-/Klick-Tracking funktioniert nur, wenn Empfänger die unter `APP_DOMAIN` gesetzte Adresse **erreichen** können. Bei rein internen/VPN-Domains registrieren externe Empfänger keine Events. Viele Mail-Clients blockieren zudem das Öffnungs-Pixel — **Klicks** sind daher das verlässlichere Signal.

Siehe auch: [Konfiguration](/guides/konfiguration/)
