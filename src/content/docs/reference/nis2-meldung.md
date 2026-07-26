---
title: "NIS2-Meldeassistent"
description: "Fristen, Erheblichkeits-Vorprüfung und Entwurfstexte für die Meldung eines Vorfalls — ohne automatische Übermittlung."
sidebar:
  order: 8
---

Wer meldepflichtig ist, hat ab Kenntnis eines erheblichen Vorfalls **24 Stunden** für die Frühwarnung, **72 Stunden** für die Folgemeldung und **einen Monat** für den Abschlussbericht. Die Uhr läuft, während man noch versucht zu verstehen, was passiert ist.

Der Meldeassistent hält diese Fristen nach, strukturiert die Erheblichkeits-Abwägung und erzeugt Entwurfstexte. Er gehört zum **Enterprise-Add-on** und setzt die [Threat-Analytics-Pipeline](/reference/meldung-analyse/) voraus.

## Vier harte Grenzen

:::danger[Es gibt keine automatische Übermittlung]
SentryMail sendet **nichts** an das BSI-Meldeportal und nichts an eine Aufsichtsbehörde. Es existiert kein Endpunkt dafür, und es soll keiner entstehen.

Die Ausgabe ist ein Entwurf zum Herunterladen. Die Meldung reicht die verantwortliche Stelle selbst ein — eine automatische Meldung nähme ihr eine Entscheidung ab, die ausschließlich ihr zusteht.
:::

:::danger[Keine Rechtsberatung]
Weder die Checkliste noch der Entwurf bewerten, ob eine Meldepflicht besteht. Die Checkliste **strukturiert** die Abwägung; sie rechnet nichts aus. Der Hinweis steht in der Oberfläche, in jedem Export und in jeder API-Antwort — nicht im Kleingedruckten.
:::

:::caution[Auch die Entscheidung gegen eine Meldung wird dokumentiert]
Eine Begründung ist in **beide** Richtungen Pflicht. Genau dieser Nachweis fehlt im Prüfungsfall regelmäßig: Dass jemand hingesehen und begründet abgewogen hat, lässt sich hinterher nicht mehr herstellen — und ohne ihn steht die Frage im Raum, ob überhaupt jemand hingesehen hat.
:::

:::note[Die Uhr läuft in Kalendertagen]
Wochenenden und Feiertage zählen mit. Eine Frist, die am Freitagabend beginnt, endet am Samstagabend — nicht am Montag. Eine Werktagsrechnung wäre bequem und falsch.
:::

## Der Kenntniszeitpunkt

Alle Fristen laufen ab **Kenntnis**, nicht ab Erfassung. Beides fällt auseinander: Wer Sonntagnacht Kenntnis erlangt und Montag früh erfasst, hat 24 Stunden *weniger*, nicht mehr.

Der Zeitpunkt ist deshalb ein eigenes, von Hand setzbares Feld. Er darf nicht in der Zukunft liegen — das wäre die einfachste Art, die Uhr auszuhebeln.

## Ablauf

1. **Vorgang anlegen.** Von Hand, mit Bezug auf die bestätigte Analyse. Es gibt bewusst keine Automatik: Eine Meldepflicht entsteht nicht aus einem Score.
2. **Erheblichkeit prüfen.** Acht geführte Fragen — Betriebsstörung, finanzielle Verluste, Schäden bei Dritten, personenbezogene Daten, abgeflossene Zugangsdaten, Ausbreitungsgefahr, grenzüberschreitende Wirkung, Anhaltspunkte für eine rechtswidrige Handlung.
3. **Entscheiden.** Melden oder nicht — mit Begründung.
4. **Entwürfe schreiben.** Je Stufe die Felder des Meldeportals, vorbefüllt mit dem, was aus dem Vorgang hervorgeht. Was eine **Bewertung** wäre — Schweregrad, Auswirkungen — bleibt leer: Das ist die Aussage der verantwortlichen Stelle.
5. **Einreichen und vermerken.** Sie reichen ein; im Assistenten vermerken Sie, dass es geschehen ist.

Fragen und Portalfelder liegen als pflegbare Datendateien. Rechtslage und Formulare ändern sich — dafür soll kein Release nötig sein.

## Der DSGVO-Strang läuft daneben

Sind personenbezogene Daten betroffen, entsteht **zusätzlich** eine Meldepflicht nach Art. 33 DSGVO: 72 Stunden an die zuständige **Landesaufsichtsbehörde** — nicht an das BSI.

:::caution[Eine Meldung ersetzt nie die andere]
Der DSGVO-Strang ist im Assistenten ein **eigener Vorgang** mit eigener Uhr, eigenen Feldern und anderem Adressaten. Er erscheint bewusst nicht als vierte NIS2-Stufe: Eine gemeinsame Liste lädt genau zu der Verwechslung ein, die das Gesetz nicht verzeiht. Das Einreichen der NIS2-Folgemeldung weist den DSGVO-Strang **nicht** als erledigt aus.
:::

## Eskalation

Unter *Einstellungen → Eskalationskontakte* werden benannte Rollen hinterlegt, jede **mit Vertretung**. Erinnert wird bei der Hälfte und bei 80 Prozent der Frist sowie beim Überschreiten — jede Stufe genau einmal.

Die Vertretung wird **immer** mitbenachrichtigt, nicht erst bei ausbleibender Reaktion: Eine Frist, die an einem Urlaub scheitert, ist genau der Fall, für den die Eskalation gedacht ist.

Eine Eskalation, die im Minutentakt mahnt, wird ignoriert — und dann auch die, auf die es ankommt. Deshalb je Stufe nur eine Meldung.

Anträge, Entscheidungen und Vermerke stehen in der [Nachweiskette](/reference/nachweiskette/).
