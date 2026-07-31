---
title: "Meldung und Analyse verdächtiger Mails"
description: "Verdächtige E-Mails per Melde-Button einreichen, automatisch auswerten lassen – mit ClamAV, YARA und MISP – und zu Angriffswellen zusammenfassen."
sidebar:
  label: "Meldung & Analyse"
  order: 5
---

Beschäftigte melden eine verdächtige Mail, SentryMail wertet sie automatisch aus und fasst gleichartige Meldungen zu Wellen zusammen. Damit wird das Produkt vom Awareness-Werkzeug zum Zulieferer für die Vorfallsbehandlung nach NIS2 Art. 21 Abs. 2 lit. b.

| Baustein | Edition |
|---|---|
| Meldeweg (Eingang, Speicherung, Deduplizierung) | **Business** |
| Automatische Analyse, Wellen, Anhang-Prüfung | **Enterprise** |

---

## Meldeweg

Es gibt zwei Wege in dieselbe Ablage:

- **Mail-Report-Button** im Mailprogramm — der Weg für Beschäftigte. Ein Klick, fertig.
- **`.eml`-Upload** unter *Gemeldete Mails* — für angemeldete Benutzer, etwa wenn eine Meldung per Umweg ankommt.

Nur die Quelle unterscheidet sich, nicht das Datenmodell.

### Der Button meldet ohne Konto

Die meldenden Beschäftigten haben in aller Regel **kein** SentryMail-Konto — sie sind Empfänger, keine Benutzer. Ein Login im Add-in würde für jeden Melder ein Konto voraussetzen, das es nicht gibt, und niemand meldet, wenn er sich dafür erst anmelden muss.

Deshalb authentifiziert sich die **Instanz** über ein Melde-Token, nicht der Mensch über ein Passwort. Eingerichtet wird das unter *Einstellungen → Mail-Report-Button*. Das Token liegt damit auf jedem Arbeitsplatz — das ist beim kontenlosen Meldeweg unvermeidlich und wird an drei Stellen eingegrenzt:

| Grenze | Wirkung |
|---|---|
| Meldeweg abschaltbar | Ohne Aktivierung ist der Weg zu, auch wenn ein Token hinterlegt ist |
| Erlaubte Absenderdomains | Ein abhandengekommenes Token kann Meldungen keinen fremden Adressen zuschreiben |
| Meldungen je Person und Stunde | Ein abhandengekommenes Token kann die Ablage nicht volllaufen lassen |

Ein neues Token macht das alte sofort wertlos. Ob die Kette steht, zeigt das Feld *Letzte Meldung* auf derselben Seite — beim Einrichten die einzige verlässliche Rückmeldung.

### Drei Clients

| Client | Zertifikat | Voraussetzung |
|---|---|---|
| **Thunderbird** (MailExtension) | keines | — |
| **Outlook** (Office-Web-Add-in) | keines | Exchange oder Microsoft 365 |
| **Outlook** (VSTO) | Codesigning, zum Testen selbstsigniert | reine IMAP-/POP-Konten |

Für Outlook ist das **Web-Add-in der Standardweg**: SentryMail liefert das fertige Manifest mit eingetragener Adresse und Token selbst aus, verteilt wird es über das Microsoft 365 Admin Center bzw. die Exchange-Verwaltung. Das VSTO-Add-in ist der Ausweichweg für Postfächer ohne Exchange, wo Web-Add-ins nicht laufen — nur dieses eine braucht ein Zertifikat.

Thunderbird braucht **kein** Zertifikat: Eine MailExtension ist ein XPI, und für die Verteilung gibt es die Signatur über addons.thunderbird.net (kostenlos), das Ausrollen per `policies.json` oder die abschaltbare Signaturpflicht.

> **Die gemeldete Nachricht bleibt im Postfach stehen.** Sie beim Melden zu löschen wäre bevormundend und unnötig: Bestätigt sich der Angriff, holt die Massen-Quarantäne sie ohnehin aus *allen* Postfächern — und nicht nur bei der Person, die aufgepasst hat.

### Was gespeichert wird

**Die Originaldatei bleibt gespeichert.** Eine Analyse, die nur abgeleitete Felder kennt, ließe sich später nicht mit besseren Regeln wiederholen, und für die Vorfallsbehandlung ist das Original der eigentliche Beleg.

> **Eine Ausnahme beim VSTO-Add-in:** Outlook bewahrt bei IMAP- und POP-Konten das eingegangene MIME nicht byteweise auf. Dort wird die `.eml` aus dem **vollständigen Original-Kopfzeilenblock** plus Inhalt und Anhängen zusammengesetzt. Die Bewertung stützt sich fast vollständig auf die Kopfzeilen, und die bleiben unverändert — byteidentisch ist es aber nicht. Über Exchange (Web-Add-in) und in Thunderbird schon.

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

