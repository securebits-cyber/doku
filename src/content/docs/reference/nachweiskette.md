---
title: "Nachweiskette und Audit-Log"
description: "Hash-Verkettung des Audit-Logs, das exportierbare Nachweispaket und die unabhängige Prüfung der Kette ohne installiertes SentryMail."
sidebar:
  label: "Nachweiskette"
  order: 5
---

„Revisionssicher" ist in Produktbeschreibungen ein häufiges Wort und selten eine überprüfbare Aussage. Ein Protokoll, dessen Unversehrtheit nur der Hersteller bestätigen kann, hilft im Prüfungsfall wenig.

SentryMail verkettet deshalb jeden Audit-Eintrag mit dem Hash seines Vorgängers — und liefert ein **eigenständiges Prüfwerkzeug** mit, das ohne SentryMail auskommt. Beides gehört zur **Open-Core-Version**.

## Wie die Kette funktioniert

Jeder Eintrag im Audit-Log trägt drei zusätzliche Angaben:

| Feld | Bedeutung |
|---|---|
| `seq` | lückenlos aufsteigende Position |
| `prev_hash` | Hash des Vorgängers (beim ersten Eintrag 64 Nullen) |
| `entry_hash` | SHA-256 über den eigenen Inhalt **einschließlich** `prev_hash` |

Daraus folgt:

- Ein **geänderter** Eintrag passt nicht mehr zu seinem `entry_hash`.
- Ein **entfernter** Eintrag hinterlässt eine Lücke in `seq` *und* einen gebrochenen Verweis beim Nachfolger.
- **Vertauschte** Einträge brechen die Verkettung, selbst wenn beide für sich unverändert sind.

Rückwirkend reparieren ließe sich das nur, indem man alle nachfolgenden Einträge neu berechnet — was spätestens beim Vergleich mit einem früher exportierten Paket auffällt.

:::caution[Was bewusst nicht gehasht wird]
Die Verknüpfung zum Benutzerkonto (`actor_id`) geht **nicht** in den Hash ein. Wird ein Konto gelöscht, setzt die Datenbank diese Verknüpfung auf leer — wäre sie Teil des Hashes, hätte **jede Kontolöschung rückwirkend die Kette zerrissen**, ohne dass jemand etwas manipuliert hätte. Gehasht werden stattdessen die Schnappschüsse von Name und E-Mail-Adresse, die genau dafür im Log stehen.
:::

:::note[Was die Kette nicht behauptet]
Die Verkettung beginnt mit dem Update, das sie einführt. Bestehende Einträge werden in ihrer zeitlichen Reihenfolge eingekettet — die Kette belegt damit, dass **seit diesem Zeitpunkt** nichts mehr verändert wurde. Für die Zeit davor kann sie nichts bezeugen.
:::

## Zustand prüfen

Unter *Einstellungen → Aktivität* steht der Kettenzustand: Zahl der Einträge und ob die Kette unversehrt ist. Ein Bruch wird mit der betroffenen Position benannt, ohne dass vorher etwas exportiert werden muss.

## Nachweispaket exportieren

Ebenda: **Nachweispaket exportieren**, oder per API `GET /audit-events/evidence-package`. Das ZIP enthält:

| Datei | Inhalt |
|---|---|
| `events.jsonl` | ein Eintrag je Zeile, mit Hashes |
| `manifest.json` | Kettenkopf, Eintragszahl, Algorithmus, Formatversion, Exportzeitpunkt |
| `README.md` | Anleitung zum Prüfen, zweisprachig |

Zugriff haben Administratoren **und** der Datenschutzbeauftragte — dessen [Kontrollrolle](/reference/datenschutz/) ist ohne unabhängig prüfbaren Nachweis wertlos.

## Unabhängig prüfen

Das Werkzeug liegt im Quellbaum unter `tools/sentrymail-verify/verify.py`:

```bash
python verify.py sentrymail-nachweis-20260726-120000.zip
python verify.py --lang en paket.zip
```

| Exit-Code | Bedeutung |
|---|---|
| `0` | Kette in Ordnung |
| `1` | Bruch gefunden — Details auf der Ausgabe |
| `2` | Paket unlesbar oder Format unbekannt |

:::tip[Eine Datei, keine Abhängigkeiten]
Nur Python-Standardbibliothek. Keine Installation, keine Datenbank, kein Netz, kein SentryMail. Ein automatischer Test stellt sicher, dass das so bleibt.

**Diese Datei darf zusammen mit dem Paket weitergegeben werden.** Genau darum geht es: Ein Prüfer soll die Kette nachrechnen können, ohne den Hersteller fragen zu müssen — und den Quelltext des Prüfwerkzeugs selbst lesen können.
:::

Ein Paket mit **neuerer Formatversion** wird abgelehnt (Exit 2), nicht für gebrochen erklärt. Eine falsche Zusicherung wäre schlimmer als keine.

## Aufbewahrungsfrist und Kette

