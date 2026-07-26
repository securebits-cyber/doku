---
title: "Kontroll-Wirksamkeitstest"
description: "Messen, welche Schutzschicht der eigenen Mailinfrastruktur was fängt — mit harmlosen Payloads gegen ein dediziertes Testpostfach."
sidebar:
  order: 7
---

Eine Awareness-Simulation misst, wie Menschen reagieren. Dieser Test misst etwas anderes: **welche Schutzschicht was fängt**, bevor überhaupt ein Mensch etwas sieht.

Beides zusammen ergibt erst ein Bild. Eine hohe Klickrate hinter einem Gateway, das nichts filtert, ist eine andere Aussage als dieselbe Rate hinter einem gut eingestellten — und nur die zweite ist ein Awareness-Problem.

Der Test gehört zum **Enterprise-Add-on**.

## Das Sicherheitsnetz

:::danger[Ausschließlich ein dediziertes Testpostfach]
Der Test verschickt Nachrichten, die ein Gateway als Angriff erkennen soll. An einen echten Menschen wäre das keine Messung, sondern ein Vorfall.

Das ist **keine organisatorische Zusage, sondern serverseitig erzwungen**: Vor jedem Lauf wird die Zieladresse gegen alle drei Stellen geprüft, an denen Personen im System stehen — Kampagnen-Empfänger, Gruppenmitglieder und Benutzerkonten. Ein Treffer verweigert den Lauf.
:::

Zwei Details, die dabei zählen:

- Die Prüfung greift **schon beim Speichern** der Einstellung, nicht erst beim Lauf. Sie erfahren sofort, dass die Adresse einem Menschen gehört — nicht erst, wenn Sie den Test starten wollen.
- Sie greift **vor dem Verbindungsaufbau**. Würde erst beim Senden geprüft, wäre die erste Nachricht schon unterwegs.

Der Vergleich ist case-insensitiv: Adressen kommen aus CSV-Importen und Verzeichnisdiensten, und mit einem Großbuchstaben ließe sich das Netz sonst umgehen.

## Die Testbatterie

Acht Stufen, in `backend/…/data/control_tests.json` als **pflegbare Datendatei** — neue Stufen sind eine neue Zeile, kein Codeeingriff.

| Stufe | Geprüfte Schicht |
|---|---|
| Display-Name-Spoofing | Anti-Spoofing / Header-Analyse |
| Homoglyph-Domain | Lookalike-Domain-Erkennung |
| SPF-Fehlschlag | SPF-Prüfung |
| Gebrochene DKIM-Signatur | DKIM-Prüfung |
| EICAR-Testdatei | Virenscanner |
| Makro-Dokument | Dateityp-Filter |
| Passwortgeschütztes Archiv | Archiv-Behandlung |
| HTML-Smuggling | Inhaltsanalyse |

### Die Payloads sind bewusst harmlos

:::caution[Was hier ausdrücklich nicht passiert]
- **EICAR statt Schadcode** — die genormte Testsignatur, die jeder Scanner erkennen muss und die nichts tut.
- **Makro-Dokument ohne Makro** — geprüft wird, ob das Gateway den Dateityp erkennt, nicht ob es Makrocode analysiert. Dafür bräuchte es ein funktionsfähiges Makro, und das hat in einem Testwerkzeug nichts zu suchen.
- **HTML-Smuggling ohne automatischen Download** — das Muster, nicht die Nutzlast.
- **Passwortgeschütztes Archiv** mit einer Textdatei darin. Das Passwort steht im Klartext in der Mail: Ein Prüfer soll den Anhang öffnen können, es ist kein Geheimnis.

Gemessen wird die Erkennungsleistung, nicht Schadwirkung.
:::

## Das Ergebnis lesen

:::note[Hier ist blocked das gute Ergebnis]
`blocked` heißt: nicht angekommen, also **gefangen** — die Schutzschicht hat gegriffen. `delivered` heißt: durchgelassen.

Das ist die umgekehrte Lesart der [Zustelldiagnose](/guides/zustellung/) und wird zuverlässig falsch gelesen, wenn man es nicht dazuschreibt.
:::

Weitere Zustände: `pending` (noch unterwegs — 45 Minuten Karenz, weil Greylisting und Sandboxing beide verzögern) und `rejected_by_relay` (das eigene Relay hat abgewiesen, bevor das Gateway die Nachricht sah — auch das ist ein Ergebnis).

Ein IMAP-Problem beim Auslesen des Testpostfachs wird **nie** als Testergebnis gewertet. Alles andere würde ein funktionierendes Gateway fälschlich als wirksam ausweisen.

## BSI-Zuordnung

Jede Stufe ist Grundschutz-Bausteinen zugeordnet — APP.5.3.A4 (Schadprogramme im E-Mail-Verkehr), APP.5.3.A5 (Authentisierung von Absendern), NET.1.1.A3 (Sicherheitsrichtlinie für das Netz). Die Zuordnung liegt als eigene Datendatei, nicht im Code: Bausteine werden fortgeschrieben, und die Zuordnung ist eine fachliche Aussage.

:::caution[Die Zuordnung ist ein Vorschlag]
Sie ersetzt keine Prüfung durch den Verantwortlichen. Ob eine Anforderung erfüllt ist, entscheidet sich nicht an einer bestandenen Teststufe. Der Hinweis steht mit im Bericht.
:::

Das Ergebnis fließt als Artefakt in die [Compliance-Nachweise](/reference/compliance/).