ClamAV liegt als **Compose-Profil** bei und ist damit im Auslieferungszustand aus:

```bash
docker compose --profile scanning up -d
```

Danach unter *Einstellungen → Anhang-Prüfung* Host `clamav`, Port 3310 eintragen.

> **Warum nicht immer an:** `clamd` hält die Signaturdatenbank vollständig im Speicher — real 1,5 bis 2 GB. Immer mitzulaufen würde die Mindestanforderung jeder Installation anheben, auch der vielen, die nie eine Mail melden.

In Installationen **ohne Internet** kommt `freshclam` nicht an die Signaturen, und die Datenbank veraltet still. Dort entweder einen internen Spiegel einbinden oder die Prüfung ausgeschaltet lassen — eine veraltete Signaturdatenbank ist schlimmer als keine, weil sie Sicherheit vortäuscht.

> **Ist der Scanner nicht erreichbar, gelten Anhänge als „nicht geprüft" — niemals als sauber.** Eine falsche Entwarnung wäre die gefährlichste Meldung, die dieses Modul erzeugen könnte.

Die Schaltfläche *Verbindung prüfen* schickt das **EICAR-Testmuster**. Erst wenn der Scanner den Testfund meldet, ist die Kette nachweislich in Ordnung — eine bloße TCP-Verbindung würde das nicht belegen.

Ein Fund wiegt 100 Punkte und hebt die Meldung sofort auf *hoch*.

---

## Anhang-Prüfung mit YARA

Ein zweiter, unabhängiger Prüfer neben ClamAV. Beide laufen nebeneinander und liefern getrennte Aussagen: ClamAV erkennt bekannte Schadsoftware anhand von Signaturen, YARA erkennt **Muster, die der Betreiber selbst beschreibt** — etwa Makros mit bestimmten Aufrufen oder Kennzeichen einer Kampagne, die gerade im eigenen Haus läuft.

### Die Regeln bringt der Betreiber mit

Das Regelverzeichnis ist im Auslieferungszustand **leer**, und das ist Absicht. Ein Regelsatz ist eine inhaltliche Aussage darüber, was als verdächtig gilt; ihn mitzuliefern hieße, diese Aussage für jeden Betreiber zu treffen.

Dazu kommt die Lizenzlage: Die verbreitetste freie Sammlung (`signature-base` von Florian Roth) steht unter **CC BY-NC** und darf in einem kostenpflichtigen Produkt nicht mitgeliefert werden. Andere Sammlungen mischen Lizenzen. Wer Regeln einbindet, soll das bewusst und mit Blick auf deren Lizenz tun.

### Einrichten

Regeldateien (`.yar`, `.yara`) in ein Verzeichnis legen und in den Backend-Container einhängen:

```yaml
services:
  backend:
    environment:
      ENTERPRISE_YARA_RULES_DIR: /rules
    volumes:
      - ./yara-rules:/rules:ro
```

Unterverzeichnisse werden mitgelesen. Änderungen greifen **ohne Neustart** — die Regeln werden neu übersetzt, sobald sich im Verzeichnis etwas ändert.

### Verhalten im Fehlerfall

| Lage | Ergebnis |
|---|---|
| Kein Regelverzeichnis oder leer | „nicht geprüft" — **nicht** „sauber" |
| Einzelne Regeldatei fehlerhaft | Die übrigen Regeln laufen weiter; der Fehler wird benannt |
| Alle Regeln fehlerhaft | „nicht geprüft" |
| Treffer | Befund mit 70 Punkten, hebt die Meldung auf *hoch* |

Eine einzelne kaputte Regel kippt nicht den ganzen Satz — sonst sucht der Betreiber im Dunkeln. Ein Treffer wiegt weniger als ein ClamAV-Fund (100 Punkte): Die Regel stammt aus dem eigenen Haus und kann breiter gefasst sein als eine Virensignatur.

---

## MISP-Anreicherung

**Vollständig optional.** Wer keine MISP-Instanz betreibt, verliert nur diesen Abschnitt — alles Übrige funktioniert unverändert. Es gibt keinen Ersatzdienst in der Cloud und keinen Pflicht-Abgleich.

Unter *Einstellungen → MISP* werden URL und ein API-Schlüssel mit Leserechten der **eigenen** Instanz eingetragen. Abgefragt werden die Indikatoren, die eine Meldung hergibt: die SHA-256 der Anhänge, die enthaltenen Adressen (im Original, nicht entschärft) und die Absenderdomain.

