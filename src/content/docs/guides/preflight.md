---
title: "Kampagnen-Preflight"
description: "Regeln für den Kampagnenstart festlegen, den Pflichtdialog verstehen und die Vier-Augen-Freigabe nutzen."
sidebar:
  order: 4
---

Eine Phishing-Simulation ist ein Eingriff in den Arbeitsalltag. Wer sie startet, sollte vorher wissen, wie viele Menschen sie erreicht, zu welcher Uhrzeit, wer davon in den letzten Wochen schon dran war — und ob das Thema zumutbar ist.

Der Preflight ist der Pflichtdialog, der diese Fragen beantwortet, **bevor** der Versand läuft. Er gehört zur **Open-Core-Version** und braucht keine Lizenz.

:::danger[Verhaltensänderung durch dieses Update]
Ohne bestätigten Preflight startet keine Kampagne mehr. Bestandskampagnen müssen den Dialog einmal durchlaufen. Das ist beabsichtigt — der Sinn des Dialogs ist, dass jemand hingesehen hat, und das lässt sich nicht nachträglich herstellen.
:::

## 1. Regeln festlegen

Unter *Einstellungen → Kampagnen-Preflight*. Alle Vorgaben sind so gewählt, dass ein Update das Verhalten bestehender Installationen **nicht** ändert: Ruhezeiten aus, Cooldown 30 Tage, Zweitfreigabe beim Admin.

### Zeitzone zuerst

:::caution[Voreingestellt ist UTC]
Wir verdrahten keine Region. Ohne eigene Zeitzone greifen Ruhezeiten und Sperrfenster zur falschen Tageszeit — und zwar unauffällig. Setzen Sie den IANA-Namen: `Europe/Berlin`, `Europe/Vienna`, `Europe/Zurich`.
:::

Eine unbekannte Zeitzone fällt auf UTC zurück und blockiert nichts: Ein Konfigurationsfehler darf keinen Kampagnenstart aufhalten.

### Ruhezeiten

Kein Versand außerhalb der Arbeitszeit. Eine Simulation um drei Uhr nachts ist keine Awareness-Maßnahme, sondern eine Störung — und im mitbestimmten Betrieb ein vermeidbarer Konflikt.

Ein Fenster **über Mitternacht** (22:00–06:00) ist der Normalfall und wird ausdrücklich unterstützt. Entweder beide Zeiten setzen oder beide leer lassen; ein halbes Fenster wird abgelehnt, weil es beim Prüfen nie greifen würde.

### Cooldown

Mindestabstand zwischen zwei Simulationen für **dieselbe Person**, Vorgabe 30 Tage. Wer alle zwei Wochen getestet wird, lernt nichts dazu, sondern gewöhnt sich an Misstrauen gegenüber der eigenen IT.

Gezählt werden Personen, nicht Vorgänge: Wer in drei alten Kampagnen war, ist trotzdem eine Person. Und nur **tatsächlich versendete** Kampagnen zählen — eine geplante, nie versendete Kampagne hat niemanden behelligt. `0` schaltet die Prüfung ab.

### Sperrfenster

Benannte Zeiträume, in denen nichts startet: Betriebsversammlung, Jahresabschluss, Systemumstellung. Anders als die Ruhezeiten ein einmaliger Zeitraum mit Anlass.

### Wer die Zweitfreigabe erteilt

`Admin` oder `Datenschutzbeauftragter / Personalrat`. Auf die zweite Option gestellt liegt die Freigabe bei der **Betriebsratsrolle** — die vorgesehene Verzahnung mit dem [Datenschutz- und Mitbestimmungsmodus](/reference/datenschutz/).

## 2. Risikoklasse der Köder-Themen

Gepflegt **an der Vorlage**, nicht an der Kampagne: Das Thema hängt am Template.

| Klasse | Beispiele | Wirkung |
|---|---|---|
| **Hoch** | Gehalt, Bonus, Kündigung, Abmahnung, Gesundheit, Todesfall, Stellenabbau | Zweitfreigabe erforderlich |
| **Mittel** | Vorgesetzte, Rechnung, Mahnung, Vertrag, Bewerbung, Passwortablauf | nur Hinweis im Dialog |
| **Niedrig** | Paketzustellung, Newsletter, Umfrage, Software-Update, Kantine | Regelfall |

