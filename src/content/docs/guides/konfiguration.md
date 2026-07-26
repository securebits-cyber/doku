---
title: "Konfiguration"
description: "Alle Einstellungen einrichten: Anmeldung, SSO, SMTP, Verzeichnisse, Add-on-Funktionen und Schnittstellen."
sidebar:
  order: 2
---
Ein Großteil der Konfiguration läuft über das Dashboard unter **Einstellungen** (admin-only). Betreiber-Secrets (App-`SECRET_KEY`, DB-Passwort) bleiben in der `.env`.

## Kern

Ohne Lizenz nutzbar.


### Anmeldung

- **Lokaler Login** (E-Mail/Passwort) ist die primäre Methode. Konten werden von Admins angelegt (kein Self-Signup). Passwörter: Argon2id.
- **OIDC / Single Sign-On** ist eine optionale Zweitmethode für beliebige Provider (Authentik, Keycloak, Entra ID, Okta, …). Konfiguration im Dashboard: Issuer-URL, Client-ID, Client-Secret, Redirect-URI. Ohne aktive OIDC-Config läuft die App vollständig ohne IdP.
- **SAML SSO** (Enterprise-Add-on) ist eine weitere optionale Zweitmethode. Konfiguration unter **Einstellungen → SAML/SSO**: IdP-Entity-ID, IdP-SSO-URL (HTTP-Redirect), IdP-Signatur-Zertifikat (X.509), SP-Entity-ID, SP-ACS-URL und optionales Attribut-Mapping (E-Mail/Anzeigename; leer = NameID als E-Mail). Die Assertion muss signiert sein; die App prüft Signatur, Gültigkeitszeitraum und Audience. SP-Metadaten unter `/auth/saml/metadata`.

### Zwei-Faktor-Authentifizierung (2FA)

- Verfahren: **Authenticator-App (TOTP)**, **E-Mail-Einmalcode** oder — mit Business-Lizenz — **Passkey (WebAuthn)** — pro Nutzer wählbar.
- **Passkeys** (Business): Registrierung und Anmeldung über WebAuthn (Fingerabdruck, Gesicht oder Sicherheitsschlüssel). Mehrere Passkeys je Konto möglich; Verwaltung unter **Mein Profil**. Die RP-ID leitet sich aus `APP_DOMAIN` ab; die Origin ist über `WEBAUTHN_ORIGIN` überschreibbar (Default `https://{APP_DOMAIN}`). Backup-Codes dienen als Wiederherstellung bei Geräteverlust.
- **Backup-Codes** bei der Einrichtung (einmalig nutzbar).
- **Erzwingbar** durch Admins unter **Einstellungen → Sicherheit**: aus / nur für Admins / für alle. Betroffene Nutzer werden beim nächsten Login zur Einrichtung geführt.
- Admins können 2FA eines Nutzers zurücksetzen (Geräteverlust).
- Secrets liegen verschlüsselt (Fernet), Backup-Codes nur als Hash.

### SMTP

- **Globales Fallback-SMTP** unter **Einstellungen → SMTP** (greift, wenn eine Kampagne kein eigenes Sending Profile nutzt).
- **Sending Profiles** bündeln SMTP-Zugangsdaten und Absender-Identität je Kampagne.
- Provider-agnostisch (IONOS, Hetzner, Mailgun, SES, Postmark, eigener Mailserver …). Passwörter verschlüsselt at-rest; die API gibt sie nie zurück (nur ein `has_*`-Flag).
- Dass das SMTP funktioniert, heißt noch nicht, dass die Mail beim Empfänger ankommt — dazwischen steht dessen Mail-Gateway. Siehe [Zustellung](/guides/zustellung/): Allowlisting, Selbsttest und Diagnose.

### GeoIP / Länder-Statistik (optional)

Für die Länder-Auswertung im Dashboard hinterlegt der Betreiber in der `.env` den Pfad zu einer **lokalen Country-Datenbank im MMDB-Format** (`GEOIP_DB_PATH`), z. B. MaxMind GeoLite2-Country oder DB-IP Country Lite. Der Lookup läuft vollständig lokal — es wird **nie ein externer Dienst** aufgerufen. Ohne konfigurierte Datei bleibt die Länder-Statistik einfach leer; private/interne IP-Adressen werden nie aufgelöst.

