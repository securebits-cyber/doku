---
title: "NIS2 reporting assistant"
description: "Deadlines, significance pre-assessment and draft texts for notifying an incident — without automatic transmission."
sidebar:
  order: 8
---

Entities subject to notification have **24 hours** from becoming aware of a significant incident for the early warning, **72 hours** for the follow-up notification and **one month** for the final report. The clock runs while you are still trying to understand what happened.

The reporting assistant tracks those deadlines, structures the significance assessment and produces draft texts. It belongs to the **Enterprise add-on** and builds on the [threat analytics pipeline](/en/reference/meldung-analyse/).

## Four hard boundaries

:::danger[There is no automatic transmission]
SentryMail sends **nothing** to the BSI reporting portal and nothing to a supervisory authority. No endpoint for it exists, and none should come into being.

The output is a draft to download. The responsible party submits the notification themselves — an automatic notification would take away a decision that is theirs alone.
:::

:::danger[Not legal advice]
Neither the checklist nor the draft assesses whether a notification duty exists. The checklist **structures** the deliberation; it computes nothing. The notice appears in the interface, in every export and in every API response — not in the small print.
:::

:::caution[The decision against notifying is documented too]
A reason is mandatory in **both** directions. This is precisely the record that is regularly missing under scrutiny: that somebody looked and weighed the matter with reasons cannot be reconstructed afterwards — and without it the question stands whether anybody looked at all.
:::

:::note[The clock runs in calendar days]
Weekends and public holidays count. A deadline starting on a Friday evening ends on Saturday evening — not on Monday. A working-day calculation would be convenient and wrong.
:::

## The time of awareness

All deadlines run from **awareness**, not from recording. The two diverge: whoever becomes aware on Sunday night and records it on Monday morning has 24 hours *less*, not more.

The time is therefore a separate field, settable by hand. It may not lie in the future — that would be the simplest way to defeat the clock.

## The sequence

1. **Create the case.** By hand, referencing the confirmed analysis. There is deliberately no automation: a notification duty does not arise from a score.
2. **Assess significance.** Eight guided questions — operational disruption, financial losses, damage to third parties, personal data, captured credentials, risk of spreading, cross-border effect, indications of an unlawful act.
3. **Decide.** Notify or not — with a reason.
4. **Write the drafts.** Per stage the fields of the reporting portal, prefilled with what follows from the case itself. What would be an **assessment** — severity, impact — stays empty: that is the statement of the responsible party.
5. **Submit and record.** You submit; in the assistant you record that it happened.

Questions and portal fields live in maintainable data files. Law and forms change — no release should be needed for that.

## The GDPR strand runs alongside

If personal data is affected, an **additional** notification duty arises under Art. 33 GDPR: 72 hours to the competent **state supervisory authority** — not to the BSI.

:::caution[One notification never replaces the other]
In the assistant the GDPR strand is a **separate case** with its own clock, its own fields and a different recipient. It deliberately does not appear as a fourth NIS2 stage: a shared list invites exactly the confusion the law does not forgive. Submitting the NIS2 follow-up notification does **not** mark the GDPR strand as done.
:::

## Escalation

Under *Settings → Escalation contacts* named roles are recorded, each **with a deputy**. Reminders go out at half and at 80 percent of the deadline as well as on exceeding it — each level exactly once.

The deputy is **always** notified as well, not only when a response fails to arrive: a deadline that fails because of a holiday is exactly the case escalation exists for.

An escalation that nags by the minute gets ignored — and then so does the one that matters. Hence one message per level.

Requests, decisions and records appear in the [evidence chain](/en/reference/nachweiskette/).
