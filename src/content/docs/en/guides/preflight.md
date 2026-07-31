---
title: "Campaign preflight and approval"
description: "Define the rules for starting a campaign, rate lure topics by risk, understand the mandatory dialog and approve with four eyes."
sidebar:
  label: "Preflight"
  order: 4
---

A phishing simulation intrudes on people's working day. Whoever starts one should know beforehand how many people it reaches, at what time, which of them were already targeted in recent weeks — and whether the theme is reasonable.

The preflight is the mandatory dialog that answers those questions **before** the send runs. It belongs to the **Open Core version** and needs no license.

:::danger[Behaviour change from this update]
No campaign starts without an acknowledged preflight. Existing campaigns must pass through the dialog once. That is intentional — the point of the dialog is that somebody looked, and that cannot be reconstructed after the fact.
:::

## 1. Setting the rules

Under *Settings → Campaign preflight*. All defaults are chosen so that an update does **not** change the behaviour of an existing installation: quiet hours off, cooldown 30 days, second approval with the admin.

### Time zone first

:::caution[The default is UTC]
We hard-wire no region. Without your own time zone, quiet hours and blackout windows take effect at the wrong time of day — and they do so quietly. Set the IANA name: `Europe/Berlin`, `Europe/Vienna`, `Europe/Zurich`.
:::

An unknown time zone falls back to UTC and blocks nothing: a configuration error must not hold up a campaign start.

### Quiet hours

No sending outside working hours. A simulation at three in the morning is not an awareness measure but a disturbance — and in a co-determined workplace an avoidable conflict.

A window **across midnight** (22:00–06:00) is the normal case and is explicitly supported. Either set both times or leave both empty; half a window is rejected because it would never take effect.

### Cooldown

Minimum gap between two simulations for the **same person**, default 30 days. Being tested every other week teaches nothing; it just breeds habitual suspicion towards your own IT.

People are counted, not events: somebody who appeared in three old campaigns is still one person. And only campaigns **actually sent** count — a planned campaign that was never sent bothered nobody. `0` disables the check.

### Blackout windows

Named periods in which nothing starts: works meeting, year-end closing, system migration. Unlike quiet hours, a one-off period with an occasion.

### Who grants the second approval

`Admin` or `Data protection officer / works council`. Set to the second option, approval sits with the **works council role** — the intended link to [privacy and co-determination mode](/en/reference/datenschutz/).

## 2. Risk class of bait themes

Maintained **on the template**, not on the campaign: the theme belongs to the template.

| Class | Examples | Effect |
|---|---|---|
| **High** | Salary, bonus, termination, written warning, health, bereavement, layoffs | Second approval required |
| **Medium** | Management, invoice, payment reminder, contract, job application, password expiry | Note in the dialog only |
| **Low** | Parcel delivery, newsletter, survey, software update, canteen | The normal case |

Themes in the *high* class touch existential or deeply personal worries. Such a lure does not land as an exercise but as real news — something stays even after the debrief.

:::note[Only *high* forces an approval]
If every class demanded one, approval becomes a formality people click away — and loses exactly the effect it exists for.
:::

The theme list is a maintainable data file in the repository (`backend/app/data/risk_themes.json`) and explicitly only a suggestion. Which theme is sensitive in your organisation is your call. What counts is the class set on the template.

## 3. The mandatory dialog

Appears when you click *Send* and shows the recipient count (after exclusions), the affected groups, the send time, the risk class and the findings.

### What blocks, what warns

| Finding | Effect |
|---|---|
| No recipients | **blocks** |
| Missing or rejected second approval for the high class | **blocks** |
| Quiet hours | warns |
| Active blackout window | warns |
| Cooldown violation | warns |
| Failed [delivery self-test](/en/guides/zustellung/) | warns |
| Upcoming blackout window | note |

:::note[A warning is a warning]
The decision to start anyway stays with you — you know your organisation better than the product does. Only a hard finding truly holds things up.
:::

The **scheduled start time** is checked, not the moment somebody looks. Otherwise the dialog would report quiet hours for the wrong point in time and be systematically the wrong way round.

### Exclusions

Groups can be excluded directly in the dialog. The exclusion takes effect at send time; the recipient list stays untouched, so re-including a group needs no rebuild.

:::danger[No field for the reason of an exclusion]
Exclusion works solely through group membership. A free-text field would quickly be filled with parental leave, illness or an ongoing case — particularly sensitive data with no purpose here. If you need that information, keep it outside this system.
:::

Any change to the campaign or its exclusions resets the acknowledgement: it applied to a state nobody sees any more.

## 4. Four-eyes approval

For the high risk class the planner requests approval **with a reason** — an approval without cause would be a formality. The decision is made by a different person in the configured role.

:::danger[Whoever requests does not decide]
That is the whole point. Secured in three places: the role check, a dedicated check in the endpoint, and a constraint in the database. The rule does not rest on application logic alone.
:::

Request, decision, rejection and reason are recorded in the audit log.

**Switching the template revokes the approval** — a different template is a different lure, possibly in a different risk class. Renaming does not: otherwise the procedure would be harassment, and harassment breeds workarounds.

## Order in practice

1. **Once:** set the time zone, define quiet hours and cooldown, assign the second approval.
2. **As needed:** add blackout windows for known dates.
3. **Per template:** set the risk class of the theme.
4. **Before each start:** read the dialog, set exclusions, obtain approval for the high class, acknowledge.
