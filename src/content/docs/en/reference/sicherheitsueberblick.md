---
title: "Security overview"
description: "How SentryMail handles credentials, personal data and third-party content — and how those safeguards are verified and documented."
sidebar:
  order: 4
---

:::caution[What this document is — and is not]
This is a **vendor self-assessment, not an independent audit report**. No external penetration testing team and no certification body has reviewed it; there is no attestation and no certificate.

What follows describes how the software is built and how we verify it. Anyone needing an independent assessment — for a supplier review, say — should commission their own test. The core's source is open and can be inspected in full for that purpose.
:::

## The starting point: self-hosted

SentryMail runs entirely on the operator's infrastructure. There is no vendor access, no telemetry and no cloud component the software depends on to work. Campaign data, recipient lists and records never leave the installation.

The only outbound connection is the **licence check** for the paid add-ons: the instance fetches a short-lived, signed lease from the licence server. It is verified locally against the public key — the licence server does not need to be reachable during normal operation. Pure open-core operation needs no such connection at all.

## Sign-in and sessions

| Building block | Implementation |
|---|---|
| Passwords | Argon2id (OWASP recommendation) |
| Session | httpOnly cookie plus a CSRF token using the double-submit pattern |
| Two-factor | Authenticator app or email code; backup codes stored only as hashes, used codes invalidated |
| Two-step login | Between password and second factor sits a short-lived, scoped token that grants no regular API access |
| Optional | OIDC and SAML 2.0 as a second method; passkeys (WebAuthn) as a second factor |

Administrators can make two-factor mandatory — for everyone or for administrators only.

## Handling secrets

**Runtime credentials** — SMTP for sending profiles, LDAP bind, OIDC secret, TOTP secret, tokens for SCIM, the report button, the SMS gateway and the Learning Record Store — are stored **Fernet-encrypted** in the database. The key is derived from `SECRET_KEY`.

They are **never returned in clear text** through the API; the interface only receives a `has_*` flag. A stored secret can be replaced but not read back.

**Operator secrets** (`SECRET_KEY`, database password) come from `.env` or a secrets manager. Both work because the application reads them as environment variables — where those come from is an operations decision. See [Security](/en/reference/sicherheit/).

## Data minimisation and co-determination

**Privacy mode** is not a display setting but a server-side lock — it applies to administrators as well:

- **Individual-person evaluations** are locked. The lock lives at **one** enforcement point that every affected route calls; distributed checks would have drifted apart sooner or later.
- **k-anonymity** for group evaluations: below the threshold (default 5 people) the result reads "below threshold" instead of a breakdown. People are counted, not events.
- **Four-eyes approval** for a time-limited lift: requested by an administrator, decided by a data protection officer. Requester and approver cannot be the same person — the database enforces that.
- **Retention** with automatic **anonymisation** rather than deletion. It cannot be undone; afterwards even a subject access request under Art. 15 GDPR can no longer be answered — that is the purpose of the rule, not an omission.
- **Client fingerprinting** ships **off** and requires an explicit release.

Templates for a works agreement and a privacy overview are included with the source (`compliance/`, German and English). They describe what the software enforces — they are not legal advice.

## Third-party content

The most delicate part of the application: it processes material attackers sent, and content the operator purchased.

### Reported phishing mails

The original file is kept but never executed or rendered. Addresses it contains are stored and displayed **defanged** (`hxxp://`, `[.]`) and are never linked — nobody reviewing a report should land on the attacker's site through a misclick.

### Attachment scanning

Optionally against your own **ClamAV** and against the operator's **YARA** rules, plus a match against your own **MISP** instance. Throughout:

> **Unreachable means "not scanned" — never "clean".** A false all-clear would be the most dangerous message these modules could produce.

We deliberately do **not** ship YARA rules: a rule set is a substantive statement about what counts as suspicious. Widely used free collections also carry non-commercial licences.

### SCORM training (beta)

A SCORM package is third-party HTML and JavaScript, often purchased. Two decisions bound that:

- **No path from the archive ever becomes a file path.** The filenames from the ZIP end up as database rows; every file is stored under a server-generated, content-addressed key. A "zip slip" is therefore not defended against but structurally impossible. Manifests are parsed with `defusedxml`; executables, zip bombs and oversized packages are refused.
- **The course runs in a sandboxed frame without `allow-same-origin`.** It gets its own opaque origin and cannot reach the session of the person being trained. It reports progress via `postMessage`; only the application forwards it with the session, so no secret sits inside the course content.

The price: packages that insist on `localStorage` do not run. Access to the session would be the more expensive loss.

### USB simulation

**No executable files are produced** — no macro, no script, no shortcut that launches a program. What is generated is an HTML file that sends the browser to the awareness page. Someone who builds a file that runs code on other people's machines has written malware, however good the intent.

Each medium carries an identifier for the **location**, not for a person. No personal data arises there.

## Reaching into other systems

Two features act beyond the installation itself. Both are deliberately constrained:

**Mass quarantine** moves a confirmed phishing wave out of every mailbox into a quarantine folder. The search uses the **Message-ID only** — a wave's subject also appears in legitimate replies to it. Messages are **only moved, never deleted**. A dry run is structurally mandatory: execution refers to a stored preview record, without which nothing can be triggered at all. Both steps are written to the audit log.

**Simulations by SMS and chat** go only to **company** devices unless something else has been explicitly released. Releasing private devices is possible, off by default, and logged.

## Records

Reports and certificates are produced as **PDF/A-3b** with embedded fonts. Optionally they are **digitally signed**; the instance generates the certificate itself.

> Self-signed means **unaltered, not attested**. A reader shows "signature validity unknown" because it does not know the issuer. If you need a chain of trust, distribute the certificate as trusted or use one from your own PKI.

Training records additionally carry an **integrity hash** over assignment, person, course version, timestamp and a server secret — later changes to the record become detectable.

## How it is verified

| Measure | Scope |
|---|---|
| Automated tests | Core and both add-ons, mandatory on every PR |
| Frontend type check and build | mandatory on every PR |
| **CodeQL** (GitHub code scanning) | mandatory on every PR; a finding blocks the merge |
| Signed commits, DCO | mandatory |
| Changes via pull request | direct pushes to the main branch are blocked |

In addition, changes are reviewed with a security focus — particularly at the points named above, where third-party content or third-party systems are involved.

## Known limits

Honesty here is more useful than a seamless success story:

- **No independent penetration test.** See the notice at the top.
- **The security of the installation is the operator's responsibility.** TLS, network segmentation, OS hardening and protecting `SECRET_KEY` and the database are not part of the software.
- **Losing `SECRET_KEY` makes every encrypted credential unreadable.** A database backup without it is only half a restore.
- **SCORM progress is not tamper-proof.** What "passed" means is decided by the course, which runs in the person's browser. The server-merged video coverage is the more solid source; the working time reported by the course is shown alongside it in the record.
- **The mail report button's token sits on every workstation.** That is unavoidable with an accountless reporting path. It is bounded by being switchable, by allowed sender domains and by a per-person hourly limit; a new token invalidates the old one immediately.
- **Outdated ClamAV signatures are worse than none.** In installations without internet access, either point it at an internal mirror or leave the check off.

## Reporting a vulnerability

Please do **not** report security findings through a public issue, but to the address in [SECURITY.md](https://github.com/securebits-cyber/SentryMail/blob/main/SECURITY.md). It also states the supported versions and the disclosure process.

We ask for coordinated disclosure and will respond before any details are published.

---

*See also: [Security](/en/reference/sicherheit/) · [Data protection & co-determination](/en/reference/datenschutz/) · [Architecture](/en/reference/architektur/)*
