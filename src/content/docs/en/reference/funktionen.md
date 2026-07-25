---
title: "Features"
description: "Templates, groups, campaigns, tracking and the Business and Enterprise add-ons at a glance."
sidebar:
  order: 1
---

## Templates

- **HTML or Markdown editor** (switchable) with live preview; Markdown is converted to HTML on save.
- **Personalization variables** (in subject, HTML and text):
  - `{{ first_name }}` — first name
  - `{{ last_name }}` — last name
  - `{{ email }}` — email address
  - `{{ link }}` — personalized tracking link to the landing page
  - Aliases: `{{ recipient_name }}`, `{{ recipient_email }}`, `{{ click_link }}`
- **Preview** with sample data.
- **`.eml` import**: upload a real email — subject, HTML/text and **attachments** are taken over.
- **Attachments** can be added/removed manually; they are sent with the campaign.

## Groups

Reusable recipient lists. Add recipients via:
- **manual entry** (email, first/last name, position),
- **CSV** (paste or file),
- **LDAP import** (if configured).

## Sending profiles

SMTP credentials + sender identity per profile. Test-mail function. Without a profile, the global fallback SMTP applies.

## Landing pages

The click target. HTML or Markdown content. Optionally:
- **data capture** (submitted form data as a signal),
- **capture passwords** (only when needed; mind data protection),
- **redirect** after submission (e.g. an awareness page).

Forms are automatically rewritten to the tracking URL on delivery.

## Campaigns

A wizard combines **template + sending profile + landing page + recipient groups** and optionally a **schedule**. After creation, delivery is started via **Send**.

## Tracking & results

- Captured are **opens** (pixel), **clicks** (link/landing) and **form submissions**.
- Per event, **context metadata** is recorded: browser, operating system, device type, referrer, language, screen resolution, UTM parameters, a lightweight **client fingerprint** (hash of stable browser characteristics, without cookie/external script) as well as — with a configured GeoIP database (`GEOIP_DB_PATH`, see Configuration) — the **country** of access.
- Evaluation **per recipient** (sent / opened / clicked / data submitted) plus overall metrics, including **repeat visits** (number of clicks per recipient) and an expandable **session history** (chronological event timeline with browser/OS/device/country/IP).
- **Control center** dashboard with KPI tiles, **risk score (0–100, traffic light)**, **funnel** (send→submit), **timeline** of events, **engagement analytics** (browser/OS/device/countries/language/resolution/UTM), **activity heatmap** (weekday × time of day) as well as a "Failed" list.
- **Human risk management** — a person-level risk ranking across all campaigns: for each person it evaluates click behavior/password entry (behavioral score), **repeat failures** (≥ 2 campaigns with a click/submission raise the score) and **criticality** (weights the result); department and function are carried along.
- **Management report** (consolidated view: metrics, campaign comparison, risk distribution, top failures) with **CSV export**.

## Users & roles

- Roles **Admin**, **Data protection officer** and **User**. Admins manage settings and accounts.
- The **data protection officer** is a control role: they decide on unlock requests and read the audit log, but do not evaluate and do not change settings.
- 2FA status visible per user; admins can reset 2FA.

## Data protection & co-determination

Part of the open core, off by default, enabled under **Settings → Privacy**:

- **Lock on individual-person evaluations** — enforced server-side, including against admins.
- **k-anonymity** for group evaluations (default 5); smaller groups are marked "below threshold" instead of being dropped.
- **Four-eyes unlocking** for temporary exceptions: requested by an admin, decided by the data protection officer, never by oneself.
- **Retention period** with automatic anonymisation; without a period nothing is deleted.
- **Client fingerprinting** only after an explicit admin opt-in (off by default).
- **Templates** for a works agreement and a privacy overview (German/English) in the `compliance/` folder.

In detail: [Data protection & co-determination](/en/reference/datenschutz/)

## Business edition (add-on)

Paid add-on, unlocked via license. Includes:

- **LDAP directory import** of recipients (Settings → LDAP), including an optional CA certificate for LDAPS/StartTLS.
- **Passkeys as 2FA** (WebAuthn) — sign-in via fingerprint, face or security key as a second factor; managed under My Profile, multiple passkeys per account, backup codes for recovery.
- **Azure AD / Entra ID import** of recipients via Microsoft Graph (Settings → Azure AD / Entra ID; import per group via "Entra import").
- **Email upload** (`.eml`) as a template draft.
- **Template library** — ready-made awareness templates (DHL, Amazon, invoice, Microsoft 365, HR, bank, PayPal, LinkedIn, PDF lure, QR campaign) to clone. Each mail template has a **matching landing page** (brand-appropriate sign-in/confirmation page with a form), which can be adopted via "Landing page" as an editable page with capture enabled.
- **AI-assisted creation** — a vendor-neutral AI integration (Settings → AI integration: OpenAI-compatible base URL, model, encrypted API key; works with OpenAI, Azure OpenAI, Anthropic-compatible, Mistral, Groq, OpenRouter or local models such as Ollama/vLLM/LM Studio). In the template and landing-page editors, "Create with AI" generates a subject + HTML, or a landing page with a form, from a short description.
- **Attack types** — additional library templates for **spear phishing** (personally addressed), **whaling** (CEO fraud/management) and **file-based attacks** (with a lure attachment, e.g. "Invoice.pdf").
- **PDF export** of the management report and campaign results. Under Settings → PDF reports you can store a **logo** and **company data** (company name, street, postal code, city, responsible person, department, phone number) that are embedded as a header in all PDF exports.
- **QR-code phishing (quishing)** — the placeholder `{{ qr_code }}` generates, per recipient, a QR code pointing to the tracking link on send.
- **Webhooks** — a JSON POST to configurable URLs on every tracking event (Settings → Webhooks).
- **Password prompt** — on landing pages with capture enabled, submitted form data is stored; password fields are **masked** (never in plain text) and encrypted at rest. Displayed in the campaign results.
- **Business reporting** — **Executive report** (short version as PDF), **trend analysis** (risk/click rate per campaign over time) and **user development** (aggregated per email across all campaigns) on the reports page.
- **Recurring campaigns** — automatic, scheduled re-sending at a fixed interval (menu item "Recurring"): a scheduler creates a new campaign iteration on each due date (recipients from the groups, fresh tracking tokens) and sends it.
- **Multi-stage campaigns** — campaign sequences (menu item "Multi-stage"): multiple stages (each with a template + delay in days from start) to the same recipients; the scheduler sends due stages automatically.
- **Evidence center** — on the reports page, a dedicated PDF document each for: **GDPR** (Art. 32), **NIS2** (Art. 21), **ISO/IEC 27001** (A.6.3), **awareness evidence**, **audit report** (with campaign detail), **certificate** and **training records** (participation per person).

## Enterprise edition (add-on)

Includes all Business features. Additionally:

- **White-label** — custom branding (app name, accent colors, logo) under Settings → White-label; applied app-wide including the login page.
- **Automatic/risk campaigns** — menu item "Auto campaigns": dynamically selects recipients by risk (data submitted / clicked / all) and sends automatically at a fixed interval (dedicated Enterprise scheduler).
- **Enterprise reporting** — on the reports page (section "Training progress & certificate status"): progress per person (first → last risk), certificate status (passed/open) as well as an **individual report** and a **personal certificate** per person as PDF.
- **SIEM export** — Settings → SIEM export: forwards every tracking event asynchronously to a SIEM (**Splunk HEC**, **Elasticsearch**, **Microsoft Sentinel** or generic **JSON**), token stored encrypted, with a test function.
- **SAML Single Sign-On** — Settings → SAML/SSO: sign-in via any SAML 2.0 identity provider (ADFS, Entra ID, Keycloak, Okta …) as an optional second method alongside local login and OIDC. AuthnRequest via HTTP redirect, Assertion Consumer Service via HTTP POST; the assertion must be **signed** (signature, validity and audience checks). SP metadata available as XML.
- **AI scoring** — on the reports page ("AI risk analysis"): an AI-assisted, qualitative assessment of the current human-risk metrics (score distribution, repeat offenders, top-risk persons incl. department/criticality) with prioritized measures. Uses the vendor-neutral AI integration of the Business add-on.
- **Training module (LMS)** — self-hosted **mandatory training with videos** (no third-party CDN): **automatic course assignment** when an awareness threshold is undercut, **tamper-proof progress tracking** (only actually watched playback time counts), **comprehension quiz**, **deadlines** with reminders and overdue escalation, plus **audit-proof training records** (PDF with an integrity hash) that remain accessible even after the license expires. Video storage either in the filesystem or S3-compatible (e.g. self-hosted MinIO). As an alternative to your own video a **SCORM 1.2 package** can be imported (**beta**), which makes purchased training embeddable; progress there comes from the course itself, and the reported working time is shown alongside it in the evidence. Setup: [Training module (LMS)](/en/guides/schulungsmodul/).

See also: [Configuration](/en/guides/konfiguration/) · [Training module (LMS)](/en/guides/schulungsmodul/) · [Roadmap](/en/reference/roadmap/)
