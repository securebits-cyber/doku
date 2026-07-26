---
title: "Compliance mapping"
description: "How SentryMail supports requirements from NIS2, BSI IT-Grundschutz, the GDPR and ISO/IEC 27001 — and where the limits are."
sidebar:
  order: 6
---

How SentryMail supports requirements from **NIS2**, the **BSI IT-Grundschutz**, the **GDPR** and **ISO/IEC 27001**.

:::caution[What this page is — and is not]
A **mapping, not legal advice**, and not an automatic proof of "compliance". No software makes an organisation NIS2-compliant or ISO 27001-certified; it produces evidence for individual measures. What binds you is your risk analysis, your ISMS, your data protection impact assessment and, where applicable, legal counsel.

You will not find phrasing like "satisfies Art. 21 NIS2" here. Anyone promising that is selling a feeling, not evidence.
:::

## The part awareness actually plays in a framework

All four frameworks require awareness — but none of them requires a *simulation*. They require that staff are trained and that the organisation can **demonstrate** it. The simulation is what makes both measurable: it shows the state before the training, and the record shows that training happened.

Hence the order of this page: first the duty to train (NIS2, BSIG, IT-Grundschutz, ISO 27001), then the duty not to surveil your staff while doing it (GDPR). The second half is routinely overlooked and is the more common reason a rollout stalls.

## NIS2 (EU Directive 2022/2555)

NIS2 requires affected entities to take **risk-management measures**, explicitly including **basic cyber hygiene practices and cybersecurity training** (Art. 21(2)(g)).

| Requirement | Platform contribution |
|---|---|
| Cyber hygiene and training (Art. 21(2)(g)) | Repeatable campaigns, training module with mandatory assignment |
| Assessing the effectiveness of measures (Art. 21(1)) | Open, click and submission rates per campaign, trend over time |
| Reporting routes (Art. 23) | Report button and analysis of reported mail as the intake channel — the platform does **not** file the report with the authority |
| Documentation | Result evaluation, CSV export, PDF records, audit log |

### Management bodies: § 38 BSIG

The German implementation explicitly obliges **management bodies** to approve the risk-management measures, oversee their implementation and **attend training regularly**. Unlike the workforce's duty, this one is personal — and in a serious case it is examined individually.

Recipient groups therefore carry a **management body** marker. The training record can be drawn separately for them, without hunting for the management in the general evaluation.

## BSI IT-Grundschutz

The module **ORP.3 "Awareness and training"** addresses this directly; phishing simulations are a common implementation.

- **Awareness programme with target groups and effectiveness review** — campaigns per recipient group (by department, say), progress measured over time.
- **Training staff** — the training module with assignment and record.
- **Detection and response (the DER layer)** — the report button as the route out of the workforce, the analysis of reported mail, mass quarantine as the response to a confirmed wave.

## GDPR

This is the part that can genuinely hold up a rollout. A phishing simulation processes **personal data about employees' behaviour** — not as a side effect but as the very point of the measurement.

### Legal basis and purpose

The usual legal basis is **Art. 6(1)(f) GDPR** (legitimate interest in IT security), flanked in the employment context by **§ 26 BDSG** and **Art. 88 GDPR**. **Consent** rarely works here: in an employment relationship it can hardly be freely given, and whoever declines drops out of the measurement — at which point the measurement says nothing.

The balancing test under (f) gets easier the less the evaluation identifies individuals. That is exactly where the **privacy and co-determination mode** comes in.

### What the software contributes

| GDPR requirement | Implementation |
|---|---|
| **Art. 5(1)(c)** — data minimisation | Group-level evaluation with k-anonymity; below the threshold (default: 5 people) there is no breakdown. Client fingerprinting ships **off**. |
| **Art. 5(1)(e)** — storage limitation | Retention with automatic **anonymisation** rather than deletion: the figure stays, the personal reference goes |
| **Art. 15/17** — access and erasure | Answerable until anonymisation; afterwards the link is irreversibly gone — that is the purpose of the rule, not a gap |
| **Art. 25** — data protection by default | The mode is a server-side lock that applies to administrators too, not a display filter |
| **Art. 32** — security of processing | Argon2id, Fernet encryption of credentials, 2FA, audit log — see [Security overview](/en/reference/sicherheitsueberblick/) |
| **Art. 28** — processing on behalf | Does not arise for the platform itself: **self-hosted, no vendor access, no telemetry**. For SMTP delivery or an external LRS it remains your task |
| **Art. 44 ff.** — third-country transfers | Do not occur as long as you connect no external services |

### Data protection impact assessment

A **DPIA under Art. 35 GDPR** deserves serious consideration for a phishing simulation: supervisory authorities list the systematic evaluation of employee behaviour among the processing operations that require one. With privacy mode active the risk drops markedly — an evaluation that technically **cannot** identify individuals is a different thing from one that could and promises not to.

