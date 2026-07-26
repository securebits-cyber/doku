---
title: "Training module (LMS)"
description: "Set up self-hosted mandatory video training: video storage, automatic assignment, comprehension quizzes, deadlines and audit-proof certificates."
sidebar:
  order: 4
---

The **training module (LMS – Learning Management System)** provides the logical follow-up to a phishing simulation: anyone who fails is automatically assigned **self-hosted mandatory training with videos** — no third-party CDN, with an audit-proof record.

:::note[Enterprise add-on]
The LMS is part of the **Enterprise add-on** and unlocked via license. Without a valid Enterprise license the area is locked. The open-core and the Business add-on do not include the module — see [Features](/en/reference/funktionen/).
:::

## What the LMS does

- **Video-based mandatory training**, fully **self-hosted** — the videos live in your own storage, no external CDN is contacted.
- **Automatic course assignment** when an **awareness threshold** (human-risk score) is undercut — risky people are enrolled without manual effort.
- **Tamper-proof progress tracking**: only the **actually watched playback time** counts; skipping ahead does not satisfy the requirement.
- **Comprehension quiz** per course as a final check.
- **Deadlines with reminders and overdue escalation**.
- **Audit-proof training records** as a PDF with an integrity hash; they remain accessible **even after the license expires**.
- **Completion reporting** with **CSV export**, plus integration into the enterprise reporting (training progress, certificate status) on the reports page.

## Configure video storage (`.env`)

