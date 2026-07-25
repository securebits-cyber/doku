---
title: "FAQ"
description: "Häufig gestellte Fragen zu SentryMail."
sidebar:
  order: 6
---

**Was ist SentryMail?**
Eine selbstgehostete Open-Core-Plattform für Phishing-Awareness: simulierte Phishing-Kampagnen planen, versenden und pro Empfänger auswerten.

**Werden echte Passwörter oder Formulardaten gespeichert?**
Standardmäßig **nein** — erfasst wird nur das *Signal*, dass jemand geöffnet/geklickt/ein Formular abgeschickt hat. Optional lässt sich pro Landing Page „Daten-Capture" (und separat „Passwörter") aktivieren; das ist bewusst opt-in und sollte nur nach interner Freigabe (Datenschutz, ggf. Betriebsrat) genutzt werden. Siehe [Sicherheit](/reference/sicherheit/).

**Warum sehe ich keine Öffnungen/Klicks, obwohl versendet wurde?**
- Viele Mail-Clients blockieren das Öffnungs-Pixel → Öffnungen sind unzuverlässig, **Klicks** sind das bessere Signal.
- Empfänger müssen die unter `APP_DOMAIN` gesetzte Adresse **erreichen** können. Bei internen/VPN-only-Domains registrieren externe Empfänger keine Events.

**Muss die App öffentlich erreichbar sein?**
Für das Tracking müssen die Empfänger die Tracking-URL (`APP_DOMAIN`) erreichen. Das Dashboard selbst kann intern/VPN-only bleiben.

**Welche SMTP-Anbieter werden unterstützt?**
Beliebige (IONOS, Hetzner, Mailgun, SES, Postmark, eigener Mailserver …). Host/Port/TLS/Zugangsdaten sind konfigurierbar.

**Kann ich OIDC und lokalen Login kombinieren?**
Ja. Der lokale Login ist die primäre Methode; OIDC/SSO ist eine optionale Zweitmethode. Ohne OIDC-Config läuft die App vollständig ohne IdP.

**Wie richte ich 2FA ein / erzwinge sie?**
Nutzer aktivieren 2FA unter **Mein Profil** (Authenticator-App oder E-Mail-Code, plus Backup-Codes). Admins können 2FA unter **Einstellungen → Sicherheit** verpflichtend machen (für alle oder nur Admins) und für einzelne Nutzer zurücksetzen.

**Wie importiere ich Empfänger?**
In einer Gruppe: manuell, per CSV (Einfügen/Datei) oder per LDAP-Import (sofern konfiguriert).

**Kann ich eine echte E-Mail als Vorlage verwenden?**
Ja — unter **Vorlagen → E-Mail hochladen** eine `.eml` importieren. Betreff, HTML/Text und **Anhänge** werden übernommen.

**Wie starte ich eine Testkampagne?**
Kampagne im Assistenten anlegen (Vorlage + optional Sending Profile/Landing Page + Gruppen) und über **Senden** starten — im Zweifel mit einer kleinen Testgruppe.

**Wo sehe ich, wer geklickt hat?**
Auf der Ergebnis-Seite der Kampagne: Gesamt-Kennzahlen **und** eine Tabelle pro Empfänger (versendet / geöffnet / geklickt / Daten abgeschickt), plus CSV-Export.

**Macht mich das Tool „compliant"?**
Nein — es *unterstützt* Awareness-Maßnahmen und deren Nachweis. Siehe [NIS2 und BSI](/reference/nis2-und-bsi/).