Themen der Klasse *Hoch* rühren an existenzielle oder sehr persönliche Sorgen. Ein solcher Köder landet nicht als Übung, sondern als echte Nachricht — auch nach der Auflösung bleibt etwas hängen.

:::note[Nur *Hoch* erzwingt eine Freigabe]
Würde jede Klasse eine verlangen, wird die Freigabe zur Formalie, die man wegklickt — und verliert genau die Wirkung, um die es geht.
:::

Die Themenliste ist eine pflegbare Datendatei im Repository (`backend/app/data/risk_themes.json`) und ausdrücklich nur ein Vorschlag. Welches Thema in Ihrer Organisation heikel ist, entscheiden Sie. Maßgeblich ist die Klasse, die an der Vorlage gesetzt ist.

## 3. Der Pflichtdialog

Erscheint beim Klick auf *Senden* und zeigt Empfängerzahl (nach Abzug der Ausschlüsse), betroffene Gruppen, Versandzeitpunkt, Risikoklasse und die Befunde.

### Was blockiert, was warnt

| Befund | Wirkung |
|---|---|
| Keine Empfänger | **blockiert** |
| Fehlende oder abgelehnte Zweitfreigabe bei hoher Klasse | **blockiert** |
| Ruhezeiten | warnt |
| Aktives Sperrfenster | warnt |
| Cooldown-Verletzung | warnt |
| Fehlgeschlagener [Zustell-Selbsttest](/guides/zustellung/) | warnt |
| Bevorstehendes Sperrfenster | Hinweis |

:::note[Eine Warnung ist eine Warnung]
Die Entscheidung, trotzdem zu starten, bleibt beim Betreiber — Sie kennen Ihren Betrieb besser als das Produkt. Nur ein harter Befund hält wirklich auf.
:::

Geprüft wird der **geplante Startzeitpunkt**, nicht der Moment des Hinsehens. Sonst meldete der Dialog Ruhezeiten für den falschen Zeitpunkt und läge systematisch verkehrt herum.

### Ausschlüsse

Gruppen lassen sich direkt im Dialog ausschließen. Der Ausschluss wirkt beim Versand; die Empfängerliste bleibt unangetastet, damit ein Wiedereinschließen keine Neuanlage erfordert.

:::danger[Kein Feld für den Grund eines Ausschlusses]
Ausgeschlossen wird ausschließlich über die Gruppenzugehörigkeit. Ein Freitextfeld wäre schnell mit Elternzeit, Krankheit oder einem laufenden Verfahren gefüllt — besonders schutzwürdige Daten, für die es hier keinen Zweck gibt. Wer diese Information braucht, führt sie außerhalb dieses Systems.
:::

Jede Änderung an der Kampagne oder ihren Ausschlüssen setzt die Bestätigung zurück: Sie galt für einen Stand, den niemand mehr sieht.

## 4. Vier-Augen-Freigabe

Bei hoher Risikoklasse beantragt der Planende die Freigabe **mit Begründung** — eine Freigabe ohne Anlass wäre eine Formalie. Entschieden wird von einer anderen Person in der konfigurierten Rolle.

:::danger[Wer beantragt, entscheidet nicht]
Das ist der ganze Zweck der Übung. Gesichert an drei Stellen: durch die Rollenprüfung, durch eine eigene Prüfung im Endpunkt und durch eine Bedingung in der Datenbank. Die Regel hängt nicht allein an der Anwendungslogik.
:::

Antrag, Entscheidung, Ablehnung und Begründung stehen im Audit-Log.

Ein **Vorlagenwechsel widerruft** die Freigabe — eine andere Vorlage ist ein anderer Köder, möglicherweise mit anderer Risikoklasse. Eine reine Umbenennung nicht: Sonst wäre das Verfahren eine Schikane, und Schikane erzeugt Umgehung.

## Reihenfolge in der Praxis

1. **Einmalig:** Zeitzone setzen, Ruhezeiten und Cooldown festlegen, Zweitfreigabe zuordnen.
2. **Bei Bedarf:** Sperrfenster für bekannte Termine eintragen.
3. **Je Vorlage:** Risikoklasse des Themas setzen.
4. **Vor jedem Start:** Dialog durchlesen, Ausschlüsse setzen, bei hoher Klasse Freigabe einholen, bestätigen.