Where training videos are stored is an operator value and is set in the `.env` — analogous to [GeoIP](/en/guides/konfiguration/#geoip--country-statistics-optional). Two backends are available: the local filesystem (default) or an S3-compatible object store (e.g. a **self-hosted MinIO**).

```ini title=".env — local filesystem"
# Storage backend: filesystem (default) or s3
LMS_STORAGE_BACKEND=filesystem

# Location of the video files (mounted as a volume into the container)
LMS_MEDIA_DIR=/data/lms-media
```

```ini title=".env — S3-compatible (e.g. MinIO)"
LMS_STORAGE_BACKEND=s3

# S3 access; the specific LMS_S3_* keys (endpoint, bucket, access/secret key,
# region) follow the standard S3 scheme — take the names and order from the
# .env.example of the respective release.
LMS_S3_ENDPOINT=https://minio.example.internal
LMS_S3_BUCKET=sentrymail-lms
LMS_S3_ACCESS_KEY=…
LMS_S3_SECRET_KEY=…
```

- With **`filesystem`**, `LMS_MEDIA_DIR` must be mounted as a persistent volume so uploaded videos survive a stack update (see [Installation](/en/guides/installation/)).
- With **`s3`**, storage still stays in your own hands when using a self-hosted MinIO or an internal object store — the self-hosting promise is preserved.
- Credentials live exclusively in the `.env`; they are not stored in the database.

## Provide courses and videos

In the dashboard, an admin manages training in the **training area** (Enterprise). A typical flow:

1. **Create a course** — set title, description and language.
2. **Upload a video** — the file lands in the configured storage backend (filesystem or S3); no external service is involved. Alternatively import a **SCORM 1.2 package** (beta, see below).
3. **Add a comprehension quiz** — define questions with answer options and a pass mark.
4. **Set pass rules** — required watched share of the video plus quiz result.

Only once the required playback time has been **actually watched** and the quiz passed does the course count as completed.

## Embedding SCORM 1.2 packages (beta)

:::caution[Beta]
The feature works but has not been tried against a breadth of real authoring tools. Test it with your own package before using it for mandatory training.
:::

Instead of your own video, a module can hold a **SCORM 1.2 package** — a ZIP archive with an `imsmanifest.xml`. This lets you embed purchased or existing training instead of producing it yourself.

**A module is either a video or a SCORM package.** Both at once would mean two sources of progress for the same completion — which one counts could not be justified in an audit.

The import refuses: SCORM 2004 (different runtime data model), executables inside the package, archives that expand disproportionately, packages over 500 MB or 5000 files, and packages without a present entry point. Tolerated are the liberties real packages take: missing XML namespace, `xml:base`, nested organisation trees, a wrapping folder inside the ZIP.

### Where the course content runs

The course runs in a sandboxed frame **without `allow-same-origin`**. Course content is third-party JavaScript; if it came from the same origin as SentryMail it could read the CSRF cookie and make arbitrary calls with the session of the person being trained.

The price: packages that insist on `localStorage` do not run in it — access throws in an opaque origin.

### What the reported progress is worth

:::note
The course reports its own progress. That is not tamper-proof and cannot be with SCORM: what "passed" means is decided by the content, which runs in the person's browser.
:::

For video the server merges the segments actually watched — that remains the more solid source and is not replaced by SCORM. For SCORM modules the **working time** reported by the course is carried along and shown alongside it in the evidence, so a "passed after four seconds" stands out in an audit.

## Automatic risk-based assignment

The LMS ties into **human risk management** ([Features → Tracking & results](/en/reference/funktionen/#tracking--results)):

- An **awareness threshold** defines the risk score at which a person is enrolled.
- If a person's score drops below that value after a campaign (e.g. a click or data entry), the associated course is **assigned automatically**.
- Alternatively, courses can be assigned **manually** to individuals or groups.

## Deadlines, reminders, escalation

- Each assignment has a **deadline** for completion.
- **Reminders** are sent before the deadline.
- Once exceeded, an **overdue escalation** kicks in (e.g. a notice to responsible parties); overdue training is visible in the reporting.

## xAPI export to a Learning Record Store

Anyone already running an LRS does not want awareness training evidenced separately from the rest of their training records. Under **Settings → xAPI export** you enter the address of the xAPI endpoint (1.0.3) plus user/password or a token.

Reported are **assignment**, **progress** and **completion**, each with course, module and the course version — so the record in the LRS names the same revision as the one in SentryMail.

> **Only training events are exported.** Phishing simulation events stay out of it. Sending a "clicked" to a foreign store would be exactly the individual-person evaluation privacy mode exists to prevent — and the LRS knows nothing of its locks.

### Who appears in the LRS

| Identifier | Meaning |
|---|---|
| **Pseudonym** (default) | An instance-wide stable identifier that cannot be reversed. The LRS can join a person's history without knowing who that person is |
| **Email address** | Names and addresses leave the instance |

The more restrained setting is the default: an LRS is a **further recipient of personal data**. Anyone who needs the real names there switches it on deliberately — the change is written to the audit log, belongs in an agreement with the employee representation, and into the processing register.

### Delivery

Statements are **stored first and delivered afterwards**. An LRS is a system of record; a statement lost to a network error would be missing there permanently. If delivery fails the scheduler retries — up to five times, after which the statement stays visibly parked rather than letting the queue grow silently. The statement UUID stays the same across all attempts so the LRS recognises a retry and creates no duplicate.

Pending and parked statements are shown on the settings page; **Send now** triggers delivery by hand and retries parked ones too — the usual case after corrected credentials.

Whatever happened **before** you switched it on is not sent retrospectively: a queue filling up while the export is off would ship the entire past to the LRS the moment it is enabled, and nobody expects that.

## Certificates & records

- After passing a course, the LMS generates an **audit-proof training record** as a PDF with an **integrity hash** to prevent forgery.
- Logo and company data from **Settings → PDF reports** are embedded as a header (see [Configuration → PDF reports](/en/guides/konfiguration/#pdf-reports-logo-and-company-data-business)).
- Certificates and training records remain accessible **even after the Enterprise license expires** — auditability is not lost.
- Progress and certificate status appear in the **enterprise reporting** and can be exported as **CSV**; the **evidence center** provides the matching compliance documents ([Features](/en/reference/funktionen/#business-edition-add-on)).

## Relevance for NIS2 / BSI

Documented, mandatory training with evidence directly addresses the requirements of **NIS2 Art. 21** (cyber hygiene and training) and the BSI building block **ORP.3 "Awareness and training"**. The LMS thus closes the loop "simulate → measure → train → prove" — details under [Compliance mapping](/en/reference/compliance/).

See also: [Features](/en/reference/funktionen/) · [Configuration](/en/guides/konfiguration/) · [Roadmap](/en/reference/roadmap/)
