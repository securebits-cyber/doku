---
title: "Delivery"
description: "Generate allowlisting for the mail gateway, verify delivery before a campaign starts, and diagnose delivery problems."
sidebar:
  order: 3
---

The most common reason a campaign seems not to arrive is not SentryMail. It is the mail gateway in front of it: it holds the simulation back — or the link scanner clicks it itself and produces clicks no person ever triggered.

The delivery assistant has three parts that build on each other: **prepare**, **verify**, **understand**. All three belong to the **Open Core version** and need no license.

You find them under *Settings → Delivery*; the diagnosis additionally on the results page of every campaign. All functions are restricted to administrators.

## 1. Generate allowlisting

The generator produces ready-made configuration snippets or step sequences for your gateway from what the instance already knows. Five profiles ship with the product:

| Gateway | Output |
|---|---|
| Exchange Online / Microsoft 365 | PowerShell |
| Postfix | Configuration fragments |
| Proofpoint | Step sequence |
| Sophos Email Security | Step sequence |
| Barracuda Email Gateway | Step sequence |

**Sender domain** and **tracking domain** are prefilled — from the global SMTP settings and from `APP_DOMAIN`. The **sender IP** is yours to add: with an external SMTP provider that is their outbound IP, not your instance's. Only the provider knows that value, so the system does not guess.

:::danger[Always enter domain *and* IP]
An exemption by sender domain alone also applies to anyone spoofing that domain. That opens a hole bigger than the problem it solves.
:::

:::caution[Exempt the tracking domain from link scanning]
Safe Links, URL Defense, time-of-click protection and the like follow links themselves. Without an exemption you get clicks without users, and every evaluation comes out too high — the campaign then looks worse than your workforce is.
:::

For Microsoft 365 the profile uses the path Microsoft intends for this (`New-PhishSimOverridePolicy` and `New-ExoPhishSimOverrideRule`) rather than a generic transport rule: the mail still passes the filters but is neither blocked nor reported as a threat.

:::note[A suggestion, not a finished configuration]
Menu labels and commands differ between product variants and versions. The output is meant for the mail administrator; the vendor documentation stays authoritative.
:::

### Adding more gateways

The profiles are **data files**, not code: `backend/app/data/gateway_profiles/*.json`. Another gateway means another file — no vendor is hard-wired into product code. The `README.md` in the same directory documents the format and placeholders.

A malformed profile file is skipped and logged; the remaining profiles stay usable.

## 2. Verify delivery before starting

Before a campaign starts, a probe mail goes to a dedicated mailbox — the canary mailbox — **over the same route as the campaign**. If it arrives, the route is clear. If it does not, the gateway is the cause and not the software.

The test runs through the campaign's sending profile, not a substitute sender. A test over a different route would not check the thing that matters.

**Setup:** enter the canary mailbox address — a dedicated mailbox, **never** a real recipient. IMAP access is optional; without it arrival cannot be confirmed, but a failed send is still detected. The credentials are stored encrypted in the database and are never returned through the API.

| State | Meaning |
|---|---|
| Sent, arrival unconfirmed | Sending worked. Without IMAP it stays there. |
| Arrived | The route is clear. |
| Did not arrive | Only after 30 minutes. Greylisting regularly delays by 5 to 15 minutes. |

:::note[A failure does not block the start]
It warns. The decision to start anyway stays with you — you know your gateway better than the product does. Without an address configured the test is silently unavailable; it is a help, not a requirement.
:::

If the canary mailbox is unreachable, the test stays open and the reason is recorded. An IMAP problem is **never** reported as a delivery failure — anything else would wrongly blame a working gateway.

## 3. Diagnose delivery problems

On the results page of every campaign. Three sources are evaluated.

### Delivery status per recipient

The send path stores the SMTP status code. That carries the decisive information:

- **4xx — temporary.** Greylisting, rate control. Sending again is usually enough.
- **5xx — permanent.** Unknown mailbox, blocked sender, refused attachment.

Campaigns from older versions do not backfill the status and are reported accordingly.

### Greylisting

From three temporary rejections onward it is named as such: the mails are **delayed, not lost**. Single 4xx responses are everyday noise; only the accumulation is a pattern. Reading "did not arrive" here sends you looking in the wrong place.

### DNS of the sender domain

| Finding | Meaning |
|---|---|
| No SPF record | Many recipients treat this as a spoofing attempt. |
| Several SPF records | Invalid per RFC 7208. Many recipients then reject the domain outright — easy to miss, because "SPF present" is technically true. |
| `-all` (hard fail) | The sending server must be listed in the record. |
| `~all` (soft fail) | Common and uncritical. |
| `+all` / `?all` | Allows any sender. Protects nothing, harms reputation. |
| DMARC `p=reject` | If the sender domain does not align with SPF/DKIM, mail is hard-rejected — the single most common cause. |
| DMARC `p=quarantine` | Lands in the spam folder instead of the inbox. |

**DKIM is explicitly reported as unverifiable.** Checking it needs the selector from the signature of the sent mail, not the DNS record of the domain. A "not checked" is more honest than a faked check.

If all recipients are accepted and still nothing arrives, filtering happens **after** acceptance — then go back to step 1.

:::note[Data protection]
Status codes and DNS records are evaluated, never recipient attributes. This is a delivery evaluation, not an evaluation of people — the k-anonymity threshold of [privacy mode](/en/reference/datenschutz/) does not apply here.
:::

## Order in practice

1. **Before the first campaign:** generate the allowlisting and hand it to the mail administrator.
2. **Once they have applied it:** configure the canary mailbox and run the self-test.
3. **If something is still missing:** open the diagnosis on the results page.
