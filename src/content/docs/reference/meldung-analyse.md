---
title: "Meldung & Analyse"
description: "Verdächtige E-Mails melden, automatisch auswerten und zu Wellen zusammenfassen."
sidebar:
  order: 5
---

Beschäftigte melden eine verdächtige Mail, SentryMail wertet sie automatisch aus und fasst gleichartige Meldungen zu Wellen zusammen. Damit wird das Produkt vom Awareness-Werkzeug zum Zulieferer für die Vorfallsbehandlung nach NIS2 Art. 21 Abs. 2 lit. b.

| Baustein | Edition |
|---|---|
| Meldeweg (Eingang, Speicherung, Deduplizierung) | **Business** |
| Automatische Analyse, Wellen, Anhang-Prüfung | **Enterprise** |

---

## Meldeweg

Aktuell wird die gemeldete Mail als **`.eml`-Datei** unter *Gemeldete Mails* hochgeladen. Der **Mail-Report-Button** für Outlook und Thunderbird ist die vorgesehene Vorstufe, braucht aber ein Codesigning-Zertifikat mit mehreren Wochen Beschaffungsvorlauf. Wenn er kommt, liefert er in denselben Eingang — nur die Quelle ändert sich, nicht das Datenmodell.

**Die Originaldatei bleibt gespeichert.** Eine Analyse, die nur abgeleitete Felder kennt, ließe sich später nicht mit besseren Regeln wiederholen, und für die Vorfallsbehandlung ist das Original der eigentliche Beleg.

**Mehrfachmeldungen zählen hoch, statt Duplikate anzulegen.** Erkannt wird das über den SHA-256 der Rohbytes. Eine Welle wird typischerweise von vielen gleichzeitig gemeldet; die Meldungszahl ist das erste grobe Signal für ihren Umfang.

Melden dürfen alle Rollen — sonst meldet niemand.

> **Verhältnis zum Datenschutzmodus:** Die Sperre für Einzelpersonen-Auswertungen greift hier bewusst **nicht**. Sie schützt vor der Auswertung des Verhaltens Beschäftigter in Awareness-Simulationen; eine gemeldete Phishing-Mail ist Vorfallsbehandlung und damit ein anderer Zweck. Wer gemeldet hat, wird gespeichert — ohne diese Zuordnung ließe sich weder nachfragen noch die meldende Person informieren. Siehe [Datenschutz & Mitbestimmung](/reference/datenschutz/).

---

## Automatische Analyse

Jede Meldung wird beim Eingang ausgewertet. Aufklappen der Zeile zeigt das Ergebnis.

### Authentifizierung

SPF, DKIM und DMARC werden aus dem `Authentication-Results`-Header des empfangenden Servers gelesen — **keine eigene Prüfung**: die müsste den DNS-Zustand zum Empfangszeitpunkt kennen und wäre nachträglich weder zuverlässig noch aussagekräftig.

Fehlt der Header, steht dort **„nicht angegeben"** und nicht „bestanden". Der Unterschied zwischen *geprüft und bestanden* und *nicht prüfbar* entscheidet bei der Triage.

### Absender-Ungereimtheiten

| Befund | Bedeutung |
|---|---|
| `display_name_spoofing` | Der Anzeigename nennt eine andere Adresse als der tatsächliche Absender — der häufigste Trick |
| `reply_to_mismatch` | Eine Antwort ginge an eine fremde Domain |
| `return_path_mismatch` | Der Rückweg weicht vom Absender ab |

### Adressen

Enthaltene URLs werden **entschärft** gespeichert und angezeigt (`hxxp://`, `[.]`) und nirgends verlinkt. Beim Sichten einer Phishing-Mail soll niemand mit einem Fehlklick auf der Angreiferseite landen — und kein Mailclient oder Ticketsystem soll die Adresse in einen Link verwandeln.

### Anhänge

Erfasst werden Name, Typ, Größe und **SHA-256**. Ausführbare Endungen (`.exe`, `.js`, `.hta`, `.lnk` …) erreichen allein die Stufe *hoch*: Die Mail wurde bereits von einem Menschen als verdächtig gemeldet, und ein legitimer ausführbarer Anhang ist die seltene Ausnahme. Archive wiegen schwächer, weil sie oft harmlos sind.

### Bewertung

Der Score ist **regelbasiert und erklärbar**. Jeder Befund liefert seine Regel, sein Gewicht und eine Begründung mit — wer die Bewertung anzweifelt, sieht sofort, woher sie kommt. Ein Blackbox-Score wäre für die Vorfallsbehandlung wertlos.

---

## Wellen

Meldungen mit gleichem normalisiertem Betreff und gleicher Absenderdomain bilden eine **Welle**. Antwort- und Weiterleitungspräfixe (`AW:`, `Re:`, `Fwd:`) werden dabei entfernt, damit sie dieselbe Welle nicht auseinanderreißen.

Bewusst **nicht** die vollständige Absenderadresse: Angreifer variieren den lokalen Teil (`no-reply`, `service`, `info`) bei identischer Welle. Und bewusst nicht der Inhalt — schon ein personalisierter Anrede-Name macht jede Mail einzigartig, womit das Clustering nichts mehr zusammenfassen würde.

Die Liste steht oben auf der Seite *Gemeldete Mails*, sortiert nach Zahl der Meldungen: Was am breitesten gestreut wurde, steht oben.

---

## Anhang-Prüfung mit ClamAV

**Optional und selbst gehostet.** Unter *Einstellungen → Anhang-Prüfung* wird ein ClamAV im eigenen Netz eingetragen (Standardport 3310). Anhänge verlassen die Instanz nicht — es gibt bewusst keine Cloud-Abfrage.

Beispiel für den Compose-Stack:

```yaml
services:
  clamav:
    image: clamav/clamav:stable
    restart: unless-stopped
    networks: [humanshield]
```

> **Ist der Scanner nicht erreichbar, gelten Anhänge als „nicht geprüft" — niemals als sauber.** Eine falsche Entwarnung wäre die gefährlichste Meldung, die dieses Modul erzeugen könnte.

Die Schaltfläche *Verbindung prüfen* schickt das **EICAR-Testmuster**. Erst wenn der Scanner den Testfund meldet, ist die Kette nachweislich in Ordnung — eine bloße TCP-Verbindung würde das nicht belegen.

Ein Fund wiegt 100 Punkte und hebt die Meldung sofort auf *hoch*.

**YARA** ist vorgesehen, aber noch nicht enthalten: Es braucht Regeln, die der Betreiber selbst mitbringt, und ohne die wäre das Feature eine leere Zusage. Die Anhang-Hashes werden bereits erhoben, damit ein zweiter Prüfer sich ohne Schemaänderung ergänzen lässt.

---

## Noch nicht enthalten

- **Massen-Quarantäne** über Graph API bzw. Postfix/Dovecot — bewusst auf ein späteres Release verschoben. Der Eingriff in fremde Postfächer ist der weitreichendste Schritt dieser Welle und braucht eine eigene Abstimmung, auch mit der Interessenvertretung.
- **MISP-Anreicherung** — geplant als **optionale** Zuschaltung: Ohne eigene MISP-Instanz funktioniert alles Übrige unverändert. Externe Feeds bleiben laut Grundsatzentscheidung Opt-in und pro Instanz abschaltbar.
- **Mail-Report-Button** — wartet auf das Codesigning-Zertifikat.

---

*Siehe auch: [Datenschutz & Mitbestimmung](/reference/datenschutz/) · [Funktionen](/reference/funktionen/) · [NIS2 und BSI](/reference/nis2-und-bsi/)*
