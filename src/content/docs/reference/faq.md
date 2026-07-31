---
title: "FAQ – häufige Fragen"
description: "Häufige Fragen zu SentryMail: Datenschutz und Mitbestimmung, fehlende Öffnungen und Klicks, SMTP-Anbieter, SSO, Zwei-Faktor und Empfänger-Import."
sidebar:
  label: "FAQ"
  order: 7
---

Fragen nach Themen sortiert; zum Aufklappen anklicken.

## Grundlagen

<details>
<summary>Was ist SentryMail?</summary>

Eine selbstgehostete Open-Core-Plattform für Phishing-Awareness: simulierte Phishing-Kampagnen planen, versenden und pro Empfänger auswerten. Dazu kommen — je nach Lizenz — Schulungen, die Auswertung gemeldeter Mails und Simulationen über SMS, Chat oder ausgelegte Datenträger.

</details>

<details>
<summary>Macht mich das Tool „compliant"?</summary>

Nein — es *unterstützt* Awareness-Maßnahmen und deren Nachweis. Siehe [Compliance-Einordnung](/reference/compliance/).

</details>

## Datenschutz und Mitbestimmung

<details>
<summary>Werden echte Passwörter oder Formulardaten gespeichert?</summary>

Standardmäßig **nein** — erfasst wird nur das *Signal*, dass jemand geöffnet, geklickt oder ein Formular abgeschickt hat. Optional lässt sich pro Landing Page „Daten-Capture" (und separat „Passwörter") aktivieren; das ist bewusst opt-in und sollte nur nach interner Freigabe (Datenschutz, ggf. Betriebsrat) genutzt werden. Siehe [Sicherheit](/reference/sicherheit/).

</details>

<details>
<summary>Lässt sich die Auswertung einzelner Personen abschalten?</summary>

Ja. Im **Datenschutzmodus** sind Einzelpersonen-Auswertungen gesperrt; Auswertungen erscheinen erst ab einer Mindestzahl betroffener Personen (k-Anonymität). Eine Aufhebung braucht das Vier-Augen-Verfahren mit einem Datenschutzbeauftragten. Siehe [Datenschutz & Mitbestimmung](/reference/datenschutz/).

</details>

## Versand und Tracking

<details>
<summary>Warum sehe ich keine Öffnungen oder Klicks, obwohl versendet wurde?</summary>

- Viele Mail-Clients blockieren das Öffnungs-Pixel → Öffnungen sind unzuverlässig, **Klicks** sind das bessere Signal.
- Empfänger müssen die unter `APP_DOMAIN` gesetzte Adresse **erreichen** können. Bei internen oder VPN-only-Domains registrieren externe Empfänger keine Events.

</details>

<details>
<summary>Muss die App öffentlich erreichbar sein?</summary>

Für das Tracking müssen die Empfänger die Tracking-URL (`APP_DOMAIN`) erreichen. Das Dashboard selbst kann intern oder VPN-only bleiben.

</details>

<details>
<summary>Welche SMTP-Anbieter werden unterstützt?</summary>

Beliebige (IONOS, Hetzner, Mailgun, SES, Postmark, eigener Mailserver …). Host, Port, TLS-Modus und Zugangsdaten sind konfigurierbar; kein Anbieter ist fest hinterlegt.

</details>

<details>
<summary>Gehen Simulationen auch per SMS oder Chat?</summary>

Ja, mit dem Enterprise-Add-on: SMS über ein eigenes Gateway, Matrix, Nextcloud Talk sowie ausgelegte Datenträger (USB-Drop). Bespielt werden nur dienstliche Endgeräte, solange nichts anderes freigegeben ist. Siehe [Weitere Kanäle](/reference/weitere-kanaele/).

</details>

<details>
<summary>Wie starte ich eine Testkampagne?</summary>

Kampagne im Assistenten anlegen (Vorlage, optional Sending Profile und Landing Page, dazu die Gruppen) und über **Senden** starten — im Zweifel zuerst mit einer kleinen Testgruppe.

</details>

<details>
<summary>Wo sehe ich, wer geklickt hat?</summary>

Auf der Ergebnis-Seite der Kampagne: Gesamt-Kennzahlen **und** eine Tabelle pro Empfänger (versendet, geöffnet, geklickt, Daten abgeschickt), dazu ein CSV-Export. Im Datenschutzmodus bleibt die Einzelansicht gesperrt.

</details>

## Empfänger und Vorlagen

<details>
<summary>Wie importiere ich Empfänger?</summary>

In einer Gruppe: manuell, per CSV (Einfügen oder Datei) oder per LDAP-Import. Mit dem Business-Add-on kommen Azure AD / Entra ID und SCIM dazu — bei SCIM pflegt der Identity Provider die Gruppen, sie sind dann im Dashboard schreibgeschützt.

</details>

<details>
<summary>Kann ich eine echte E-Mail als Vorlage verwenden?</summary>

Ja — unter **Vorlagen → E-Mail hochladen** eine `.eml` importieren. Betreff, HTML/Text und **Anhänge** werden übernommen.

</details>

## Anmeldung und Konten

<details>
<summary>Kann ich OIDC und lokalen Login kombinieren?</summary>

Ja. Der lokale Login ist die primäre Methode; OIDC/SSO ist eine optionale Zweitmethode. Ohne OIDC-Konfiguration läuft die App vollständig ohne Identity Provider.

</details>

<details>
<summary>Wie richte ich Zwei-Faktor-Authentifizierung ein oder erzwinge sie?</summary>

Nutzer aktivieren 2FA unter **Mein Profil** (Authenticator-App oder E-Mail-Code, dazu Backup-Codes). Admins können 2FA unter **Einstellungen → Sicherheit** verpflichtend machen — für alle oder nur für Admins — und sie für einzelne Nutzer zurücksetzen.

</details>
