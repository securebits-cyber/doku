---
title: "Compliance: NIS2, BSI, DSGVO, ISO"
description: "Wie SentryMail Anforderungen aus NIS2, BSI IT-Grundschutz, DSGVO und ISO/IEC 27001 unterstützt — und wo die Grenzen liegen."
sidebar:
  label: "Compliance"
  order: 6
---

Wie SentryMail Anforderungen aus **NIS2**, dem **BSI IT-Grundschutz**, der **DSGVO** und **ISO/IEC 27001** unterstützt.

:::caution[Was diese Seite ist — und was nicht]
Eine **Einordnung, keine Rechtsberatung** und kein automatischer Nachweis von „Compliance". Keine Software macht eine Organisation NIS2-konform oder ISO-27001-zertifiziert; sie liefert Belege für einzelne Maßnahmen. Verbindlich sind eure Risikoanalyse, euer ISMS, eure Datenschutzfolgenabschätzung und gegebenenfalls juristische Beratung.

Formulierungen wie „erfüllt Art. 21 NIS2" werdet ihr hier nicht finden. Wer sie verspricht, verkauft ein Gefühl, keinen Nachweis.
:::

## Die Rolle, die Awareness in einem Regelwerk spielt

Alle vier Regelwerke verlangen Sensibilisierung — aber keines verlangt eine *Simulation*. Sie verlangen, dass Beschäftigte geschult sind und dass die Organisation das **belegen** kann. Die Simulation ist der Weg, der beides messbar macht: Sie zeigt den Stand vor der Schulung, und der Nachweis zeigt, dass geschult wurde.

Daraus folgt die Reihenfolge dieser Seite: erst die Pflicht zu schulen (NIS2, BSIG, IT-Grundschutz, ISO 27001), dann die Pflicht, dabei die Beschäftigten nicht zu überwachen (DSGVO). Der zweite Teil wird oft übersehen und ist der häufigere Grund, warum eine Einführung stockt.

## NIS2 (EU-Richtlinie 2022/2555)

NIS2 verlangt von betroffenen Einrichtungen **Risikomanagement-Maßnahmen**, darunter ausdrücklich **grundlegende Cyberhygiene und Schulungen im Bereich Cybersicherheit** (Art. 21 Abs. 2 lit. g).

| Anforderung | Beitrag der Plattform |
|---|---|
| Cyberhygiene und Schulungen (Art. 21 Abs. 2 lit. g) | Wiederholbare Kampagnen, Schulungsmodul mit Pflichtzuweisung |
| Wirksamkeit der Maßnahmen bewerten (Art. 21 Abs. 1) | Öffnungs-, Klick- und Eingabequoten je Kampagne, Verlauf über die Zeit |
| Meldewege (Art. 23) | Meldeknopf und Auswertung gemeldeter Mails als Eingangskanal — die Meldung an die Behörde selbst leistet die Plattform **nicht** |
| Dokumentation | Ergebnis-Auswertung, CSV-Export, PDF-Nachweise, Audit-Log |

### Leitungsorgane: § 38 BSIG

Die deutsche Umsetzung verpflichtet **Geschäftsleitungen** ausdrücklich, die Risikomanagement-Maßnahmen zu billigen, ihre Umsetzung zu überwachen und **regelmäßig an Schulungen teilzunehmen**. Anders als bei der Belegschaft ist das eine persönliche Pflicht — und sie wird im Ernstfall einzeln geprüft.

Empfängergruppen tragen deshalb ein Kennzeichen **Leitungsorgan**. Der Schulungsnachweis lässt sich darüber getrennt ziehen, ohne die Geschäftsleitung in der allgemeinen Auswertung zu suchen.

## BSI IT-Grundschutz

Der Baustein **ORP.3 „Sensibilisierung und Schulung"** adressiert Awareness direkt; Phishing-Simulationen sind eine gängige Umsetzung.

- **Sensibilisierungsprogramm mit Zielgruppen und Erfolgskontrolle** — Kampagnen je Empfängergruppe (etwa nach Abteilung), Fortschrittsmessung über die Zeit.
- **Schulung der Beschäftigten** — das Schulungsmodul mit Zuweisung und Nachweis.
- **Detektion und Reaktion (Bausteinschicht DER)** — der Meldeknopf als Meldeweg aus der Belegschaft, die Analyse gemeldeter Mails, die Massen-Quarantäne als Reaktion auf eine bestätigte Welle.

## DSGVO

Hier liegt der Teil, der eine Einführung tatsächlich aufhalten kann. Eine Phishing-Simulation verarbeitet **personenbezogene Daten von Beschäftigten** über deren Verhalten — das ist kein Nebeneffekt, sondern der Kern der Messung.

### Rechtsgrundlage und Zweck

Als Rechtsgrundlage kommt in der Regel **Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse an der IT-Sicherheit) in Betracht, im Beschäftigungskontext flankiert von **§ 26 BDSG** und **Art. 88 DSGVO**. Eine **Einwilligung** trägt hier meist nicht: Sie wäre im Beschäftigungsverhältnis kaum freiwillig, und wer nicht einwilligt, fällt aus der Messung — womit die Messung nichts mehr aussagt.

