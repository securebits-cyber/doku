---
title: "Sicherheit und Härtung"
description: "Wie SentryMail Konten und Daten schützt: Argon2id, Zwei-Faktor-Authentifizierung, verschlüsselte Secrets, Audit-Log und Empfehlungen zur Härtung."
sidebar:
  label: "Sicherheit"
  order: 3
---

Überblick über die Sicherheitsmechanismen von SentryMail und Empfehlungen für den Betrieb.

## Authentifizierung

- **Passwörter:** Hashing mit **Argon2id** (OWASP-Erstempfehlung).
- **Lokaler Login** als primäre Methode; **OIDC/SSO** optional als Zweitmethode.
- **Zwei-Faktor-Authentifizierung:** TOTP (Authenticator-App) oder E-Mail-Einmalcode, mit **Backup-Codes**. Admin-seitig erzwingbar (aus / nur Admins / alle).
- **Zweistufiger Login** bei aktivem 2FA: nach dem Passwort ein kurzlebiger, **gescopeter Pre-Auth-Token**, der ausschließlich den 2FA-Schritt erlaubt — kein regulärer API-Zugriff.

## Umgang mit Secrets

- **Laufzeit-Zugangsdaten** (SMTP der Sending Profiles und des Fallback-SMTP, LDAP-Bind-Passwort, OIDC-Client-Secret, TOTP-Secret): verschlüsselt **at-rest via Fernet**, Schlüssel abgeleitet aus `SECRET_KEY`.
- Solche Secrets werden über die API **nie im Klartext** zurückgegeben — nur ein `has_*`-Flag.
- **Betreiber-Secrets** (`SECRET_KEY`, DB-Passwort): über `.env` — nie im Code, nie ins Repo.
- **Backup-Codes** werden nur als **Hash** gespeichert; ein verbrauchter Code wird entwertet.

### Secrets aus einem Secrets-Manager

Eine `.env`-Datei ist der einfachste Weg und für viele Installationen ausreichend. Wer einen **Secrets-Manager** betreibt, kann die Betreiber-Secrets von dort beziehen, ohne dass SentryMail dafür etwas mitbringen muss: Die Anwendung liest sie als Umgebungsvariablen, und woher die kommen, entscheidet der Betrieb.

**Das ist bewusst keine Integration.** Einen bestimmten Anbieter fest einzubauen würde jeden Betreiber in dessen Werkzeug zwingen — dieselbe Überlegung wie beim SMTP-Versand und beim SMS-Gateway. Alle folgenden Wege funktionieren ohne Änderung an der Anwendung.

**Bitwarden Secrets Manager** — die CLI legt die Secrets als Umgebungsvariablen an:

```bash
bws run --project-id <PROJEKT> -- docker compose up -d
```

**HashiCorp Vault** — mit der Agent-Vorlage in eine `.env` schreiben oder direkt injizieren:

```bash
vault agent -config=agent.hcl     # rendert .env aus einer Template-Datei
# oder, ohne Datei auf der Platte:
export SECRET_KEY="$(vault kv get -field=secret_key secret/sentrymail)"
```

**Infisical, 1Password, AWS/GCP Secret Manager** — funktionieren nach demselben Muster (`infisical run --`, `op run --`, Sidecar oder Init-Container).

**Docker Swarm oder Kubernetes** — dort sind Secrets Bordmittel; im Compose-Betrieb geht auch `secrets:` mit `*_FILE`-Variablen, sofern die eingesetzten Images das unterstützen.

Worauf es unabhängig vom Werkzeug ankommt:

- **`SECRET_KEY` ist der Schlüssel zu allen at-rest verschlüsselten Zugangsdaten.** Geht er verloren, sind SMTP-, LDAP-, OIDC- und Gateway-Zugangsdaten unlesbar und müssen neu eingegeben werden. Er gehört gesichert wie ein Backup — und ein Backup der Datenbank ohne ihn ist nur die halbe Wiederherstellung.
- **Ein Wechsel des `SECRET_KEY` entwertet die verschlüsselten Felder.** Vor einer Rotation die betroffenen Zugangsdaten notieren und danach neu setzen.
- **`.env` mit `chmod 600`**, falls sie doch verwendet wird — und niemals committen.

## Datensparsamkeit beim Tracking

- Erfasst wird nur, **dass** ein Empfänger geöffnet/geklickt/ein Formular abgeschickt hat (Awareness-Signal) — inkl. Zeitpunkt und IP.
- **Eingegebene Formulardaten werden standardmäßig nicht gespeichert.** „Daten-Capture" und „Passwörter erfassen" sind pro Landing Page **opt-in** und sollten nur nach interner Freigabe (Datenschutz/Betriebsrat) genutzt werden.
- **Client-Fingerprinting ist standardmäßig aus** und nur nach ausdrücklicher Admin-Entscheidung aktivierbar.
- Für den mitbestimmten Betrieb gibt es darüber hinaus den **Datenschutz- und Mitbestimmungsmodus** mit Sperre für Einzelpersonen-Auswertungen, k-Anonymität, Vier-Augen-Freigabe und automatischer Anonymisierung — siehe [Datenschutz & Mitbestimmung](/reference/datenschutz/).

## Nachvollziehbarkeit

- **Audit-Log** (Einstellungen → Aktivität): Anmeldungen (Erfolg/Fehlschlag/blockiert) und Systemänderungen (Benutzer, Einstellungen, 2FA) mit Zeitstempel und IP.

## Betrieb / Härtung

- **Reverse Proxy** (Caddy) mit TLS; hinter externem TLS-Proxy betreibbar.
- **Container** rootless und gehärtet, Dienste im internen Docker-Netz.
- Empfehlungen:
  - Starken, zufälligen `SECRET_KEY` (≥ 32 Zeichen) setzen und geheim halten.
  - `.env` mit `chmod 600` schützen, nie committen.
  - Zugriff aufs Dashboard einschränken (VPN/Netzsegmentierung).
  - Regelmäßige Datenbank-Backups.
  - Rollen sparsam vergeben (Prinzip der geringsten Rechte).

## Verantwortungsvoller Einsatz

Ergebnisse dienen der **Awareness-Verbesserung**, **nicht** der Sanktionierung Einzelner. Simulationen und etwaige Datenerfassung vorab intern abstimmen.

Siehe auch: [Konfiguration](/guides/konfiguration/) · [Compliance-Einordnung](/reference/compliance/)
