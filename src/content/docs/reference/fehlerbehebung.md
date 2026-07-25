---
title: "Fehlerbehebung"
description: "Häufige Probleme im Betrieb und ihre Lösung."
sidebar:
  order: 7
---

Häufige Probleme im Betrieb und ihre Lösung. Siehe auch [Konfiguration](/guides/konfiguration/) und [Installation](/guides/installation/).

## `.env`-Änderungen greifen nicht

`docker compose restart` startet nur die laufenden Container neu und liest die `.env` **nicht** neu ein. Nach jeder Änderung an der `.env` daher:

```bash
docker compose up -d
```

Das erzeugt betroffene Container mit den neuen Werten neu. Ein reiner `restart` übernimmt geänderte Umgebungsvariablen nicht — ein häufiger Grund, warum eine Anpassung „nicht wirkt".

## Dashboard nicht erreichbar / Weiterleitungsschleife (hinter Reverse Proxy)

**Symptom:** Das Dashboard lädt nicht; der vorgelagerte Reverse Proxy erhält von Caddy eine **308-Weiterleitung** (oft auf die Server-IP wie `https://10.x.x.x/`), teils Zertifikatsfehler in den Caddy-Logs (`could not get certificate … forbidden by policy`).

**Ursache:** In der `.env` steht bei `CADDY_SITE_ADDRESS` eine (Platzhalter-)Domain wie `sentrymail.example.com`. Caddy bindet dann einen host-spezifischen Site-Block an genau diese Domain und versucht, dafür ein Let's-Encrypt-Zertifikat zu holen. Ein vorgelagerter Proxy (z. B. Netbird, Cloudflare, nginx), der TLS bereits zum Client terminiert, spricht Caddy jedoch per HTTP und meist mit der **Server-IP als Host-Header** an — das passt nicht auf den Domain-Block, und Caddy leitet in eine Schleife um.

**Lösung:** Caddy hinter einem externen TLS-terminierenden Proxy auf Catch-all-HTTP stellen:

```ini title=".env"
CADDY_SITE_ADDRESS=:80
```

Danach `docker compose up -d caddy`. Caddy lauscht dann ohne Host-Bindung auf HTTP :80, ohne ACME/Zertifikat. Betreibst du die App **ohne** vorgelagerten Proxy direkt unter einer echten, öffentlich erreichbaren Domain, trägst du dort stattdessen diese Domain ein — dann übernimmt Caddy automatisch Let's-Encrypt-TLS.

**Prüfen** (simuliert den Proxy mit fremdem Host-Header):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: 10.0.0.1" http://<server>/    # erwartet: 200, nicht 308
```

## Passkey-/WebAuthn-Anmeldung schlägt fehl

**Symptom:** Die Anmeldung per Passkey funktioniert nicht (der Browser bietet den Passkey nicht an oder bricht mit einem Sicherheitsfehler ab) — insbesondere **hinter einem Reverse Proxy** oder nachdem die Zugriffs-Domain geändert wurde.

**Ursache:** WebAuthn bindet Passkeys an die **RP-ID = `APP_DOMAIN`** und erwartet als Origin `https://{APP_DOMAIN}` (überschreibbar via `WEBAUTHN_ORIGIN`). Steht in der `.env` ein Platzhalter (`sentrymail.example.com`), du rufst das Dashboard aber unter der echten Domain (z. B. `phish.example.com`) auf, verweigert der Browser die Passkey-Nutzung, weil RP-ID und tatsächliche Herkunft nicht zusammenpassen.

**Lösung:** `APP_DOMAIN` auf die **öffentliche Domain**, unter der Nutzer das Dashboard tatsächlich erreichen, setzen und die Origin explizit hinterlegen:

```ini title=".env"
APP_DOMAIN=phish.example.com
WEBAUTHN_ORIGIN=https://phish.example.com
```

Danach `docker compose up -d` (nicht nur `restart` — siehe oben). `APP_DOMAIN` wird zugleich für Vites `allowedHosts`, den Host-Header ans Frontend und die Tracking-Links verwendet; es sollte immer der real erreichbaren Domain entsprechen.

> ⚠️ **Bestehende Passkeys sind an die RP-ID gebunden, mit der sie erstellt wurden.** Ändert sich `APP_DOMAIN` (= RP-ID), müssen vorhandene Passkeys **neu registriert** werden (unter **Mein Profil**). Die Anmeldung per Backup-Code oder Passwort bleibt möglich.

## Erzwungene 2FA: Anmeldung bleibt im Einrichtungsschritt hängen

**Symptom:** Login mit korrektem Passwort führt nicht ins Dashboard, sondern zeigt den 2FA-Einrichtungsschritt (Antwort `twofa_required: true, setup_required: true`, kein Session-Cookie).

**Ursache (kein Fehler):** Ist 2FA per Richtlinie erzwungen (**Einstellungen → Sicherheit**, z. B. „für Admins"), muss ein Konto **vor dem ersten vollständigen Login** eine 2FA-Methode einrichten. Bis dahin gibt es keine Sitzung.

**Lösung:** Im Einrichtungsschritt eine Methode abschließen — **Authenticator-App (TOTP)**, **E-Mail-Code** oder **Passkey**. Danach ist der Login vollständig.

> ℹ️ **Passkey als erste Methode:** In älteren Versionen des Business-Add-ons ließ sich ein **Passkey nicht** als *erste* 2FA-Methode während der erzwungenen Einrichtung registrieren (die Lizenzprüfung verlangte ein bereits vollständiges Session-Token → HTTP 401). Behoben in aktuellen Versionen. Ist das Add-on noch nicht aktualisiert: zuerst **Authenticator-App/E-Mail** einrichten, einloggen und den Passkey anschließend unter **Mein Profil** hinzufügen.

## Backend startet nicht: „password authentication failed"

**Symptom:** Das Backend beendet sich beim Start mit `FATAL: password authentication failed for user "…"` / `Application startup failed`.

**Ursache:** Das Passwort im PostgreSQL-Daten-Volume weicht vom `POSTGRES_PASSWORD` / `DATABASE_URL` in der `.env` ab. Das Volume-Passwort wird **nur beim allerersten Init** gesetzt; wird die `.env` später geändert, entsteht eine Diskrepanz, die erst beim Neu-Erzeugen des Backend-Containers auffällt.

> ℹ️ `docker compose exec postgres psql -U <user>` prüft das Passwort **nicht** (lokaler Socket = trust). Ein echter Test geht nur über TCP von einem anderen Container aus.

**Lösung (nicht-destruktiv, alle Daten bleiben erhalten):** Das Rollen-Passwort in der DB auf den `.env`-Wert angleichen:

```bash
docker compose exec -T postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB> \
  -c "ALTER USER <POSTGRES_USER> WITH PASSWORD '<POSTGRES_PASSWORD aus .env>';"
docker compose restart backend
```

Das Daten-Volume **nicht** löschen, um das Problem zu „lösen" — das würde alle Kampagnen und Empfänger verwerfen.

## Add-on-Route liefert 404 nach Update

**Symptom:** Das Frontend ruft eine neue Business-/Enterprise-Funktion auf, es kommt ein HTTP 404 / eine generische Fehlermeldung.

**Ursache:** uvicorn `--reload` überwacht nur das App-Verzeichnis, **nicht** die gemounteten Add-on-Pakete.

**Lösung:**

```bash
docker compose restart backend
```

Siehe auch [Installation](/guides/installation/) (Abschnitt „Add-ons & Backend-Neustart").
