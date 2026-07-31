---
title: "Other channels: SMS, chat, USB"
description: "Simulations beyond email: by SMS through your own gateway, via Matrix and Nextcloud Talk, and as a planted USB drive."
sidebar:
  label: "Other channels"
  order: 6
---

Phishing has long stopped being an email-only affair. Simulating email alone drills exactly the route people already watch — and leaves out the one they actually fall for. SentryMail can therefore run simulations by **SMS**, via **Matrix**, via **Nextcloud Talk** and as **planted media**.

| Channel | Edition |
|---|---|
| SMS, Matrix, Nextcloud Talk, USB drop | **Enterprise** |

Tracking, landing page and reporting are the same as for email. Only the delivery differs — and the text, because an SMS is not a rebuilt sender layout but one sentence with a link.

---

## Company or private

> **Only company devices are used, unless something else has been released.**

A simulation to the company phone is a workplace matter. One to a private number is not — that needs its own basis. Every entry in the address directory therefore records whether the device is a company one; private entries are skipped and **named** in the result rather than silently left out.

Releasing private devices can be switched on, but it is off by default and is written to the audit log. Without that boundary the product would silently settle an employment-law question in the operator's favour.

---

## SMS: bring your own gateway

**No provider is hardwired.** Baking an SMS service into the code forces every operator into that provider's contract. Instead you describe a **generic HTTP gateway** under *Settings → Delivery channels → SMS*:

| Field | Meaning |
|---|---|
| Address, method | Where and how (POST/GET) |
| Authentication | none, basic, bearer, or a custom header |
| Body format | `json` or `form` |
| Body template | Your provider's body with the placeholders `{to}` and `{text}` |

Example for a provider expecting JSON:

```json
{"to": "{to}", "message": "{text}", "from": "Service"}
```

That makes any gateway fit — including one in your own building attached to a GSM modem. Values are encoded **after** substitution: a message containing quotation marks will not break your provider's JSON.

Phone numbers are expected in **E.164** (`+4915112345678`). Without that check, typos reach the gateway and cost money under some contracts without anyone noticing.

---

## Matrix and Nextcloud Talk

Both are services many organisations already run themselves — a simulation over them stays on your own network instead of going through a third-party messenger.

- **Matrix**: the homeserver address and an access token for a bot account. A **separate room** is created per recipient rather than writing into an existing conversation: a simulation should not end up in a thread where nobody can tell practice from the real thing any more.
- **Nextcloud Talk**: the Nextcloud address and an account with Talk permissions. The OCS API requires the header `OCS-APIRequest: true` — it is set automatically; its absence is otherwise the most common setup error.

---

## USB drop

A medium is planted — car park, reception, meeting room — and what is measured is whether someone plugs it in and opens the file. The classic route into networks that are well defended against email.

### No executable files are produced

No macro, no script, no shortcut that launches a program. What is generated is a plain **HTML file** that sends the browser to the awareness page. That is entirely sufficient for the measurement — and anything beyond it would be a tool you do not build merely because you could: someone who builds a file that runs code on other people's machines has written malware, however good the intent.

### The debrief page carries no form

Opening the file lands on the **campaign's landing page**. The library ships three ready-made pages for this (category *USB drop*): a detailed debrief, a short note, and a version with a reporting route.

None of them has input fields — unlike the sign-in pages that accompany the mail templates. Three reasons:

1. **Everything is already measured.** The finding is "medium plugged in and file opened". A sign-in form afterwards changes nothing about the result.
2. **There would be nobody the password belongs to.** The medium only knows the location. A submitted password would sit in the database as a real secret with nobody to attribute it to — harm without insight.
3. **The moment is the teachable one.** Somebody who has just realised they plugged in a stranger's stick is receptive. Asking them for a password instead squanders that.

Anyone who still wants to measure the escalation clones one of the library's sign-in pages and sets it as the campaign's landing page — deliberately, and with the consequence that a password is captured which cannot be attributed to anyone.

### A USB simulation knows nobody

Each medium carries a token for the **location**, not for a person. Who picked up the stick is something the software does not know. No personal data arises here at all, and the individual-person lock of privacy mode has nothing to bite on.

That is not incidental — it is why this simulation is feasible even in organisations with strong co-determination.

### Reported separately

Reports and the control centre keep USB drops **apart from mail campaigns**. Counted together they would produce figures that mean nothing: a location is not a recipient, a medium is not *delivered*, and two media nobody opened drag down the open rate of a mail campaign they have nothing to do with.

Concretely:

- **Totals, rates and the risk distribution** apply to mail campaigns.
- The **control centre** shows drops in their own block: campaigns, media planted, and how many of them were opened.
- Every **campaign row in the report** states its kind.
- Drops stay out of **human risk management** and the *failed* list entirely.

:::note[The last point follows from the section above]
Both of those evaluations are person-level. A medium knows nobody — were it listed there, the evaluation would be asserting a person who does not exist, and the location would appear where a name normally stands.
:::

A drop campaign is recognised by its recipient rows, not by the channel: their addresses end in `.invalid` (reserved by RFC 2606 and never deliverable), so no mailbox stands behind them. The channel belongs to the Enterprise add-on, and reporting in the core must not depend on it.

:::caution[Anonymised campaigns are not media]
The [retention job](/en/reference/datenschutz/) also rewrites addresses to `.invalid`. But a person **was** there, and their statistics belong in the mail figures. A row therefore counts as a medium only when it is not anonymised — otherwise the metrics of anonymised campaigns would vanish from reporting without anybody having deleted anything.
:::

### How it runs

All in the campaign wizard, without changing pages:

1. **Campaigns → New campaign**, give it a name and pick `USB drop` as the **channel**.
2. Whatever the channel does not need disables itself: **template**, **sending profile**, **recipient groups** and **scheduling**. Nothing is sent, and the locations take the place of the recipients.
3. The **landing page** stays selectable — it is the click target when somebody opens the file. Without it the find leads nowhere.
4. After creation the **locations** appear right below, one per line.
5. Download the ZIP: one folder per medium containing exactly one file, plus a readme mapping folder → location.
6. Write the sticks and plant them. The report shows per location whether it was opened.

The same step is reachable later under *Other channels*, which also holds the report on existing media.

The locations belong in an agreement with the employee representation beforehand; break rooms and personal workstations are sensibly excluded.

---

*See also: [Data protection & co-determination](/en/reference/datenschutz/) · [Features](/en/reference/funktionen/) · [Reporting and analysis](/en/reference/meldung-analyse/)*
