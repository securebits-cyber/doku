---
title: "Funktionen im Überblick"
description: "Alle Funktionen von HumanShield.APP: Phishing-Vorlagen, Gruppen, Landing Pages, Kampagnen, Tracking, Human Risk Management und die Add-ons."
sidebar:
  label: "Funktionen"
  order: 1
---

Was HumanShield.APP kann — vom Erstellen einer Phishing-Vorlage bis zur personenbezogenen Risiko-Auswertung. Der **Open-Core-Kern** (MPL-2.0) enthält alles, was für vollständige Awareness-Kampagnen nötig ist; die kostenpflichtigen [Business-](#business-edition-add-on) und [Enterprise-Add-ons](#enterprise-edition-add-on) ergänzen Automatisierung, Reporting und Unternehmens-Integrationen.

## Vorlagen (Templates)

- **HTML- oder Markdown-Editor** (umschaltbar) mit Live-Vorschau; Markdown wird beim Speichern in HTML umgewandelt.
- **Personalisierungs-Variablen** (in Betreff, HTML und Text):
  - `{{ first_name }}` — Vorname
  - `{{ last_name }}` — Nachname
  - `{{ email }}` — E-Mail-Adresse
  - `{{ link }}` — personalisierter Tracking-Link zur Landing Page
  - Aliase: `{{ recipient_name }}`, `{{ recipient_email }}`, `{{ click_link }}`
- **Vorschau** mit Beispieldaten.
- **`.eml`-Import**: eine echte E-Mail hochladen — Betreff, HTML/Text und **Anhänge** werden übernommen.
- **Anhänge** manuell hinzufügen/entfernen; werden mit der Kampagne versendet.

## Gruppen

Wiederverwendbare Empfängerlisten. Empfänger hinzufügen per:
- **manueller Eingabe** (E-Mail, Vor-/Nachname, Position),
- **CSV** (Einfügen oder Datei),
- **LDAP-Import** (sofern konfiguriert).

## Sending Profiles

SMTP-Zugangsdaten + Absender-Identität je Profil. Test-Mail-Funktion. Ohne Profil greift das globale Fallback-SMTP.

## Landing Pages

Ziel des Klicks. HTML- oder Markdown-Inhalt. Optional:
- **Daten-Capture** (abgeschickte Formulardaten als Signal),
- **Passwörter erfassen** (nur bei Bedarf; Datenschutz beachten),
- **Weiterleitung** nach dem Absenden (z. B. Aufklärungsseite).

Formulare werden beim Ausliefern automatisch auf die Tracking-URL umgebogen.

## Kampagnen

Assistent kombiniert **Vorlage + Sending Profile + Landing Page + Empfängergruppen** und optional eine **Zeitplanung**. Nach dem Anlegen wird der Versand über **Senden** gestartet.

## Tracking & Ergebnisse

- Erfasst werden **Öffnungen** (Pixel), **Klicks** (Link/Landing) und **Formular-Eingaben**.
- Je Ereignis werden **Kontext-Metadaten** erfasst: Browser, Betriebssystem, Gerätetyp, Referrer, Sprache, Bildschirmauflösung, UTM-Parameter, ein leichtgewichtiger **Client-Fingerprint** (Hash aus stabilen Browser-Merkmalen, ohne Cookie/externes Skript) sowie — bei konfigurierter GeoIP-Datenbank (`GEOIP_DB_PATH`, siehe Konfiguration) — das **Land** des Zugriffs.
- Auswertung **pro Empfänger** (versendet / geöffnet / geklickt / Daten abgeschickt) plus Gesamt-Kennzahlen, inkl. **Mehrfachbesuchen** (Anzahl der Klicks je Empfänger) und aufklappbarem **Session-Verlauf** (chronologische Ereignis-Chronik mit Browser/OS/Gerät/Land/IP).
- **Control-Center**-Dashboard mit KPI-Kacheln, **Risiko-Score (0–100, Ampel)**, **Trichter** (Versand→Submit), **Zeitachse** der Ereignisse, **Engagement-Analytics** (Browser/OS/Gerät/Länder/Sprache/Auflösung/UTM), **Aktivitäts-Heatmap** (Wochentag × Uhrzeit) sowie einer Liste „Nicht bestanden".
- **Human Risk Management** — personenbezogene Risiko-Rangliste über alle Kampagnen: bewertet je Person Klickverhalten/Passworteingaben (Verhaltens-Score), **Wiederholungsfehler** (≥ 2 Kampagnen mit Klick/Absenden erhöhen den Score) und **Kritikalität** (gewichtet das Ergebnis); Abteilung und Funktion werden mitgeführt.
- **Management Report** (konsolidierte Ansicht: Kennzahlen, Kampagnenvergleich, Risikoverteilung, Top-Durchgefallene) mit **CSV-Export**.

## Benutzer & Rollen

- Rollen **Admin** und **Benutzer**. Admins verwalten Einstellungen und Konten.
- 2FA-Status je Nutzer sichtbar; Admins können 2FA zurücksetzen.

## Business-Edition (Add-on)

Kostenpflichtiges Add-on, per Lizenz freigeschaltet. Enthält:

- **LDAP-Verzeichnisimport** von Empfängern (Einstellungen → LDAP), inkl. optionalem CA-Zertifikat für LDAPS/StartTLS.
- **Passkeys als 2FA** (WebAuthn) — Anmeldung per Fingerabdruck, Gesicht oder Sicherheitsschlüssel als zweiter Faktor; Verwaltung unter Mein Profil, mehrere Passkeys je Konto, Backup-Codes zur Wiederherstellung.
- **Azure AD / Entra ID-Import** von Empfängern über Microsoft Graph (Einstellungen → Azure AD / Entra ID; Import je Gruppe über „Entra-Import").
- **E-Mail-Upload** (`.eml`) als Vorlagen-Entwurf.
- **Vorlagen-Bibliothek** — fertige Awareness-Vorlagen (DHL, Amazon, Rechnung, Microsoft 365, HR, Bank, PayPal, LinkedIn, PDF-Köder, QR-Kampagne) zum Klonen. Zu jeder Mail-Vorlage gibt es eine **passende Landing Page** (markengerechte Anmelde-/Bestätigungsseite mit Formular), die sich per „Landing Page" als editierbare Seite mit aktivierter Erfassung übernehmen lässt.
- **KI-gestützte Erstellung** — anbieter-neutrale KI-Anbindung (Einstellungen → KI-Anbindung: OpenAI-kompatible Basis-URL, Modell, verschlüsselter API-Key; funktioniert mit OpenAI, Azure OpenAI, Anthropic-kompatibel, Mistral, Groq, OpenRouter oder lokalen Modellen wie Ollama/vLLM/LM Studio). Im Vorlagen- und Landing-Page-Editor erzeugt „Mit KI erstellen" aus einer Kurzbeschreibung Betreff + HTML bzw. eine Landing Page mit Formular.
- **Angriffsarten** — zusätzliche Bibliotheks-Vorlagen für **Spear Phishing** (persönlich adressiert), **Whaling** (CEO-Fraud/Geschäftsführung) und **dateibasierte Angriffe** (mit Köder-Anhang, z. B. „Rechnung.pdf").
- **PDF-Export** von Management Report und Kampagnen-Ergebnissen. Unter Einstellungen → PDF-Reports lassen sich ein **Logo** und **Firmendaten** (Firmenname, Straße, PLZ, Stadt, Verantwortlicher, Abteilung, Telefonnummer) hinterlegen, die als Kopf in alle PDF-Exporte eingebettet werden.
- **QR-Code-Phishing (Quishing)** — Platzhalter `{{ qr_code }}` erzeugt beim Versand pro Empfänger einen QR-Code auf den Tracking-Link.
- **Webhooks** — bei jedem Tracking-Ereignis ein JSON-POST an konfigurierbare URLs (Einstellungen → Webhooks).
- **Passwortabfrage** — auf Landing Pages mit aktivierter Erfassung werden abgeschickte Formulardaten gespeichert; Passwort-Felder werden **maskiert** (nie im Klartext) und at-rest verschlüsselt. Anzeige in den Kampagnen-Ergebnissen.
- **Business-Reporting** — **Executive Report** (Kurzfassung als PDF), **Trendanalyse** (Risiko/Klickrate je Kampagne über die Zeit) und **Benutzerentwicklung** (pro E-Mail über alle Kampagnen aggregiert) auf der Berichte-Seite.
- **Wiederkehrende Kampagnen** — automatischer, terminierter Wiederversand in festem Intervall (Menüpunkt „Wiederkehrend"): ein Scheduler erzeugt je Fälligkeit eine neue Kampagnen-Iteration (Empfänger aus den Gruppen, frische Tracking-Token) und versendet sie.
- **Mehrstufige Kampagnen** — Kampagnen-Sequenzen (Menüpunkt „Mehrstufig"): mehrere Stufen (je Vorlage + Verzögerung in Tagen ab Start) an dieselben Empfänger; der Scheduler versendet fällige Stufen automatisch.
- **Nachweis-Center** — auf der Berichte-Seite je ein eigenes PDF-Dokument: **DSGVO** (Art. 32), **NIS2** (Art. 21), **ISO/IEC 27001** (A.6.3), **Awareness-Nachweis**, **Audit-Bericht** (mit Kampagnen-Detail), **Zertifikat** und **Schulungsnachweise** (Teilnahme je Person).

## Enterprise-Edition (Add-on)

Enthält alle Business-Funktionen. Zusätzlich:

- **White-Label** — eigenes Branding (App-Name, Akzentfarben, Logo) unter Einstellungen → White-Label; wird app-weit inkl. Login-Seite angewendet.
- **Automatische/Risiko-Kampagnen** — Menüpunkt „Auto-Kampagnen": wählt Empfänger dynamisch nach Risiko (Daten abgeschickt / geklickt / alle) und versendet automatisch in festem Intervall (eigener Enterprise-Scheduler).
- **Enterprise-Reporting** — auf der Berichte-Seite (Abschnitt „Schulungsfortschritt & Zertifikatsstatus"): Fortschritt je Person (erstes → letztes Risiko), Zertifikatsstatus (bestanden/offen) sowie **individueller Bericht** und **persönliches Zertifikat** je Person als PDF.
- **SIEM-Export** — Einstellungen → SIEM-Export: leitet jedes Tracking-Ereignis asynchron an ein SIEM weiter (**Splunk HEC**, **Elasticsearch**, **Microsoft Sentinel** oder generisches **JSON**), Token verschlüsselt gespeichert, mit Test-Funktion.
- **SAML Single Sign-On** — Einstellungen → SAML/SSO: Anmeldung über einen beliebigen SAML-2.0-Identity-Provider (ADFS, Entra ID, Keycloak, Okta …) als optionale Zweitmethode neben lokalem Login und OIDC. AuthnRequest per HTTP-Redirect, Assertion Consumer Service per HTTP-POST; die Assertion muss **signiert** sein (Signatur-, Gültigkeits- und Audience-Prüfung). SP-Metadaten als XML abrufbar.
- **AI-Scoring** — auf der Berichte-Seite („KI-Risikoanalyse"): eine KI-gestützte, qualitative Einschätzung der aktuellen Human-Risk-Kennzahlen (Score-Verteilung, Wiederholungstäter, Top-Risiko-Personen inkl. Abteilung/Kritikalität) mit priorisierten Maßnahmen. Nutzt die anbieter-neutrale KI-Anbindung des Business-Add-ons.

Siehe auch: [Konfiguration](/guides/konfiguration/) · [Roadmap](/reference/roadmap/)
