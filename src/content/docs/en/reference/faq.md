---
title: "FAQ"
description: "Frequently asked questions about SentryMail."
sidebar:
  order: 6
---

**What is SentryMail?**
A self-hosted open-core platform for phishing awareness: plan, send and evaluate simulated phishing campaigns per recipient.

**Are real passwords or form data stored?**
By default **no** — only the *signal* is recorded that someone opened/clicked/submitted a form. Optionally, "data capture" (and separately "passwords") can be enabled per landing page; this is deliberately opt-in and should only be used after internal approval (data protection, possibly works council). See [Security](/en/reference/sicherheit/).

**Why don't I see opens/clicks even though it was sent?**
- Many mail clients block the open pixel → opens are unreliable, **clicks** are the better signal.
- Recipients must be able to **reach** the address set in `APP_DOMAIN`. For internal/VPN-only domains, external recipients register no events.

**Does the app have to be publicly reachable?**
For tracking, recipients must reach the tracking URL (`APP_DOMAIN`). The dashboard itself can stay internal/VPN-only.

**Which SMTP providers are supported?**
Any (IONOS, Hetzner, Mailgun, SES, Postmark, your own mail server …). Host/port/TLS/credentials are configurable.

**Can I combine OIDC and local login?**
Yes. Local login is the primary method; OIDC/SSO is an optional second method. Without an OIDC config, the app runs fully without an IdP.

**How do I set up / enforce 2FA?**
Users enable 2FA under **My Profile** (authenticator app or email code, plus backup codes). Admins can make 2FA mandatory under **Settings → Security** (for everyone or admins only) and reset it for individual users.

**How do I import recipients?**
In a group: manually, via CSV (paste/file) or via LDAP import (if configured).

**Can I use a real email as a template?**
Yes — import an `.eml` under **Templates → Upload email**. Subject, HTML/text and **attachments** are taken over.

**How do I start a test campaign?**
Create a campaign in the wizard (template + optional sending profile/landing page + groups) and start it via **Send** — when in doubt, with a small test group.

**Where do I see who clicked?**
On the campaign's results page: overall metrics **and** a per-recipient table (sent / opened / clicked / data submitted), plus CSV export.

**Does the tool make me "compliant"?**
No — it *supports* awareness measures and their evidence. See [NIS2 & BSI](/en/reference/nis2-und-bsi/).