```ini title=".env"
GEOIP_DB_PATH=/pfad/zu/GeoLite2-Country.mmdb
```

### Aktivität / Audit-Log

Unter **Einstellungen → Aktivität → Audit Events**: Anmelde-Ereignisse (Erfolg/Fehlschlag/blockiert) und System­änderungen (Benutzer, Einstellungen, 2FA) — mit Zeitstempel und IP.

Siehe auch: [Funktionen](/reference/funktionen/)

## Business-Add-on

Erst mit gültiger Business-Lizenz sichtbar und nutzbar.


### LDAP

Empfänger-Import aus einem Verzeichnisdienst (Active Directory / OpenLDAP) unter **Einstellungen → LDAP**: Host/Port, LDAPS/StartTLS, Bind-DN + Passwort, Base-DN, User-Filter, Attribut-Mapping. Import anschließend unter **Gruppen → LDAP-Import**.

Für **LDAPS/StartTLS** kann optional ein **CA-/Server-Zertifikat** (PEM) hinterlegt werden. Ist es gesetzt, wird das Serverzertifikat verifiziert (empfohlen bei internen oder selbstsignierten CAs); ohne Zertifikat erfolgt keine Prüfung.

### Empfänger-Import aus Entra ID

Für Häuser, die Microsoft 365 nutzen, aber kein SCIM einrichten wollen.

1. Im **Microsoft Entra Admin Center** eine App-Registrierung anlegen.
2. Unter *API-Berechtigungen* **Anwendungsberechtigungen** hinzufügen: `User.Read.All` und `GroupMember.Read.All`, anschließend **Administratorzustimmung erteilen**. Ohne die Zustimmung liefert Graph leere Ergebnisse statt einer Fehlermeldung — der häufigste Stolperstein.
3. Unter *Zertifikate & Geheimnisse* ein **Client-Secret** erzeugen.
4. In SentryMail unter **Einstellungen → Azure AD / Entra ID** Verzeichnis-ID (Tenant), Anwendungs-ID (Client) und Secret eintragen.
5. Import je Gruppe unter **Gruppen → Entra-Import**.

Das Secret liegt verschlüsselt in der Datenbank und wird über die API nie zurückgegeben.

### Verzeichnis-Bereitstellung: SCIM 2.0

Statt Empfänger zu importieren, lässt sich das Verzeichnis den Bestand **pflegen** lassen. Der Identity Provider legt Benutzer und Gruppen an, aktualisiert sie und entfernt sie wieder.

1. Unter **Einstellungen → SCIM** den Zugang aktivieren und ein **Token erzeugen** — es wird nur einmal angezeigt.
2. Im Identity Provider eine SCIM-Anwendung anlegen mit:
   - **Basis-URL:** `https://{APP_DOMAIN}/scim/v2`
   - **Authentifizierung:** OAuth Bearer Token (das erzeugte Token)
3. Attribut-Mapping prüfen — benötigt werden `userName` (E-Mail), `name.givenName`, `name.familyName`.

Getestet mit Entra ID, Okta und Keycloak; die Schnittstelle folgt RFC 7644, andere Provider funktionieren entsprechend.

:::note
So verwaltete Gruppen sind im Dashboard **schreibgeschützt**. Zwei Quellen für dieselbe Liste würden sich gegenseitig überschreiben — welche gewinnt, wäre nicht vorhersagbar.
:::

Ob die Anbindung steht, zeigt das Feld **Letzter Zugriff** auf derselben Seite. Beim Einrichten ist das die einzige verlässliche Rückmeldung.

### KI-Anbindung

Für die KI-gestützte Erstellung von Vorlagen und Landing Pages. **Kein Anbieter ist fest hinterlegt** — angesprochen wird eine konfigurierbare, OpenAI-kompatible Chat-Completions-Schnittstelle.

Unter **Einstellungen → KI-Anbindung**:

| Feld | Beispiel |
|---|---|
| Basis-URL | `https://api.openai.com/v1` |
| Modell | `gpt-4o-mini` |
| API-Schlüssel | verschlüsselt gespeichert |