Die Abwägung nach lit. f fällt umso leichter, je weniger personenbezogen ausgewertet wird. Genau dort setzt der **Datenschutz- und Mitbestimmungsmodus** an.

### Was die Software dazu beiträgt

| DSGVO-Anforderung | Umsetzung |
|---|---|
| **Art. 5 Abs. 1 lit. c** — Datenminimierung | Auswertung auf Gruppenebene mit k-Anonymität; unterhalb der Schwelle (Vorgabe: 5 Personen) gibt es keine Aufschlüsselung. Client-Fingerprinting ist **ab Werk aus**. |
| **Art. 5 Abs. 1 lit. e** — Speicherbegrenzung | Aufbewahrungsfrist mit automatischer **Anonymisierung** statt Löschung: die Kennzahl bleibt, der Personenbezug fällt weg |
| **Art. 15/17** — Auskunft und Löschung | Bis zur Anonymisierung beauskunftbar; danach ist der Bezug unwiderruflich fort — das ist der Zweck der Regel, keine Lücke |
| **Art. 25** — Datenschutz durch Voreinstellung | Der Modus ist eine serverseitige Sperre, die auch für Administratoren gilt, kein Anzeigefilter |
| **Art. 32** — Sicherheit der Verarbeitung | Argon2id, Fernet-Verschlüsselung der Zugangsdaten, 2FA, Audit-Log — siehe [Sicherheitsüberblick](/reference/sicherheitsueberblick/) |
| **Art. 28** — Auftragsverarbeitung | Entfällt für die Plattform selbst: **selbstgehostet, kein Anbieterzugriff, keine Telemetrie**. Für SMTP-Versand oder ein externes LRS bleibt sie eure Aufgabe |
| **Art. 44 ff.** — Drittlandtransfer | Findet nicht statt, solange ihr keine externen Dienste anbindet |

### Datenschutzfolgenabschätzung

Eine **DSFA nach Art. 35 DSGVO** ist bei einer Phishing-Simulation ernsthaft zu prüfen: Die Aufsichtsbehörden führen die systematische Auswertung des Verhaltens von Beschäftigten in ihren Listen. Bei aktivem Datenschutzmodus sinkt das Risiko deutlich — eine Auswertung, die einzelne Personen technisch nicht ausweisen **kann**, ist etwas anderes als eine, die es könnte und verspricht, es nicht zu tun.

**Die DSFA bleibt eure Aufgabe.** Die Software liefert die Beschreibung der Verarbeitung, nicht deren Bewertung.

### Mitbestimmung

Eine Simulationsplattform ist eine **technische Einrichtung, die zur Verhaltens- oder Leistungsüberwachung geeignet ist** — damit greift **§ 87 Abs. 1 Nr. 6 BetrVG** beziehungsweise das jeweilige Personalvertretungsrecht. Der Betriebs- oder Personalrat ist **vor** dem Start einzubeziehen, nicht nach der ersten Kampagne.

Im Quellcode liegen unter `compliance/` Vorlagen für eine **Betriebsvereinbarung** und eine **Datenschutz-Übersicht**, deutsch und englisch. Sie beschreiben, was die Software erzwingt — sie sind keine Rechtsberatung.

Details: [Datenschutz & Mitbestimmung](/reference/datenschutz/).

## ISO/IEC 27001:2022

Für ein zertifiziertes ISMS ist Awareness kein Randthema, sondern in Hauptteil und Anhang verankert.

**Hauptteil:**

- **7.2 Kompetenz** und **7.3 Bewusstsein** — Beschäftigte müssen die Informationssicherheitspolitik kennen und ihren Beitrag verstehen. Die Nachweise sind bei jedem Audit gefragt.
- **9.1 Überwachung und Messung** — die Klickquote im Zeitverlauf ist eine der wenigen Awareness-Kennzahlen, die sich überhaupt sinnvoll messen lässt.
- **10.2 Fortlaufende Verbesserung** — Baseline, Maßnahme, erneute Messung.

**Anhang A (Fassung 2022):**

| Control | Bezug |
|---|---|
| **A.6.3** Sensibilisierung, Ausbildung und Schulung | Der direkte Treffer: Kampagnen, Schulungsmodul, Nachweise |
| **A.6.8** Meldung von Informationssicherheitsereignissen | Der Meldeknopf in Outlook und Thunderbird — ein Meldeweg, der einen Klick kostet, wird auch benutzt |
| **A.5.24–A.5.26** Vorbereitung, Bewertung und Reaktion bei Vorfällen | Analyse gemeldeter Mails, Massen-Quarantäne als dokumentierte Reaktion |
| **A.8.7** Schutz vor Schadsoftware | Prüfung von Anhängen gegen ClamAV, eigene YARA-Regeln und die eigene MISP-Instanz |
| **A.5.7** Threat Intelligence | MISP-Abgleich gemeldeter Mails |

