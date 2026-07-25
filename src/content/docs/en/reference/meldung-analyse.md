---
title: "Reporting & analysis"
description: "Report suspicious emails, analyse them automatically and group them into waves."
sidebar:
  order: 5
---

Employees report a suspicious mail, SentryMail evaluates it automatically and groups similar reports into waves. This turns the product from an awareness tool into a supplier for incident handling under NIS2 Art. 21(2)(b).

| Building block | Edition |
|---|---|
| Reporting path (intake, storage, deduplication) | **Business** |
| Automatic analysis, waves, attachment scanning | **Enterprise** |

---

## Reporting path

There are two routes into the same store:

- **Mail report button** in the mail client — the route for employees. One click, done.
- **`.eml` upload** under *Reported mails* — for signed-in users, for instance when a report arrives by a detour.

Only the source differs, not the data model.

### The button reports without an account

The employees doing the reporting generally have **no** SentryMail account — they are recipients, not users. A login in the add-in would require an account for every reporter that does not exist, and nobody reports if they have to sign in first.

So the **instance** authenticates with a report token rather than the person with a password. You set this up under *Settings → Mail report button*. The token therefore sits on every workstation — unavoidable with an accountless reporting path, and bounded in three places:

| Bound | Effect |
|---|---|
| The path can be switched off | Without activation the path is closed even when a token is stored |
| Allowed sender domains | A leaked token cannot attribute reports to foreign addresses |
| Reports per person and hour | A leaked token cannot fill up the store |

A new token makes the old one worthless immediately. Whether the chain works shows in the *Last report* field on the same page — during setup the only reliable confirmation.

### Three clients

| Client | Certificate | Requirement |
|---|---|---|
| **Thunderbird** (MailExtension) | none | — |
| **Outlook** (Office web add-in) | none | Exchange or Microsoft 365 |
| **Outlook** (VSTO) | codesigning, self-signed for testing | plain IMAP/POP accounts |

For Outlook the **web add-in is the default route**: SentryMail serves the ready-made manifest with address and token already filled in, and you distribute it via the Microsoft 365 admin center or Exchange administration. The VSTO add-in is the fallback for mailboxes without Exchange, where web add-ins do not run — that one alone needs a certificate.

Thunderbird needs **no** certificate: a MailExtension is an XPI, and for distribution there is signing via addons.thunderbird.net (free), rollout through `policies.json`, or the signature requirement you can switch off.

> **The reported message stays in the mailbox.** Deleting it on reporting would be patronising and unnecessary: if the attack is confirmed, mass quarantine takes it out of *every* mailbox anyway — not just the one belonging to the person who paid attention.

### What is stored

**The original file is kept.** An analysis that only knows derived fields could not be repeated later with better rules, and for incident handling the original is the actual evidence.

> **One exception with the VSTO add-in:** Outlook does not preserve the received MIME byte for byte on IMAP and POP accounts. There the `.eml` is assembled from the **complete original header block** plus body and attachments. The score rests almost entirely on the headers, and those stay unchanged — but it is not byte-identical. Via Exchange (web add-in) and in Thunderbird it is.

**Repeated reports count up instead of creating duplicates**, detected via the SHA-256 of the raw bytes. A wave is typically reported by many people at once; the report count is the first rough signal of its scale.

All roles may report — otherwise nobody does.

> **Relationship to privacy mode:** the lock on individual-person evaluations deliberately does **not** apply here. It protects against evaluating employees' behaviour in awareness simulations; a reported phishing mail is incident handling and therefore a different purpose. Who reported it is stored — without that link you could neither follow up nor inform the reporter. See [Data protection & co-determination](/en/reference/datenschutz/).

---

## Automatic analysis

Every report is evaluated on arrival. Expanding the row shows the result.

### Authentication

SPF, DKIM and DMARC are read from the receiving server's `Authentication-Results` header — **no own check**: it would need to know the DNS state at the time of receipt and would be neither reliable nor meaningful after the fact.

If the header is missing, the value reads **"not stated"**, not "passed". The difference between *checked and passed* and *not checkable* is decisive during triage.

### Sender inconsistencies

| Finding | Meaning |
|---|---|
| `display_name_spoofing` | The display name states an address other than the actual sender — the most common trick |
| `reply_to_mismatch` | A reply would go to a foreign domain |
| `return_path_mismatch` | The return path differs from the sender |

### Addresses

URLs contained in the mail are stored and displayed **defanged** (`hxxp://`, `[.]`) and are never linked. When reviewing a phishing mail nobody should end up on the attacker's site through a misclick — and no mail client or ticket system should turn the address back into a link.

### Attachments

Name, type, size and **SHA-256** are recorded. Executable extensions (`.exe`, `.js`, `.hta`, `.lnk` …) reach the *high* level on their own: the mail was already flagged as suspicious by a human, and a legitimate executable attachment is the rare exception. Archives weigh less because they are often harmless.

### Scoring

The score is **rule-based and explainable**. Every finding carries its rule, its weight and a reason — anyone questioning the score sees immediately where it comes from. A black-box score would be worthless for incident handling.

---

## Waves

Reports sharing a normalised subject and sender domain form a **wave**. Reply and forward prefixes (`AW:`, `Re:`, `Fwd:`) are stripped so they cannot tear the same wave apart.

Deliberately **not** the full sender address: attackers vary the local part (`no-reply`, `service`, `info`) within an identical wave. And deliberately not the content — a single personalised salutation would make every mail unique, leaving the clustering with nothing to group.

The list sits at the top of the *Reported mails* page, sorted by report count: the most widely spread wave comes first.

---

## Attachment scanning with ClamAV

**Optional and self-hosted.** Under *Settings → Attachment scanning* you point the instance at a ClamAV on your own network (default port 3310). Attachments never leave the instance — there is deliberately no cloud lookup.

