---
title: "Evidence chain"
description: "Hash chaining for the audit log, evidence package and independent verification without SentryMail."
sidebar:
  order: 5
---

"Tamper-proof" is a common word in product descriptions and rarely a checkable claim. A log whose integrity only the vendor can confirm is of little help under scrutiny.

SentryMail therefore links every audit entry to the hash of its predecessor — and ships a **standalone verification tool** that works without SentryMail. Both belong to the **Open Core version**.

## How the chain works

Every entry in the audit log carries three additional fields:

| Field | Meaning |
|---|---|
| `seq` | gap-free ascending position |
| `prev_hash` | hash of the predecessor (64 zeros for the first entry) |
| `entry_hash` | SHA-256 over its own content **including** `prev_hash` |

It follows that:

- A **changed** entry no longer matches its `entry_hash`.
- A **removed** entry leaves a gap in `seq` *and* a broken reference in its successor.
- **Swapped** entries break the linkage even if both are individually unchanged.

Repairing this retroactively would require recomputing all subsequent entries — which shows up at the latest when comparing against a package exported earlier.

:::caution[What deliberately is not hashed]
The link to the user account (`actor_id`) does **not** go into the hash. When an account is deleted, the database clears that link — were it part of the hash, **every account deletion would have broken the chain retroactively**, without anybody tampering with anything. What gets hashed instead are the snapshots of name and email address, which exist in the log for exactly this purpose.
:::

:::note[What the chain does not claim]
The chain starts with the update that introduces it. Existing entries are linked in chronological order — so the chain proves that nothing has been altered **since that point**. For the time before it, it can attest nothing.
:::

## Checking the state

Under *Settings → Activity* the chain state is shown: the number of entries and whether the chain is intact. A break is named with the affected position, without having to export anything first.

## Exporting an evidence package

Same place: **Export evidence package**, or via the API `GET /audit-events/evidence-package`. The ZIP contains:

| File | Content |
|---|---|
| `events.jsonl` | one entry per line, with hashes |
| `manifest.json` | chain head, entry count, algorithm, format version, export time |
| `README.md` | verification instructions, bilingual |

Administrators **and** the data protection officer have access — their [oversight role](/en/reference/datenschutz/) is worthless without independently verifiable evidence.

## Verifying independently

The tool lives in the source tree at `tools/sentrymail-verify/verify.py`:

```bash
python verify.py sentrymail-nachweis-20260726-120000.zip
python verify.py --lang en package.zip
```

| Exit code | Meaning |
|---|---|
| `0` | chain intact |
| `1` | break found — details on the output |
| `2` | package unreadable or format unknown |

:::tip[One file, no dependencies]
Python standard library only. No installation, no database, no network, no SentryMail. An automated test makes sure it stays that way.

**This file may be handed out together with the package.** That is the whole point: an auditor should be able to recompute the chain without asking the vendor — and read the source of the verifying tool themselves.
:::

A package with a **newer format version** is refused (exit 2), not declared broken. A false assurance would be worse than none.

## Retention and the chain

The chain does not override any deletion obligation. Where a retention period applies, it takes precedence — but it need not destroy the chain.

**The content is deleted; position, timestamp and linkage remain.** The entry stays as a *tombstone*: it remains provable **that** and **when** something happened, without keeping personal data beyond the retention period. The verifier does not recompute the content hash for tombstones — it cannot match any more, and it should not.

Deleting the rows instead would create a gap, which the verifier would rightly report as a break.

:::caution[A separate period, deliberately]
Under *Settings → Privacy* there is a separate field *retention period for audit content*. The default is empty — the content stays.

Separate from the retention for campaign data, because the audit log is the evidence you need under scrutiny. Deleting it silently along with campaign data would be an unpleasant surprise.
:::

## Relation to NIS2 and BSI

The chain provides the technical basis for demonstrating that logs were not altered afterwards — a recurring audit point under ISO 27001 and the BSI IT-Grundschutz. It replaces no legal assessment and says nothing about whether your retention concept is complete. See also the [compliance mapping](/en/reference/compliance/).

Not yet included and planned for the **Enterprise add-on**: RFC 3161 timestamps over chain anchors (additionally attesting the point in time towards third parties) and time-limited, read-only auditor access.