**The DPIA remains your task.** The software supplies a description of the processing, not an assessment of it.

### Co-determination

A simulation platform is a **technical device capable of monitoring behaviour or performance** — which brings **§ 87(1)(6) BetrVG** into play, or the equivalent staff representation law. The works or staff council must be involved **before** the start, not after the first campaign.

The source ships templates for a **works agreement** and a **privacy overview** under `compliance/`, in German and English. They describe what the software enforces — they are not legal advice.

Details: [Data protection & co-determination](/en/reference/datenschutz/).

## ISO/IEC 27001:2022

For a certified ISMS, awareness is not a fringe topic; it sits in both the main clauses and the annex.

**Main clauses:**

- **7.2 Competence** and **7.3 Awareness** — staff must know the information security policy and understand their contribution. The records are asked for in every audit.
- **9.1 Monitoring and measurement** — the click rate over time is one of the few awareness metrics that can be measured meaningfully at all.
- **10.2 Continual improvement** — baseline, measure, measure again.

**Annex A (2022 edition):**

| Control | Relation |
|---|---|
| **A.6.3** Information security awareness, education and training | The direct hit: campaigns, training module, records |
| **A.6.8** Information security event reporting | The report button in Outlook and Thunderbird — a reporting route that costs one click actually gets used |
| **A.5.24–A.5.26** Incident planning, assessment and response | Analysis of reported mail, mass quarantine as a documented response |
| **A.8.7** Protection against malware | Attachment checks against ClamAV, your own YARA rules and your own MISP instance |
| **A.5.7** Threat intelligence | MISP matching of reported mail |

:::note
**The platform is not ISO 27001-certified and does not make you certified.** It produces evidence for individual controls. Certification concerns your management system and is granted by an accredited body.
:::

## Other frameworks

- **DORA** (Regulation (EU) 2022/2554, Art. 13(6)) — financial entities must maintain digital operational resilience awareness programmes, explicitly including for management. The mapping matches the NIS2 one.
- **TISAX / VDA ISA** — the awareness and training control corresponds in substance to ISO 27001's A.6.3.
- **NIST Cybersecurity Framework 2.0** — category **PR.AT** (Awareness and Training).
- **CIS Controls v8** — **Control 14**, security awareness, with explicit reference to recognising social engineering.

## What evidence is produced

What an auditor or a supervisory authority actually wants to see, and where it lives:

| Evidence | Where | For what |
|---|---|---|
| Campaign result per group, over time | Evaluation, CSV export | Effectiveness, ISO 9.1 |
| Training record per person or group | Training module, PDF | ISO 7.2/7.3, NIS2 Art. 21 |
| Separate record for management bodies | Marker on the recipient group | § 38 BSIG, DORA Art. 13(6) |
| Audit log of configuration and approvals | Audit log | Accountability, GDPR Art. 5(2) |
| Four-eyes approvals for lifted locks | Audit log | Co-determination, DPIA |

PDF records are produced as **PDF/A-3b** and can be **digitally signed**. On how far a self-signed signature reaches: [Security overview](/en/reference/sicherheitsueberblick/).

That the audit log itself was not altered afterwards can be recomputed independently: the entries form a hash chain, and the bundled verification tool works without SentryMail. See [evidence chain](/en/reference/nachweiskette/).

Two further records arise in the Enterprise add-on: the [control effectiveness test](/en/reference/kontrolltest/) shows which protective layer of the mail infrastructure catches what, and the [NIS2 reporting assistant](/en/reference/nis2-meldung/) documents deadlines and notification decisions — explicitly including the decision *against* notifying.

## Recommended approach

1. **Legal first.** Involve data protection and the works/staff council **before** the first campaign. A works agreement produced after the fact costs more trust than the first simulation yields in insight.
2. **Switch privacy mode on** before data exists. It does not apply retroactively to what has already been collected.
3. **Measure a baseline** — without announcing it to the workforce, but with the councils' knowledge.
4. **Repeat regularly** and vary the templates. One campaign a year measures luck, not awareness.
5. **Follow up with training.** The simulation is the entry point, not the goal.
6. **Document while the data is still there.** Retention anonymises automatically.

## Limits

- **No substitute for an ISMS**, for technical protections (mail filters, MFA, EDR) or for a gap analysis.
- **No certification, no attestation.** See the notice at the top.
- **The DPIA and the choice of legal basis remain your decision.** The software describes the processing; it does not assess it.
- **Do not use results for individual sanctions.** Beyond the employment-law side: someone who fears a warning letter will not report the next incident — and the reporting rate is the more valuable of the two metrics.

---

*See also: [Data protection & co-determination](/en/reference/datenschutz/) · [Security overview](/en/reference/sicherheitsueberblick/) · [Features](/en/reference/funktionen/)*