Dieselben drei Felder genügen für Azure OpenAI, Mistral, Groq, OpenRouter — und für **lokale Modelle**: Ollama (`http://ollama:11434/v1`), vLLM oder LM Studio. Damit lässt sich die Funktion vollständig ohne externen Dienst betreiben.

:::caution
Ein öffentlicher Anbieter sieht die Eingaben. Wer Vorlagen mit internen Bezeichnungen, echten Namen oder Kundendaten erzeugen lässt, gibt diese dorthin weiter — für solche Fälle ist ein lokales Modell die richtige Wahl.
:::

### Webhooks

Bei jedem Tracking-Ereignis geht ein JSON-POST an die eingetragenen Adressen. Anlegen unter **Einstellungen → Webhooks**; mehrere Ziele sind möglich, jedes einzeln abschaltbar.

```json title="Nutzlast"
{
  "event": "clicked",
  "recipient_email": "person@firma.example",
  "campaign_id": "…",
  "campaign_name": "Rechnung Q3",
  "occurred_at": "2026-07-26T09:14:22+00:00",
  "ip": "203.0.113.10",
  "user_agent": "Mozilla/5.0 …"
}
```

`event` ist `sent`, `opened`, `clicked` oder `submitted`. Zugestellt wird asynchron — ein langsamer oder ausgefallener Empfänger bremst das Tracking nicht und lässt kein Ereignis verlorengehen.

:::note
Die Nutzlast enthält die **E-Mail-Adresse und IP** der betroffenen Person. Ein Webhook ist damit ein weiterer Empfänger personenbezogener Daten und gehört ins Verarbeitungsverzeichnis. Im Datenschutzmodus gilt die Sperre für Einzelpersonen-Auswertungen **nicht** für Webhooks — sie sind ein bewusst eingerichteter Ausgang.
:::

### PDF-Reports: Logo und Firmendaten

Unter **Einstellungen → PDF-Reports** kann ein Logo hochgeladen werden (PNG/JPG/SVG, kein GIF, max. 512 KB), das oben in die exportierten **PDF-Reports** eingebettet wird. Die Funktion gehört zum **Business-Add-on**: Ohne gültige Business-Lizenz ist die Seite gesperrt. Das Logo wird in der Datenbank hinterlegt und lässt sich jederzeit ersetzen oder entfernen.

Auf derselben Seite können außerdem **Firmendaten** gepflegt werden: **Firmenname, Straße, Postleitzahl, Stadt, Verantwortlicher, Abteilung, Telefonnummer**. Alle Felder sind optional. Ausgefüllte Felder erscheinen als Kopfblock unter dem Logo in **allen PDF-Exporten** — Management-, Executive- und Compliance-Reports, Schulungsnachweisen, Zertifikaten und Kampagnen-Ergebnissen sowie den individuellen Berichten und Zertifikaten der Enterprise-Version. Werden die Felder geleert, verschwindet der Block wieder aus den Reports.

### PDF-Signatur

Belegt, dass ein Nachweis seit seiner Erstellung nicht verändert wurde. Unter **Einstellungen → PDF-Signatur**:

1. Namen eintragen, der im Zertifikat erscheinen soll (üblicherweise die Firma), und **Zertifikat erzeugen**.
2. Optional Grund und Ort eintragen — sie erscheinen im Signaturfeld.
3. **Nachweise signieren** einschalten. Ohne Zertifikat lässt sich die Einstellung nicht aktivieren.

Ab dann werden **alle** erzeugten PDFs signiert: Berichte, Nachweise, Zertifikate, auch die des Enterprise-Add-ons.

:::caution[Selbstsigniert heißt unverändert, nicht beglaubigt]
Das Zertifikat erzeugt die Instanz selbst. Ein PDF-Reader zeigt deshalb „Signaturgültigkeit unbekannt", weil ihm die ausstellende Stelle nicht bekannt ist — die Signatur belegt die Unverändertheit, nicht die Beglaubigung durch eine anerkannte Stelle.

Wer eine Vertrauenskette braucht, verteilt den auf der Seite angezeigten **Fingerabdruck** und das Zertifikat als vertrauenswürdig, oder verwendet eines der eigenen PKI.
:::

