---
title: "Roadmap"
description: "Implemented feature set and planned extensions."
sidebar:
  order: 9
---

The documented feature set is implemented: the **open-core** and the paid **Business** and **Enterprise add-ons** are available. See [Features](/en/reference/funktionen/) for the full list.

## Delivered

**Open Core** — campaigns, templates (HTML/Markdown, `.eml` import incl. attachments), groups (manual/CSV), landing pages, per-recipient tracking (opens/clicks/submissions, context metadata, country lookup, client fingerprint, repeat visits/session history, activity heatmap), control-center dashboard with risk score and human risk management, management report (CSV), local login + OIDC, 2FA (TOTP/email), audit log.

**Business add-on** — LDAP and Entra ID import, passkeys (WebAuthn) as 2FA, template library incl. matching landing pages, vendor-neutral AI creation of templates/landing pages, `.eml` upload, PDF export (management/executive), QR phishing (quishing), webhooks, password prompt, business reporting (trend, user development, department comparison), recurring and multi-stage campaigns, evidence center (GDPR/NIS2/ISO 27001, certificates, training records).

**Enterprise add-on** — white-label, automatic/risk-based campaigns, enterprise reporting (training progress, certificate status, individual reports/certificates), SIEM export (Splunk HEC, Elasticsearch, Microsoft Sentinel, JSON), SAML SSO, AI risk analysis (AI scoring), **training module (LMS)** — self-hosted mandatory video training with automatic assignment by awareness threshold, comprehension quizzes, deadlines and audit-proof certificates (see [Training module](/en/guides/schulungsmodul/)).

## Considered / later

- Further integrations (e.g. ticketing, chat) beyond the existing webhooks.

---

*This roadmap is aligned with the development status. Order and scope may change.*
