---
title: "Roadmap"
description: "Umgesetzter Funktionsumfang und geplante Erweiterungen."
sidebar:
  order: 9
---

Der dokumentierte Funktionsumfang ist umgesetzt: der **Open-Core-Kern** sowie die kostenpflichtigen **Business-** und **Enterprise-Add-ons** sind verfügbar. Die vollständige Auflistung findest du unter [Funktionen](/reference/funktionen/).

## Umgesetzt

**Open Core** — Kampagnen, Vorlagen (HTML/Markdown, `.eml`-Import inkl. Anhänge), Gruppen (manuell/CSV), Landing Pages, Tracking pro Empfänger (Öffnungen/Klicks/Eingaben, Kontext-Metadaten, Länder-Lookup, Client-Fingerprint, Mehrfachbesuche/Session-Verlauf, Aktivitäts-Heatmap), Control-Center-Dashboard mit Risiko-Score und Human-Risk-Management, Management Report (CSV), lokaler Login + OIDC, 2FA (TOTP/E-Mail), Audit-Log.

**Business-Add-on** — LDAP- und Entra-ID-Import, Passkeys (WebAuthn) als 2FA, Vorlagen-Bibliothek inkl. passender Landing Pages, anbieter-neutrale KI-Erstellung von Vorlagen/Landing Pages, `.eml`-Upload, PDF-Export (Management/Executive), QR-Phishing (Quishing), Webhooks, Passwortabfrage, Business-Reporting (Trend, Benutzerentwicklung, Abteilungsvergleich), wiederkehrende und mehrstufige Kampagnen, Nachweis-Center (DSGVO/NIS2/ISO 27001, Zertifikate, Schulungsnachweise).

**Enterprise-Add-on** — White-Label, automatische/risikoabhängige Kampagnen, Enterprise-Reporting (Schulungsfortschritt, Zertifikatsstatus, individuelle Berichte/Zertifikate), SIEM-Export (Splunk HEC, Elasticsearch, Microsoft Sentinel, JSON), SAML SSO, KI-Risikoanalyse (AI-Scoring), **Schulungsmodul (LMS)** — selbstgehostete Video-Pflichtschulungen mit automatischer Zuweisung nach Awareness-Schwellwert, Verständnis-Quiz, Fristen und revisionssicheren Zertifikaten (siehe [Schulungsmodul](/guides/schulungsmodul/)).

## Angedacht / später

- Weitere Integrationen (z. B. Ticketing, Chat) über die bestehenden Webhooks hinaus.

---

*Diese Roadmap wird am Entwicklungsstand ausgerichtet. Reihenfolge und Umfang können sich ändern.*
