---
title: "Konfiguration: SSO, 2FA und SMTP"
description: "HumanShield.APP einrichten: lokaler Login, OIDC- und SAML-Single-Sign-On, Zwei-Faktor-Authentifizierung, SMTP-Versand, LDAP-Import, GeoIP und Audit-Log."
sidebar:
  label: "Konfiguration"
  order: 2
---

Ein Großteil der Konfiguration läuft über das Dashboard unter **Einstellungen** (admin-only); nur die Betreiber-Secrets (App-`SECRET_KEY`, DB-Passwort) bleiben in der `.env`. Voraussetzung ist ein laufender Stack — siehe [Installation](/guides/installation/).

Auf dieser Seite: [Anmeldung](#anmeldung) (lokal, OIDC, SAML) · [2FA](#zwei-faktor-authentifizierung-2fa) · [SMTP](#smtp) · [LDAP](#ldap) · [PDF-Reports](#pdf-reports-logo-und-firmendaten-business) · [GeoIP](#geoip--länder-statistik-optional) · [Audit-Log](#aktivität--audit-log).

## Anmeldung

- **Lokaler Login** (E-Mail/Passwort) ist die primäre Methode. Konten werden von Admins angelegt (kein Self-Signup). Passwörter: Argon2id.
- **OIDC / Single Sign-On** ist eine optionale Zweitmethode für beliebige Provider (Authentik, Keycloak, Entra ID, Okta, …). Konfiguration im Dashboard: Issuer-URL, Client-ID, Client-Secret, Redirect-URI. Ohne aktive OIDC-Config läuft die App vollständig ohne IdP.
- **SAML SSO** (Enterprise-Add-on) ist eine weitere optionale Zweitmethode. Konfiguration unter **Einstellungen → SAML/SSO**: IdP-Entity-ID, IdP-SSO-URL (HTTP-Redirect), IdP-Signatur-Zertifikat (X.509), SP-Entity-ID, SP-ACS-URL und optionales Attribut-Mapping (E-Mail/Anzeigename; leer = NameID als E-Mail). Die Assertion muss signiert sein; die App prüft Signatur, Gültigkeitszeitraum und Audience. SP-Metadaten unter `/auth/saml/metadata`.

## Zwei-Faktor-Authentifizierung (2FA)

- Verfahren: **Authenticator-App (TOTP)**, **E-Mail-Einmalcode** oder — mit Business-Lizenz — **Passkey (WebAuthn)** — pro Nutzer wählbar.
- **Passkeys** (Business): Registrierung und Anmeldung über WebAuthn (Fingerabdruck, Gesicht oder Sicherheitsschlüssel). Mehrere Passkeys je Konto möglich; Verwaltung unter **Mein Profil**. Die RP-ID leitet sich aus `APP_DOMAIN` ab; die Origin ist über `WEBAUTHN_ORIGIN` überschreibbar (Default `https://{APP_DOMAIN}`). Backup-Codes dienen als Wiederherstellung bei Geräteverlust.
- **Backup-Codes** bei der Einrichtung (einmalig nutzbar).
- **Erzwingbar** durch Admins unter **Einstellungen → Sicherheit**: aus / nur für Admins / für alle. Betroffene Nutzer werden beim nächsten Login zur Einrichtung geführt.
- Admins können 2FA eines Nutzers zurücksetzen (Geräteverlust).
- Secrets liegen verschlüsselt (Fernet), Backup-Codes nur als Hash.

## SMTP

- **Globales Fallback-SMTP** unter **Einstellungen → SMTP** (greift, wenn eine Kampagne kein eigenes Sending Profile nutzt).
- **Sending Profiles** bündeln SMTP-Zugangsdaten und Absender-Identität je Kampagne.
- Provider-agnostisch (IONOS, Hetzner, Mailgun, SES, Postmark, eigener Mailserver …). Passwörter verschlüsselt at-rest; die API gibt sie nie zurück (nur ein `has_*`-Flag).

## LDAP

Empfänger-Import aus einem Verzeichnisdienst (Active Directory / OpenLDAP) unter **Einstellungen → LDAP**: Host/Port, LDAPS/StartTLS, Bind-DN + Passwort, Base-DN, User-Filter, Attribut-Mapping. Import anschließend unter **Gruppen → LDAP-Import**.

Für **LDAPS/StartTLS** kann optional ein **CA-/Server-Zertifikat** (PEM) hinterlegt werden. Ist es gesetzt, wird das Serverzertifikat verifiziert (empfohlen bei internen oder selbstsignierten CAs); ohne Zertifikat erfolgt keine Prüfung.

## PDF-Reports: Logo und Firmendaten (Business)

Unter **Einstellungen → PDF-Reports** kann ein Logo hochgeladen werden (PNG/JPG/SVG, kein GIF, max. 512 KB), das oben in die exportierten **PDF-Reports** eingebettet wird. Die Funktion gehört zum **Business-Add-on**: Ohne gültige Business-Lizenz ist die Seite gesperrt. Das Logo wird in der Datenbank hinterlegt und lässt sich jederzeit ersetzen oder entfernen.

Auf derselben Seite können außerdem **Firmendaten** gepflegt werden: **Firmenname, Straße, Postleitzahl, Stadt, Verantwortlicher, Abteilung, Telefonnummer**. Alle Felder sind optional. Ausgefüllte Felder erscheinen als Kopfblock unter dem Logo in **allen PDF-Exporten** — Management-, Executive- und Compliance-Reports, Schulungsnachweisen, Zertifikaten und Kampagnen-Ergebnissen sowie den individuellen Berichten und Zertifikaten der Enterprise-Version. Werden die Felder geleert, verschwindet der Block wieder aus den Reports.

## GeoIP / Länder-Statistik (optional)

Für die Länder-Auswertung im Dashboard hinterlegt der Betreiber in der `.env` den Pfad zu einer **lokalen Country-Datenbank im MMDB-Format** (`GEOIP_DB_PATH`), z. B. MaxMind GeoLite2-Country oder DB-IP Country Lite. Der Lookup läuft vollständig lokal — es wird **nie ein externer Dienst** aufgerufen. Ohne konfigurierte Datei bleibt die Länder-Statistik einfach leer; private/interne IP-Adressen werden nie aufgelöst.

```ini title=".env"
GEOIP_DB_PATH=/pfad/zu/GeoLite2-Country.mmdb
```

## Aktivität / Audit-Log

Unter **Einstellungen → Aktivität → Audit Events**: Anmelde-Ereignisse (Erfolg/Fehlschlag/blockiert) und System­änderungen (Benutzer, Einstellungen, 2FA) — mit Zeitstempel und IP.

Siehe auch: [Funktionen](/reference/funktionen/)
