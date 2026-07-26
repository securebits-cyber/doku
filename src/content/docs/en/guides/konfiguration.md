---
title: "Configuration"
description: "Set up every option: sign-in, SSO, SMTP, directories, add-on features and interfaces."
sidebar:
  order: 2
---
Most configuration is done via the dashboard under **Settings** (admin-only). Operator secrets (app `SECRET_KEY`, DB password) stay in the `.env`.

## Core

Usable without a licence.


### Sign-in

- **Local login** (email/password) is the primary method. Accounts are created by admins (no self-signup). Passwords: Argon2id.
- **OIDC / Single Sign-On** is an optional second method for any provider (Authentik, Keycloak, Entra ID, Okta, …). Configuration in the dashboard: issuer URL, client ID, client secret, redirect URI. Without an active OIDC config, the app runs fully without an IdP.
- **SAML SSO** (Enterprise add-on) is another optional second method. Configured under **Settings → SAML/SSO**: IdP entity ID, IdP SSO URL (HTTP redirect), IdP signing certificate (X.509), SP entity ID, SP ACS URL and optional attribute mapping (email/display name; empty = NameID as email). The assertion must be signed; the app validates signature, validity period and audience. SP metadata at `/auth/saml/metadata`.

### Two-factor authentication (2FA)

- Methods: **authenticator app (TOTP)**, **email one-time code** or — with a Business license — **passkey (WebAuthn)** — selectable per user.
- **Passkeys** (Business): registration and sign-in via WebAuthn (fingerprint, face or security key). Multiple passkeys per account possible; managed under **My Profile**. The RP ID is derived from `APP_DOMAIN`; the origin can be overridden via `WEBAUTHN_ORIGIN` (default `https://{APP_DOMAIN}`). Backup codes serve as recovery in case of device loss.
- **Backup codes** at setup (single-use).
- **Enforceable** by admins under **Settings → Security**: off / admins only / everyone. Affected users are guided through setup on their next login.
- Admins can reset a user's 2FA (device loss).
- Secrets are stored encrypted (Fernet), backup codes only as a hash.

### SMTP

- **Global fallback SMTP** under **Settings → SMTP** (applies when a campaign uses no dedicated sending profile).
- **Sending profiles** bundle SMTP credentials and sender identity per campaign.
- Provider-agnostic (IONOS, Hetzner, Mailgun, SES, Postmark, your own mail server …). Passwords encrypted at rest; the API never returns them (only a `has_*` flag).

### GeoIP / country statistics (optional)

For the country breakdown in the dashboard, the operator stores in the `.env` the path to a **local country database in MMDB format** (`GEOIP_DB_PATH`), e.g. MaxMind GeoLite2-Country or DB-IP Country Lite. The lookup runs entirely locally — **no external service** is ever called. Without a configured file, the country statistics simply stay empty; private/internal IP addresses are never resolved.

```ini title=".env"
GEOIP_DB_PATH=/path/to/GeoLite2-Country.mmdb
```

### Activity / audit log

Under **Settings → Activity → Audit Events**: sign-in events (success/failure/blocked) and system changes (users, settings, 2FA) — with timestamp and IP.

See also: [Features](/en/reference/funktionen/)

## Business add-on

Visible and usable only with a valid Business licence.


### LDAP

Recipient import from a directory service (Active Directory / OpenLDAP) under **Settings → LDAP**: host/port, LDAPS/StartTLS, bind DN + password, base DN, user filter, attribute mapping. Then import under **Groups → LDAP import**.

For **LDAPS/StartTLS**, a **CA/server certificate** (PEM) can optionally be provided. If set, the server certificate is verified (recommended for internal or self-signed CAs); without a certificate no validation is performed.

### Importing recipients from Entra ID

For organisations on Microsoft 365 that do not want to set up SCIM.

1. Create an app registration in the **Microsoft Entra admin center**.
2. Under *API permissions* add the **application permissions** `User.Read.All` and `GroupMember.Read.All`, then **grant admin consent**. Without that consent Graph returns empty results rather than an error — the most common stumbling block.
3. Under *Certificates & secrets* create a **client secret**.
4. In SentryMail under **Settings → Azure AD / Entra ID**, enter the directory (tenant) ID, application (client) ID and the secret.
5. Import per group under **Groups → Entra import**.

The secret is stored encrypted and never returned through the API.

### Directory provisioning: SCIM 2.0

Rather than importing recipients, you can let the directory **maintain** them. The identity provider creates users and groups, updates them and removes them again.

1. Under **Settings → SCIM**, enable access and **create a token** — it is shown only once.
2. In the identity provider, create a SCIM application with:
   - **Base URL:** `https://{APP_DOMAIN}/scim/v2`
   - **Authentication:** OAuth bearer token (the token you created)
3. Check the attribute mapping — `userName` (email), `name.givenName` and `name.familyName` are required.

Tested with Entra ID, Okta and Keycloak; the interface follows RFC 7644, so other providers work accordingly.

:::note
Groups managed this way are **read-only** in the dashboard. Two sources for the same list would overwrite each other, and which one wins would not be predictable.
:::

Whether the connection works shows in the **Last access** field on the same page. During setup that is the only reliable feedback.

### AI integration

For AI-assisted creation of templates and landing pages. **No provider is hardwired** — the application talks to a configurable, OpenAI-compatible chat completions endpoint.

Under **Settings → AI integration**:

| Field | Example |
|---|---|
| Base URL | `https://api.openai.com/v1` |
| Model | `gpt-4o-mini` |
| API key | stored encrypted |

