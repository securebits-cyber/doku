---
title: "Weitere Kanäle"
description: "Simulationen per SMS, Matrix, Nextcloud Talk und als ausgelegter Datenträger."
sidebar:
  order: 6
---

Phishing findet längst nicht mehr nur per Mail statt. Wer nur Mail simuliert, übt genau den Weg, auf den die Leute schon achten — und lässt den aus, über den sie tatsächlich hereinfallen. SentryMail kann Simulationen deshalb auch per **SMS**, über **Matrix**, über **Nextcloud Talk** und als **ausgelegten Datenträger** durchführen.

| Kanal | Edition |
|---|---|
| SMS, Matrix, Nextcloud Talk, USB-Drop | **Enterprise** |

Tracking, Landing Page und Auswertung sind dieselben wie bei der Mail. Nur die Zustellung unterscheidet sich — und der Text, denn eine SMS ist kein nachgebautes Absender-Layout, sondern ein Satz mit einem Link.

---

## Dienstlich oder privat

> **Bespielt werden nur dienstliche Endgeräte, solange nichts anderes freigegeben ist.**

Eine Simulation auf das Diensthandy ist eine Betriebsangelegenheit. Eine auf die private Nummer ist es nicht — dafür braucht es eine eigene Grundlage. Im Adressverzeichnis trägt deshalb jeder Eintrag, ob es sich um ein dienstliches Gerät handelt; private Einträge werden übersprungen und im Ergebnis **benannt**, nicht stillschweigend ausgelassen.

Die Freigabe privater Endgeräte lässt sich einschalten, ist aber voreingestellt aus und wird im Audit-Log protokolliert. Ohne diese Grenze würde das Produkt eine arbeitsrechtliche Frage stillschweigend zugunsten des Betreibers entscheiden.

---

## SMS: eigenes Gateway

**Kein Anbieter ist fest verdrahtet.** Wer einen SMS-Dienst im Code hinterlegt, zwingt jeden Betreiber in dessen Vertrag. Stattdessen wird unter *Einstellungen → Zustellwege → SMS* ein **generisches HTTP-Gateway** beschrieben:

| Feld | Bedeutung |
|---|---|
| Adresse, Methode | Wohin und wie (POST/GET) |
| Anmeldung | keine, Basic, Bearer oder eigene Kopfzeile |
| Rumpf-Format | `json` oder `form` |
| Rumpf-Vorlage | Der Rumpf des Anbieters mit den Platzhaltern `{to}` und `{text}` |

Beispiel für einen Anbieter, der JSON erwartet:

```json
{"to": "{to}", "message": "{text}", "from": "Service"}
```

Damit passt jedes Gateway — auch eines im eigenen Haus an einem GSM-Modem. Die Werte werden **nach** dem Einsetzen kodiert: Eine Nachricht mit Anführungszeichen zerlegt das JSON des Anbieters nicht.

Rufnummern werden in **E.164** erwartet (`+4915112345678`). Ohne diese Prüfung landen Tippfehler beim Gateway und kosten je nach Vertrag Geld, ohne dass jemand etwas merkt.

---

## Matrix und Nextcloud Talk

Beides sind Dienste, die viele Organisationen ohnehin selbst betreiben — eine Simulation darüber läuft im eigenen Netz statt über einen fremden Messenger.

- **Matrix**: Adresse des Homeservers und ein Zugriffstoken eines Bot-Kontos. Je Empfänger wird ein **eigener Raum** angelegt, statt in eine bestehende Unterhaltung zu schreiben: Eine Simulation soll nicht in einem Verlauf landen, in dem zwischen echten und geübten Nachrichten niemand mehr unterscheidet.
- **Nextcloud Talk**: Adresse der Nextcloud und ein Konto mit Talk-Berechtigung. Die OCS-API verlangt die Kopfzeile `OCS-APIRequest: true` — sie wird automatisch gesetzt; ihr Fehlen ist sonst der häufigste Einrichtungsfehler.

---

## USB-Drop

Ein Datenträger wird ausgelegt — Parkplatz, Empfang, Besprechungsraum —, und gemessen wird, ob jemand ihn ansteckt und die Datei öffnet. Der klassische Weg in Netze, die per Mail gut geschützt sind.

### Es entstehen keine ausführbaren Dateien

Kein Makro, kein Skript, keine Verknüpfung, die ein Programm startet. Erzeugt wird eine schlichte **HTML-Datei**, die den Browser auf die Aufklärungsseite schickt. Das genügt für die Messung vollständig — und alles darüber hinaus wäre ein Werkzeug, das man nicht herstellt, nur weil man es könnte: Wer eine Datei baut, die auf fremden Rechnern Code ausführt, hat ein Schadprogramm geschrieben, auch mit guter Absicht.

### Eine USB-Simulation kennt niemanden

Jeder Datenträger trägt ein Token für den **Fundort**, nicht für eine Person. Wer den Stick gefunden hat, weiß die Software nicht. Damit entstehen hier **keine personenbezogenen Daten**, und die Einzelpersonen-Sperre des Datenschutzmodus läuft ins Leere, weil es nichts gibt, worauf sie greifen könnte.

Das ist kein Zufall, sondern der Grund, warum diese Simulation auch in mitbestimmungssensiblen Häusern durchführbar ist.

### Ablauf

1. Kampagne anlegen und als Kanal **USB** wählen.
2. Fundorte eintragen — je Zeile einer.
3. Das ZIP herunterladen: ein Ordner je Datenträger, darin genau eine Datei, dazu eine Liesmich-Datei mit der Zuordnung Ordner → Fundort.
4. Sticks bespielen und auslegen. Die Auswertung zeigt je Fundort, ob geöffnet wurde.

Die Fundorte gehören vorab mit der Interessenvertretung abgestimmt; Sozialräume und persönliche Arbeitsplätze bleiben sinnvollerweise ausgenommen.

---

*Siehe auch: [Datenschutz & Mitbestimmung](/reference/datenschutz/) · [Funktionen](/reference/funktionen/) · [Meldung & Analyse](/reference/meldung-analyse/)*
