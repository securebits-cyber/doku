---
title: "FAQ"
description: "Frequently asked questions about SentryMail."
sidebar:
  order: 7
---

Questions grouped by topic; click to expand.

## Basics

<details>
<summary>What is SentryMail?</summary>

A self-hosted open-core platform for phishing awareness: plan, send and evaluate simulated phishing campaigns per recipient. Depending on the licence it adds training, the analysis of reported mails, and simulations over SMS, chat or planted media.

</details>

<details>
<summary>Does the tool make me "compliant"?</summary>

No — it *supports* awareness measures and their evidence. See [Compliance mapping](/en/reference/compliance/).

</details>

## Data protection and co-determination

<details>
<summary>Are real passwords or form data stored?</summary>

By default **no** — only the *signal* is recorded that someone opened, clicked or submitted a form. Optionally, "data capture" (and separately "passwords") can be enabled per landing page; this is deliberately opt-in and should only be used after internal approval (data protection, possibly the works council). See [Security](/en/reference/sicherheit/).

</details>

<details>
<summary>Can the evaluation of individual people be switched off?</summary>

Yes. In **privacy mode** individual-person evaluations are locked; results only appear once a minimum number of people are affected (k-anonymity). Lifting the lock requires the four-eyes procedure with a data protection officer. See [Data protection & co-determination](/en/reference/datenschutz/).

</details>

## Sending and tracking

<details>
<summary>Why don't I see opens or clicks even though it was sent?</summary>

- Many mail clients block the open pixel → opens are unreliable, **clicks** are the better signal.
- Recipients must be able to **reach** the address set in `APP_DOMAIN`. For internal or VPN-only domains, external recipients register no events.

</details>

<details>
<summary>Does the app have to be publicly reachable?</summary>

For tracking, recipients must reach the tracking URL (`APP_DOMAIN`). The dashboard itself can stay internal or VPN-only.

</details>

<details>
<summary>Which SMTP providers are supported?</summary>

Any (IONOS, Hetzner, Mailgun, SES, Postmark, your own mail server …). Host, port, TLS mode and credentials are configurable; no provider is hardwired.

</details>

<details>
<summary>Can simulations go out by SMS or chat as well?</summary>

Yes, with the Enterprise add-on: SMS through your own gateway, Matrix, Nextcloud Talk, and planted media (USB drop). Only company devices are used unless something else has been released. See [Other channels](/en/reference/weitere-kanaele/).

</details>

<details>
<summary>How do I start a test campaign?</summary>

Create a campaign in the wizard (template, optionally a sending profile and landing page, plus the groups) and start it via **Send** — when in doubt, with a small test group first.

</details>

<details>
<summary>Where do I see who clicked?</summary>

On the campaign's results page: overall metrics **and** a per-recipient table (sent, opened, clicked, data submitted), plus a CSV export. In privacy mode the per-person view stays locked.

</details>

## Recipients and templates

<details>
<summary>How do I import recipients?</summary>

In a group: manually, via CSV (paste or file) or via LDAP import. The Business add-on adds Azure AD / Entra ID and SCIM — with SCIM the identity provider maintains the groups, which are then read-only in the dashboard.

</details>

<details>
<summary>Can I use a real email as a template?</summary>

Yes — import an `.eml` under **Templates → Upload email**. Subject, HTML/text and **attachments** are taken over.

</details>

## Sign-in and accounts

<details>
<summary>Can I combine OIDC and local login?</summary>

Yes. Local login is the primary method; OIDC/SSO is an optional second method. Without an OIDC configuration the app runs fully without an identity provider.

</details>

<details>
<summary>How do I set up or enforce two-factor authentication?</summary>

Users enable 2FA under **My Profile** (authenticator app or email code, plus backup codes). Admins can make 2FA mandatory under **Settings → Security** — for everyone or for admins only — and reset it for individual users.

</details>