The same three fields cover Azure OpenAI, Mistral, Groq, OpenRouter — and **local models**: Ollama (`http://ollama:11434/v1`), vLLM or LM Studio. The feature can therefore run entirely without an external service.

:::caution
A public provider sees the input. Anyone generating templates containing internal names, real people or customer data passes those on — a local model is the right choice for such cases.
:::

### Webhooks

Every tracking event triggers a JSON POST to the configured addresses. Add them under **Settings → Webhooks**; several targets are possible, each individually switchable.

```json title="Payload"
{
  "event": "clicked",
  "recipient_email": "person@company.example",
  "campaign_id": "…",
  "campaign_name": "Invoice Q3",
  "occurred_at": "2026-07-26T09:14:22+00:00",
  "ip": "203.0.113.10",
  "user_agent": "Mozilla/5.0 …"
}
```

`event` is `sent`, `opened`, `clicked` or `submitted`. Delivery is asynchronous — a slow or failed receiver does not hold up tracking and loses no event.

:::note
The payload contains the affected person's **email address and IP**. A webhook is therefore a further recipient of personal data and belongs in your processing register. In privacy mode the lock on individual-person evaluations does **not** apply to webhooks — they are a deliberately configured outlet.
:::

### PDF reports: logo and company data

Under **Settings → PDF reports** you can upload a logo (PNG/JPG/SVG, no GIF, max. 512 KB) that is embedded at the top of the exported **PDF reports**. This feature is part of the **Business add-on**: without a valid Business license the page is locked. The logo is stored in the database and can be replaced or removed at any time.

On the same page you can also maintain **company data**: **company name, street, postal code, city, responsible person, department, phone number**. All fields are optional. Filled-in fields appear as a header block below the logo in **all PDF exports** — management, executive and compliance reports, training records, certificates and campaign results, as well as the individual reports and certificates of the Enterprise edition. Clearing the fields removes the block from the reports again.

### PDF signature

Proves that a record has not been altered since it was created. Under **Settings → PDF signature**:

1. Enter the name to appear in the certificate (usually the company) and **create a certificate**.
2. Optionally enter a reason and location — they appear in the signature field.
3. Switch on **Sign records**. Without a certificate the setting cannot be enabled.

From then on **every** generated PDF is signed: reports, records, certificates, including those of the Enterprise add-on.

:::caution[Self-signed means unaltered, not attested]
The instance generates the certificate itself. A PDF reader therefore shows "signature validity unknown" because it does not know the issuer — the signature proves the record is unaltered, not that a recognised authority attested it.

If you need a chain of trust, distribute the **fingerprint** shown on the page along with the certificate as trusted, or use one from your own PKI.
:::

Two cases deliberately produce **no** signature rather than a bad one: an expired certificate and an error while signing. The record is then delivered unsigned — better than an abort mid-download.

### Mail report button

Employees report suspicious mails straight from their mail client. Under **Settings → Mail report button**:

1. **Enable** the reporting path and create a **report token** — it is shown only once.
2. Enter the **allowed sender domains**. Empty means every address is accepted.
3. For Outlook, **download the ready-made manifest** and distribute it via the Microsoft 365 admin center or Exchange administration. For Thunderbird, roll out the MailExtension and enter address and token there.

Whether the chain works shows in the **Last report** field. Rollout routes and client limitations are described under [Reporting & analysis](/en/reference/meldung-analyse/).

:::note
The employees doing the reporting have no SentryMail account — so the **instance** authenticates with a token rather than the person with a password. That token therefore sits on every workstation. It is bounded by being switchable, by the allowed domains and by a per-person hourly limit; a new token invalidates the old one immediately.
:::

## Enterprise add-on

Includes all Business features.


### Training module / LMS video storage

Where training videos are stored is an operator value in the `.env`: `LMS_STORAGE_BACKEND` (`filesystem` or `s3`), `LMS_MEDIA_DIR` (for the filesystem) or the `LMS_S3_*` keys (for S3-compatible storage such as self-hosted MinIO). Setup, courses, assignment and certificates are covered in a dedicated guide: [Training module (LMS)](/en/guides/schulungsmodul/).

### SIEM export

Forwards every tracking event to a SIEM. Under **Settings → SIEM export**, enter format, endpoint and token:

| Format | Endpoint | Token |
|---|---|---|
| **Splunk HEC** | `https://splunk.company.example:8088/services/collector` | HEC token; optionally an index |
| **Elasticsearch** | `https://elastic.company.example/index/_doc` | API key |
| **Microsoft Sentinel** | URL of the data collection rule | bearer token |
| **Generic JSON** | any | optional bearer token |

The **Test connection** button sends a real test event — only its arrival proves that token and endpoint are correct.

The training module additionally writes structured `lms.*` events; `lms.progress.anomaly` and `lms.stream.denied` are deliberately classified as *warning*, because repeated occurrences per person suggest an attempt at manipulation.

### White-label

Under **Settings → White-label**: app name, accent colour and logo (light and dark). The changes apply app-wide including the sign-in page.

A campaign's **sender name** is independent of this — it is the campaign's name, never the product or profile name. A simulation carrying "SentryMail" as the sender measures nothing.

### Attachment scanning and threat intel

ClamAV as a compose profile, YARA with your own rules and matching against your own MISP instance are described, including failure behaviour, under [Reporting & analysis](/en/reference/meldung-analyse/).

### Other delivery channels

SMS through your own gateway, Matrix, Nextcloud Talk and the USB simulation: see [Other channels](/en/reference/weitere-kanaele/).

See also: [Features](/en/reference/funktionen/) · [Training module (LMS)](/en/guides/schulungsmodul/)