Zwei Fälle führen bewusst zu **keiner** Signatur statt zu einer schlechten: ein abgelaufenes Zertifikat und ein Fehler beim Signieren. Der Nachweis wird dann unsigniert ausgeliefert — besser als ein Abbruch mitten im Download.

### Mail-Report-Button

Beschäftigte melden verdächtige Mails direkt aus dem Mailprogramm. Unter **Einstellungen → Mail-Report-Button**:

1. Meldeweg **aktivieren** und ein **Melde-Token** erzeugen — es wird nur einmal angezeigt.
2. **Erlaubte Absenderdomains** eintragen. Leer heißt: jede Adresse wird angenommen.
3. Für Outlook das **fertige Manifest herunterladen** und über das Microsoft 365 Admin Center bzw. die Exchange-Verwaltung verteilen. Für Thunderbird die MailExtension ausrollen und dort Adresse und Token eintragen.

Ob die Kette steht, zeigt das Feld **Letzte Meldung**. Ausrollwege und Grenzen der Clients stehen unter [Meldung & Analyse](/reference/meldung-analyse/).

:::note
Die meldenden Beschäftigten haben kein SentryMail-Konto — deshalb authentifiziert sich die **Instanz** über ein Token, nicht der Mensch über ein Passwort. Das Token liegt damit auf jedem Arbeitsplatz. Begrenzt wird das durch die Abschaltbarkeit, die erlaubten Domains und ein Meldelimit je Person und Stunde; ein neues Token entwertet das alte sofort.
:::

## Enterprise-Add-on

Enthält alle Business-Funktionen.


### Schulungsmodul / LMS-Videospeicher

Der Ablageort der Schulungsvideos ist ein Betreiber-Wert in der `.env`: `LMS_STORAGE_BACKEND` (`filesystem` oder `s3`), `LMS_MEDIA_DIR` (bei Dateisystem) bzw. die `LMS_S3_*`-Schlüssel (bei S3-kompatiblem Speicher wie selbstgehostetem MinIO). Einrichtung, Kurse, Zuweisung und Zertifikate sind in der eigenen Anleitung beschrieben: [Schulungsmodul (LMS)](/guides/schulungsmodul/).

### SIEM-Export

Leitet jedes Tracking-Ereignis an ein SIEM weiter. Unter **Einstellungen → SIEM-Export** Format, Endpunkt und Token eintragen:

| Format | Endpunkt | Token |
|---|---|---|
| **Splunk HEC** | `https://splunk.firma.example:8088/services/collector` | HEC-Token; optional ein Index |
| **Elasticsearch** | `https://elastic.firma.example/index/_doc` | API-Key |
| **Microsoft Sentinel** | URL der Data-Collection-Rule | Bearer-Token |
| **Generisches JSON** | beliebig | optionales Bearer-Token |

Die Schaltfläche **Verbindung prüfen** schickt ein echtes Testereignis — erst dessen Ankunft belegt, dass Token und Endpunkt stimmen.

Zusätzlich schreibt das Schulungsmodul strukturierte `lms.*`-Ereignisse; `lms.progress.anomaly` und `lms.stream.denied` sind bewusst als *Warning* eingestuft, weil gehäufte Vorkommen je Person auf einen Manipulationsversuch hindeuten.

### White-Label

Unter **Einstellungen → White-Label**: App-Name, Akzentfarbe und Logo (hell und dunkel). Die Änderungen gelten app-weit einschließlich der Anmeldeseite.

Der **Absendername** einer Kampagne ist davon unabhängig — er ist der Name der Kampagne, nie der Produkt- oder Profilname. Eine Simulation, die „SentryMail" als Absender trägt, misst nichts.

### Anhang-Prüfung und Threat Intel

ClamAV als Compose-Profil, YARA mit eigenen Regeln und der Abgleich gegen eine eigene MISP-Instanz sind samt Fehlerverhalten in [Meldung & Analyse](/reference/meldung-analyse/) beschrieben.

### Weitere Zustellwege

SMS über ein eigenes Gateway, Matrix, Nextcloud Talk und die USB-Simulation: siehe [Weitere Kanäle](/reference/weitere-kanaele/).

Siehe auch: [Funktionen](/reference/funktionen/) · [Schulungsmodul (LMS)](/guides/schulungsmodul/)