Example for the compose stack:

ClamAV ships as a **compose profile** and is therefore off by default:

```bash
docker compose --profile scanning up -d
```

Then enter host `clamav`, port 3310 under *Settings → Attachment scanning*.

> **Why not always on:** `clamd` keeps the whole signature database in memory — 1.5 to 2 GB in practice. Running it always would raise the minimum requirement of every installation, including the many that never receive a report.

In installations **without internet access** `freshclam` cannot reach the signatures and the database ages silently. There, either point it at an internal mirror or leave the check off — an outdated signature database is worse than none, because it feigns security.

> **If the scanner is unreachable, attachments count as "not scanned" — never as clean.** A false all-clear would be the most dangerous message this module could produce.

The *Test connection* button sends the **EICAR test pattern**. Only when the scanner reports the test detection is the chain demonstrably working — a mere TCP connection would not prove that.

A detection weighs 100 points and lifts the report to *high* immediately.

---

## Attachment scanning with YARA

A second, independent checker alongside ClamAV. Both run side by side and give separate verdicts: ClamAV detects known malware by signature, YARA detects **patterns the operator describes themselves** — macros with certain calls, say, or the marks of a campaign currently running against your own organisation.

### The operator brings the rules

The rules directory ships **empty**, and that is deliberate. A rule set is a substantive statement about what counts as suspicious; shipping one would mean making that statement on every operator's behalf.

There is also the licensing situation: the most widely used free collection (`signature-base` by Florian Roth) is licensed **CC BY-NC** and may not be shipped inside a commercial product. Other collections mix licences. Anyone adding rules should do so deliberately and with an eye on their licence.

### Setting it up

Put rule files (`.yar`, `.yara`) in a directory and mount it into the backend container:

```yaml
services:
  backend:
    environment:
      ENTERPRISE_YARA_RULES_DIR: /rules
    volumes:
      - ./yara-rules:/rules:ro
```

Subdirectories are read as well. Changes take effect **without a restart** — the rules are recompiled as soon as something in the directory changes.

### Behaviour on failure

| Situation | Result |
|---|---|
| No rules directory, or empty | "not scanned" — **not** "clean" |
| A single rule file broken | The remaining rules keep working; the error is named |
| All rules broken | "not scanned" |
| Match | A finding worth 70 points, lifting the report to *high* |

One broken rule does not topple the whole set — otherwise the operator is left searching in the dark. A match weighs less than a ClamAV detection (100 points): the rule comes from your own organisation and may be drawn more broadly than a virus signature.

---

## MISP enrichment

**Entirely optional.** Anyone without a MISP instance only loses this section — everything else works unchanged. There is no cloud substitute and no mandatory lookup.

Under *Settings → MISP* you enter the URL and a read-access API key of your **own** instance. The indicators a report yields are queried: the SHA-256 of attachments, the contained addresses (in their original form, not defanged) and the sender domain.

> **Only the self-hosted instance entered here is queried.** Whether it pulls external feeds is its operator's decision. SentryMail never queries a third-party service on its own — a mandatory cloud lookup would undermine the self-hosting proposition.

A hit weighs 70 points: the indicators come from incidents the organisation curated itself and are therefore more solid than any heuristic.

> **If the instance is unreachable it reads "check not possible" — not "nothing known".** The same rule as for attachment scanning: a failed check must never look like a completed one.

---

## Mass quarantine

Once a wave is confirmed, the best analysis is worthless while the mail still sits in hundreds of mailboxes. Mass quarantine takes it out of them — **moved into a quarantine folder, never deleted**. A mistake therefore stays correctable; the message remains in the affected person's mailbox, just not in the inbox.

Both common environments are supported: **Microsoft 365** via the Graph API and **Postfix/Dovecot** via the doveadm HTTP API. You set one of them up under *Settings → Quarantine*; without a selection SentryMail touches no mailbox at all.

### The search is by Message-ID only

A wave's subject also appears in legitimate replies and forwards — searching by it would sweep up other people's mail. The search therefore uses the reported message's **Message-ID** only. Reports without a Message-ID cannot be quarantined; that is the intended consequence.

### The dry run is mandatory

The process has two steps and cannot be shortened:

1. **Dry run** — searches all mailboxes for the message and shows where it sits. Nothing is changed. The result is stored as a record.
2. **Execution** — refers to exactly that stored run and moves the messages found.

Without a stored dry run there is nothing to execute, and executing an already executed run is refused. This is not an on-screen warning you can click away but the structure of the interface.

> **A locked mailbox does not abort the run.** With a thousand mailboxes one of them is always unreachable. Aborting would leave the remaining findings in place — the error is therefore recorded per mailbox and the run continues.

### Permissions

| Environment | What is needed |
|---|---|
| Microsoft 365 | App registration with the `Mail.ReadWrite` application permission |
| Postfix/Dovecot | doveadm HTTP API with an account allowed to run `doveadm move` |

On Microsoft 365 that permission initially covers **every** mailbox. Restrict it to the scope you actually need via an [application access policy](https://learn.microsoft.com/graph/auth-limit-mailbox-access).

### Co-determination

Accessing other people's mailboxes is the most far-reaching action this product performs. Agree it with the employee representation before putting it into service — the template under `compliance/` names it explicitly. Every dry run and every execution is written to the audit log with count, subject and the person who triggered it; the runs themselves are kept as evidence.

---

## Not yet included

- **VSTO add-in for Outlook without Exchange** — the source is complete but has not yet been compiled and tested on Windows. It is the only client that needs a codesigning certificate.

---

*See also: [Data protection & co-determination](/en/reference/datenschutz/) · [Features](/en/reference/funktionen/) · [NIS2 & BSI](/en/reference/nis2-und-bsi/)*
