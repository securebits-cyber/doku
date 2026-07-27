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

### Die Aufklärungsseite trägt kein Formular

Der Klick auf die Datei landet auf der **Landing Page der Kampagne**. Die Bibliothek liefert dafür drei fertige Seiten (Kategorie *USB-Drop*): eine ausführliche Aufklärungsseite, einen Kurzhinweis und eine Fassung mit Meldeweg.

Alle drei kommen **ohne Eingabefelder** — anders als die Anmeldemasken zu den Mail-Vorlagen. Drei Gründe:

1. **Gemessen ist schon alles.** Der Befund lautet „Datenträger angesteckt und Datei geöffnet". Eine Anmeldemaske danach ändert am Ergebnis nichts.
2. **Es gäbe niemanden, dem das Passwort gehört.** Der Datenträger kennt nur den Fundort. Ein abgeschicktes Passwort läge als echtes Geheimnis in der Datenbank, ohne zuordenbar zu sein — Schaden ohne Erkenntnis.
3. **Der Moment ist der Lehrmoment.** Wer gerade begriffen hat, dass er einen fremden Stick angesteckt hat, ist aufnahmefähig. Ihn stattdessen nach dem Passwort zu fragen, verspielt die Gelegenheit.

Wer die Eskalation trotzdem messen will, klont eine der Anmeldeseiten aus der Bibliothek und setzt sie als Landing Page der Kampagne — dann aber bewusst und mit der Folge, dass ein Passwort erfasst wird, das niemandem zuzuordnen ist.

### Eine USB-Simulation kennt niemanden

Jeder Datenträger trägt ein Token für den **Fundort**, nicht für eine Person. Wer den Stick gefunden hat, weiß die Software nicht. Damit entstehen hier **keine personenbezogenen Daten**, und die Einzelpersonen-Sperre des Datenschutzmodus läuft ins Leere, weil es nichts gibt, worauf sie greifen könnte.

Das ist kein Zufall, sondern der Grund, warum diese Simulation auch in mitbestimmungssensiblen Häusern durchführbar ist.

### Getrennt ausgewertet

Berichte und Control-Center führen USB-Drops **getrennt von den Mail-Kampagnen**. Zusammengezählt entstünden Zahlen, die nichts bedeuten: Ein Fundort ist kein Empfänger, ein Datenträger wird nicht *zugestellt*, und zwei nie geöffnete Datenträger drücken die Öffnungsrate einer Mail-Kampagne, mit der sie nichts zu tun haben.

Konkret:

- **Gesamtzahlen, Raten und Risikoverteilung** gelten für Mail-Kampagnen.
- Das **Control-Center** zeigt für Drops einen eigenen Block: Kampagnen, ausgelegte Datenträger und wie viele davon geöffnet wurden.
- Jede **Kampagnenzeile im Bericht** nennt ihre Art.
- Aus dem **Human Risk Management** und der Liste *Nicht bestanden* bleiben Drops ganz heraus.

:::note[Der letzte Punkt folgt aus dem Abschnitt davor]
Beide Auswertungen sind personenbezogen. Ein Datenträger kennt aber niemanden — stünde er dort, behauptete die Auswertung eine Person, die es nicht gibt, und der Fundort erschiene dort, wo sonst ein Name steht.
:::

Erkannt wird eine Drop-Kampagne an ihren Empfängerzeilen, nicht am Kanal: Deren Adressen enden auf `.invalid` (nach RFC 2606 reserviert und nie zustellbar), es steht also kein Postfach dahinter. Der Kanal gehört zum Enterprise-Add-on, und die Auswertung im Kern darf davon nicht abhängen.

:::caution[Anonymisierte Kampagnen sind keine Datenträger]
Die [Aufbewahrungsfrist](/reference/datenschutz/) schreibt Adressen ebenfalls auf `.invalid` um. Dort **stand** aber eine Person, und ihre Statistik gehört weiter in die Mail-Zahlen. Eine Zeile zählt deshalb nur als Datenträger, wenn sie nicht anonymisiert ist — sonst verschwänden die Kennzahlen anonymisierter Kampagnen aus der Auswertung, ohne dass jemand etwas gelöscht hätte.
:::

### Ablauf

Alles im Kampagnen-Assistenten, ohne Seitenwechsel:

1. **Kampagnen → Neue Kampagne**, Name vergeben und als **Kanal** `USB-Drop` wählen.
2. Was der Kanal nicht braucht, sperrt sich daraufhin selbst: **Vorlage**, **Sending Profile**, **Empfängergruppen** und **Zeitplanung**. Es wird nichts versendet, und die Fundorte treten an die Stelle der Empfänger.
3. Die **Landing Page** bleibt wählbar — sie ist das Ziel des Klicks, wenn jemand die Datei öffnet. Ohne sie läuft der Fund ins Leere.
4. Nach dem Anlegen erscheinen die **Fundorte** direkt darunter, je Zeile einer.
5. Das ZIP herunterladen: ein Ordner je Datenträger, darin genau eine Datei, dazu eine Liesmich-Datei mit der Zuordnung Ordner → Fundort.
6. Sticks bespielen und auslegen. Die Auswertung zeigt je Fundort, ob geöffnet wurde.

Später erreichbar ist derselbe Schritt über *Weitere Kanäle*, wo auch die Auswertung bestehender Datenträger liegt.

Die Fundorte gehören vorab mit der Interessenvertretung abgestimmt; Sozialräume und persönliche Arbeitsplätze bleiben sinnvollerweise ausgenommen.

---

*Siehe auch: [Datenschutz & Mitbestimmung](/reference/datenschutz/) · [Funktionen](/reference/funktionen/) · [Meldung & Analyse](/reference/meldung-analyse/)*