> **Abgefragt wird ausschließlich die eingetragene, selbst betriebene Instanz.** Ob diese externe Feeds einbindet, entscheidet ihr Betreiber. SentryMail fragt von sich aus nie einen fremden Dienst — eine Pflicht-Cloud-Abfrage würde den Self-Hosting-Anspruch aushebeln.

Ein Treffer wiegt 70 Punkte: Die Indikatoren stammen aus Vorfällen, die die Organisation selbst gepflegt hat, und sind damit belastbarer als jede Heuristik.

> **Ist die Instanz nicht erreichbar, steht dort „Abgleich nicht möglich" — nicht „nichts bekannt".** Dieselbe Regel wie bei der Anhang-Prüfung: Ein ausgefallener Abgleich darf nie wie ein geprüftes Ergebnis aussehen.

---

## Massen-Quarantäne

Ist eine Welle bestätigt, hilft die beste Analyse nichts, solange die Mail in hunderten Postfächern liegt. Die Massen-Quarantäne holt sie dort heraus — **verschoben in einen Quarantäne-Ordner, nie gelöscht**. Ein Fehlgriff bleibt damit korrigierbar; die Nachricht liegt weiter im Postfach der betroffenen Person, nur nicht mehr im Posteingang.

Unterstützt werden beide verbreiteten Umgebungen: **Microsoft 365** über die Graph API und **Postfix/Dovecot** über die doveadm-HTTP-API. Eingerichtet wird eines davon unter *Einstellungen → Quarantäne*; ohne Auswahl greift SentryMail auf kein Postfach zu.

### Gesucht wird nur nach der Message-ID

Der Betreff einer Welle taucht auch in legitimen Antworten und Weiterleitungen darauf auf — eine Suche danach würde fremde Post mit einsammeln. Gesucht wird deshalb ausschließlich nach der **Message-ID** der gemeldeten Nachricht. Meldungen ohne Message-ID lassen sich nicht quarantänisieren; das ist die gewollte Konsequenz.

### Der Probelauf ist Pflicht

Der Ablauf ist zweistufig und lässt sich nicht abkürzen:

1. **Probelauf** — sucht die Nachricht in allen Postfächern und zeigt, wo sie liegt. Es wird nichts verändert. Das Ergebnis wird als Datensatz gespeichert.
2. **Ausführung** — bezieht sich auf genau diesen gespeicherten Lauf und verschiebt die gefundenen Nachrichten.

Ohne gespeicherten Probelauf gibt es nichts auszuführen; die Ausführung eines bereits ausgeführten Laufs wird abgelehnt. Das ist keine Bildschirmwarnung, die sich wegklicken lässt, sondern die Struktur der Schnittstelle.

> **Ein gesperrtes Postfach bricht den Lauf nicht ab.** Bei tausend Postfächern ist immer eines nicht erreichbar. Ein Abbruch würde die übrigen Funde stehen lassen — der Fehler wird deshalb je Postfach vermerkt und der Lauf fortgesetzt.

### Berechtigungen

| Umgebung | Was gebraucht wird |
|---|---|
| Microsoft 365 | App-Registrierung mit der Anwendungsberechtigung `Mail.ReadWrite` |
| Postfix/Dovecot | doveadm-HTTP-API mit einem Konto, das `doveadm move` ausführen darf |

Bei Microsoft 365 gilt diese Berechtigung zunächst für **alle** Postfächer. Sie sollte über eine [Anwendungszugriffsrichtlinie](https://learn.microsoft.com/graph/auth-limit-mailbox-access) auf den nötigen Umfang begrenzt werden.

### Mitbestimmung

Der Zugriff auf fremde Postfächer ist der weitreichendste Eingriff des Produkts. Er gehört vor der Inbetriebnahme mit der Interessenvertretung abgestimmt — die Vorlage unter `compliance/` benennt ihn ausdrücklich. Jeder Probelauf und jede Ausführung landet mit Anzahl, Betreff und auslösender Person im Audit-Log; die Läufe selbst bleiben als Beleg erhalten.

---

## Noch nicht enthalten

- **VSTO-Add-in für Outlook ohne Exchange** — Quelltext liegt vor, ist aber noch nicht unter Windows kompiliert und getestet. Es ist der einzige Client, der ein Codesigning-Zertifikat braucht.

---

*Siehe auch: [Datenschutz & Mitbestimmung](/reference/datenschutz/) · [Funktionen](/reference/funktionen/) · [Compliance-Einordnung](/reference/compliance/)*