Die Kette hebelt keine Löschpflicht aus. Gilt eine Aufbewahrungsfrist, hat sie Vorrang — sie muss die Kette aber nicht zerstören.

**Gelöscht wird der Inhalt, erhalten bleiben Position, Zeitpunkt und Verkettung.** Der Eintrag bleibt als *Tombstone* stehen: Beweisbar bleibt, **dass** und **wann** etwas geschah, ohne personenbezogene Daten über die Frist hinaus vorzuhalten. Der Verifier rechnet bei Tombstones den Inhalts-Hash nicht nach — er kann nicht mehr stimmen und soll es nicht.

Würde man die Zeilen stattdessen löschen, entstünde eine Lücke, die der Verifier zu Recht als Bruch meldet.

:::caution[Eigene Frist, bewusst getrennt]
Unter *Einstellungen → Datenschutz* gibt es ein eigenes Feld *Aufbewahrungsfrist für Audit-Inhalte*. Vorgabe ist leer — die Inhalte bleiben.

Getrennt von der Frist für Kampagnendaten, weil das Audit-Log der Nachweis ist, den Sie im Prüfungsfall brauchen. Es zusammen mit den Kampagnendaten stillschweigend mitzulöschen wäre eine böse Überraschung.
:::

## Zeitstempel eines Dritten (Enterprise)

Die Kette belegt, dass Einträge **untereinander** unverändert sind. Sie belegt nicht, **wann** sie entstanden — die Zeitstempel darin stammen vom Server selbst, und wer den Server kontrolliert, kontrolliert die Uhr.

Ein Zeitstempeldienst nach **RFC 3161** schließt diese Lücke: Er bestätigt, dass ein bestimmter Kettenkopf zu einem bestimmten Zeitpunkt bereits existierte. Unter *Einstellungen → Zeitstempeldienst* trägt der Betreiber die URL seines Dienstes ein — kommerziell, behördlich oder selbst betrieben. **Kein Anbieter ist im Code verdrahtet.** Ohne Konfiguration entfällt die Funktion.

Gestempelt wird in einem einstellbaren Abstand (Vorgabe täglich) sowie auf Knopfdruck vor einem Audit.

:::caution[SentryMail prüft das Token nicht kryptografisch]
Geprüft wird nur, ob der Dienst die Anfrage angenommen hat (`PKIStatus`). Das Token wird **unverändert** gespeichert und lässt sich herunterladen; die eigentliche Prüfung macht der Auditor selbst:

```bash
openssl ts -verify -in anker.tsr -queryfile anker.tsq -CAfile tsa-ca.pem
```

Eine halbe Prüfung im Produkt wäre schlechter als gar keine — sie würde Sicherheit vortäuschen, die niemand nachgerechnet hat.
:::

Ein **fehlgeschlagener Stempel** wird als Anker mit Status *failed* festgehalten, nicht verschwiegen: Eine Lücke in der Ankerfolge ist selbst eine Aussage, und der Betreiber soll sehen, dass sein Dienst nicht antwortet.

## Auditoren-Zugang (Enterprise)

Ein externer Prüfer braucht Einsicht in das Audit-Log, aber kein Konto mit Verwaltungsrechten und keinen dauerhaften Zugang. Unter *Einstellungen → Auditoren-Zugänge* wird die Gewährung erteilt:

- **befristet** — das Ablaufdatum ist Pflichtfeld
- **ausschließlich lesend** — es gibt keinen schreibenden Endpunkt
- **eigenständig protokolliert** — wer wann was eingesehen hat, steht wiederum in der Kette

:::note[Bewusst keine neue Rolle]
Der Zugang hängt an der Gewährung, nicht an einem Kontotyp. Damit läuft er mit dem Datum von selbst aus, statt als vergessene Rolle liegenzubleiben — der häufigste Weg, auf dem befristete Prüferzugänge dauerhaft werden.
:::

Ein Widerruf **löscht** die Gewährung nicht, sondern markiert sie: Dass ein Zugang bestand, ist selbst Teil des Nachweises. Der [Datenschutzmodus](/reference/datenschutz/) gilt weiter — ein Auditor sieht das Audit-Log, keine Einzelpersonen-Auswertungen.

## Verhältnis zu NIS2 und BSI

Die Kette liefert die technische Grundlage für den Nachweis, dass Protokolle nicht nachträglich verändert wurden — ein wiederkehrender Prüfpunkt bei ISO 27001 und im BSI-IT-Grundschutz. Sie ersetzt keine rechtliche Bewertung und trifft keine Aussage darüber, ob Ihr Aufbewahrungskonzept vollständig ist. Siehe auch die [Compliance-Einordnung](/reference/compliance/).

Die Enterprise-Bausteine oben — Zeitstempel eines Dritten und befristeter Auditoren-Zugang — schließen die beiden Lücken, die eine reine Hash-Kette offen lässt: den Zeitpunkt gegenüber Dritten und die Einsicht ohne Verwaltungsrechte.
