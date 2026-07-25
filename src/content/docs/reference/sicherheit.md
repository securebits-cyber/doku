---
title: "Sicherheit"
description: "Sicherheitsmechanismen von SentryMail und Empfehlungen für den Betrieb."
sidebar:
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
- **Betreiber-Secrets** (`SECRET_KEY`, DB-Passwort): ausschließlich über `.env`, nie im Code, nie ins Repo.
- **Backup-Codes** werden nur als **Hash** gespeichert; ein verbrauchter Code wird entwertet.

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

Siehe auch: [Konfiguration](/guides/konfiguration/) · [NIS2 und BSI](/reference/nis2-und-bsi/)
