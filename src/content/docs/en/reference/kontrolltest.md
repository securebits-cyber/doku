---
title: "Control effectiveness test"
description: "Measure which protective layer of your own mail infrastructure catches what — with harmless payloads against a dedicated test mailbox."
sidebar:
  label: "Control test"
  order: 7
---

An awareness simulation measures how people react. This test measures something else: **which protective layer catches what**, before a human sees anything at all.

Only together do the two give a picture. A high click rate behind a gateway that filters nothing is a different statement from the same rate behind a well-configured one — and only the second is an awareness problem.

The test belongs to the **Enterprise add-on**.

## The safety net

:::danger[A dedicated test mailbox only]
The test sends messages a gateway is supposed to recognise as an attack. Sent to a real person that would not be a measurement but an incident.

This is **not an organisational promise but enforced server-side**: before every run the target address is checked against all three places where people exist in the system — campaign recipients, group members and user accounts. A hit refuses the run.
:::

Two details that matter here:

- The check runs **already on save**, not only at run time. You learn immediately that the address belongs to a person — not only when you try to start the test.
- It runs **before the connection is opened**. Were it done at send time, the first message would already be on its way.

The comparison is case-insensitive: addresses come from CSV imports and directory services, and a capital letter would otherwise circumvent the net.

## The test battery

Eight stages, held in `backend/…/data/control_tests.json` as a **maintainable data file** — a new stage is a new entry, not a code change.

| Stage | Layer under test |
|---|---|
| Display-name spoofing | Anti-spoofing / header analysis |
| Homoglyph domain | Lookalike domain detection |
| SPF failure | SPF checking |
| Broken DKIM signature | DKIM checking |
| EICAR test file | Antivirus |
| Macro document | File type filtering |
| Password-protected archive | Archive handling |
| HTML smuggling | Content analysis |

### The payloads are deliberately harmless

:::caution[What explicitly does not happen here]
- **EICAR instead of malware** — the standardised test signature every scanner must detect and which does nothing.
- **Macro document without a macro** — what is tested is whether the gateway recognises the file type, not whether it analyses macro code. That would need a working macro, and one has no place in a testing tool.
- **HTML smuggling without an automatic download** — the pattern, not the payload.
- **Password-protected archive** containing a text file. The password is in the mail in plain text: an auditor should be able to open the attachment; it is not a secret.

What is measured is detection performance, not harm.
:::

## Reading the result

:::note[Here, blocked is the good result]
`blocked` means: did not arrive, so it was **caught** — the protective layer did its job. `delivered` means: let through.

That is the inverse reading of the [delivery diagnosis](/en/guides/zustellung/) and is reliably misread unless it is spelled out.
:::

Further states: `pending` (still in transit — 45 minutes of grace, because greylisting and sandboxing both delay) and `rejected_by_relay` (your own relay refused before the gateway saw the message — that too is a result).

An IMAP problem while reading the test mailbox is **never** counted as a test result. Anything else would wrongly certify a working gateway as effective.

## BSI mapping

Every stage maps to IT-Grundschutz building blocks — APP.5.3.A4 (malware in email traffic), APP.5.3.A5 (authentication of senders), NET.1.1.A3 (network security policy). The mapping lives in its own data file, not in code: building blocks are revised over time, and the mapping is a subject-matter statement.

:::caution[The mapping is a suggestion]
It replaces no assessment by the responsible party. Whether a requirement is met is not decided by a passed test stage. The note is included in the report.
:::

The result feeds as an artefact into the [compliance records](/en/reference/compliance/).