:::note
**Die Plattform ist nicht ISO-27001-zertifiziert und macht euch nicht zertifiziert.** Sie erzeugt Belege für einzelne Controls. Die Zertifizierung betrifft euer Managementsystem und wird von einer akkreditierten Stelle vergeben.
:::

## Weitere Rahmenwerke

- **DORA** (Verordnung (EU) 2022/2554, Art. 13 Abs. 6) — Finanzunternehmen müssen Sensibilisierungsprogramme zur digitalen operationalen Resilienz unterhalten, ausdrücklich auch für die Geschäftsleitung. Die Einordnung entspricht der zu NIS2.
- **TISAX / VDA ISA** — der Baustein zu Sensibilisierung und Schulung entspricht inhaltlich A.6.3 der ISO 27001.
- **NIST Cybersecurity Framework 2.0** — Kategorie **PR.AT** (Awareness and Training).
- **CIS Controls v8** — **Control 14**, Sensibilisierung, mit ausdrücklichem Bezug auf das Erkennen von Social Engineering.

## Welche Nachweise entstehen

Was ein Auditor oder eine Aufsichtsbehörde tatsächlich sehen will, und wo es liegt:

| Nachweis | Wo | Wofür |
|---|---|---|
| Kampagnenergebnis je Gruppe, im Zeitverlauf | Auswertung, CSV-Export | Wirksamkeit, ISO 9.1 |
| Schulungsnachweis je Person oder Gruppe | Schulungsmodul, PDF | ISO 7.2/7.3, NIS2 Art. 21 |
| Getrennter Nachweis für Leitungsorgane | Kennzeichen in der Empfängergruppe | § 38 BSIG, DORA Art. 13 Abs. 6 |
| Audit-Log über Konfiguration und Freigaben | Audit-Log | Rechenschaftspflicht, DSGVO Art. 5 Abs. 2 |
| Vier-Augen-Freigaben für aufgehobene Sperren | Audit-Log | Mitbestimmung, DSFA |

PDF-Nachweise werden als **PDF/A-3b** erzeugt und lassen sich **digital signieren**. Zur Reichweite einer selbstsignierten Signatur: [Sicherheitsüberblick](/reference/sicherheitsueberblick/).

Dass das Audit-Log selbst nicht nachträglich verändert wurde, lässt sich unabhängig nachrechnen: Die Einträge sind zu einer Hash-Kette verknüpft, und das mitgelieferte Prüfwerkzeug kommt ohne SentryMail aus. Siehe [Nachweiskette](/reference/nachweiskette/).

Zwei weitere Nachweise entstehen im Enterprise-Add-on: der [Kontroll-Wirksamkeitstest](/reference/kontrolltest/) belegt, welche Schutzschicht der Mailinfrastruktur was fängt, und der [NIS2-Meldeassistent](/reference/nis2-meldung/) dokumentiert Fristen und Meldeentscheidungen — ausdrücklich auch die Entscheidung *gegen* eine Meldung.

## Empfohlenes Vorgehen

1. **Rechtliches zuerst.** Datenschutz und Betriebs-/Personalrat **vor** der ersten Kampagne einbeziehen. Eine nachgereichte Betriebsvereinbarung kostet mehr Vertrauen, als die erste Simulation an Erkenntnis bringt.
2. **Datenschutzmodus einschalten**, bevor Daten entstehen. Er wirkt nicht rückwirkend auf bereits Erhobenes.
3. **Baseline messen** — ohne Vorankündigung an die Belegschaft, aber mit Wissen der Gremien.
4. **Regelmäßig wiederholen** und Vorlagen variieren. Eine Kampagne pro Jahr misst Glück, keine Awareness.
5. **Mit Schulung nachbereiten.** Die Simulation ist der Einstieg, nicht das Ziel.
6. **Dokumentieren, solange die Daten noch da sind.** Die Aufbewahrungsfrist anonymisiert automatisch.

## Grenzen

- **Kein Ersatz für ein ISMS**, für technische Schutzmaßnahmen (Mailfilter, MFA, EDR) oder für eine Gap-Analyse.
- **Keine Zertifizierung, kein Testat.** Siehe den Hinweis oben.
- **Die DSFA und die Wahl der Rechtsgrundlage bleiben eure Entscheidung.** Die Software beschreibt die Verarbeitung, sie bewertet sie nicht.
- **Ergebnisse nicht zur individuellen Sanktionierung nutzen.** Abgesehen von der arbeitsrechtlichen Seite: Wer eine Abmahnung fürchtet, meldet den nächsten Vorfall nicht mehr — und die Meldequote ist die wertvollere der beiden Kennzahlen.

---

*Siehe auch: [Datenschutz & Mitbestimmung](/reference/datenschutz/) · [Sicherheitsüberblick](/reference/sicherheitsueberblick/) · [Funktionen](/reference/funktionen/)*
