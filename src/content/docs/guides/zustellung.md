---
title: "Zustellung"
description: "Allowlisting für das Mail-Gateway erzeugen, Zustellung vor dem Kampagnenstart prüfen und Zustellprobleme diagnostizieren."
sidebar:
  order: 3
---

Die häufigste Ursache für eine Kampagne, die scheinbar nicht ankommt, ist nicht SentryMail. Es ist das Mail-Gateway davor: Es hält die Simulation zurück — oder der Linkscanner klickt sie selbst an und erzeugt Klicks, die nie eine Person ausgelöst hat.

Der Zustellungs-Assistent besteht aus drei Teilen, die aufeinander aufbauen: **vorbereiten**, **prüfen**, **nachvollziehen**. Alle drei gehören zur **Open-Core-Version** und brauchen keine Lizenz.

Zu finden unter *Einstellungen → Zustellung*; die Diagnose zusätzlich auf der Ergebnisseite jeder Kampagne. Alle Funktionen sind Administratoren vorbehalten.

## 1. Allowlisting erzeugen

Der Generator erzeugt aus den Angaben der Instanz fertige Konfigurationsschnipsel bzw. Schrittfolgen für das Gateway. Mitgeliefert werden fünf Profile:

| Gateway | Form der Ausgabe |
|---|---|
| Exchange Online / Microsoft 365 | PowerShell |
| Postfix | Konfigurationsfragmente |
| Proofpoint | Schrittfolge |
| Sophos Email Security | Schrittfolge |
| Barracuda Email Gateway | Schrittfolge |

**Absenderdomain** und **Tracking-Domain** sind vorbefüllt — aus dem globalen SMTP und aus `APP_DOMAIN`. Die **Absender-IP** müssen Sie ergänzen: Bei einem externen SMTP-Anbieter ist das dessen Ausgangs-IP, nicht die Ihrer Instanz. Diesen Wert kennt nur der Anbieter, deshalb rät das System nicht.

:::danger[Immer Domain *und* IP eintragen]
Eine Freistellung nur über die Absenderdomain gilt auch für jeden Fremden, der diese Domain fälscht. Das öffnet ein Loch, das größer ist als das Problem, das es löst.
:::

:::caution[Tracking-Domain von der Linkprüfung ausnehmen]
Safe Links, URL Defense, Time-of-Click-Schutz und Ähnliches rufen Links selbst auf. Ohne Ausnahme entstehen Klicks ohne Nutzer, und jede Auswertung fällt zu hoch aus — die Kampagne sieht dann schlechter aus, als Ihre Belegschaft ist.
:::

Für Microsoft 365 nutzt das Profil den dafür vorgesehenen Weg (`New-PhishSimOverridePolicy` und `New-ExoPhishSimOverrideRule`) statt einer generischen Transportregel: Die Mail durchläuft weiterhin die Filter, wird aber nicht blockiert und nicht als Bedrohung gemeldet.

:::note[Vorschlag, keine fertige Konfiguration]
Menübezeichnungen und Befehle unterscheiden sich je nach Produktvariante und Version. Die Ausgabe ist für den Mailadministrator gedacht; maßgeblich bleibt die Herstellerdokumentation.
:::

### Weitere Gateways ergänzen

Die Profile sind **Datendateien**, kein Code: `backend/app/data/gateway_profiles/*.json`. Ein weiteres Gateway ist eine weitere Datei — kein Anbieter ist im Produktcode verdrahtet. Format und Platzhalter beschreibt die `README.md` im selben Verzeichnis.

Eine fehlerhafte Profildatei wird übersprungen und protokolliert; die übrigen Profile bleiben nutzbar.

## 2. Zustellung vor dem Start prüfen

Vor dem Kampagnenstart geht eine Probemail **über denselben Weg wie die Kampagne** an ein eigenes Postfach — das Kanarienpostfach. Kommt sie an, ist der Weg frei. Kommt sie nicht an, liegt es am Gateway und nicht an der Software.

Der Test läuft über das Sending Profile der Kampagne, nicht über einen Ersatzabsender. Ein Test über einen anderen Weg würde genau das nicht prüfen, worum es geht.

**Einrichtung:** Adresse des Kanarienpostfachs eintragen — ein eigenes Postfach, **nie** ein echter Empfänger. Der IMAP-Zugang ist optional; ohne ihn kann die Ankunft nicht bestätigt werden, ein gescheiterter Versand wird aber trotzdem erkannt. Die Zugangsdaten liegen verschlüsselt in der Datenbank und werden über die API nie zurückgegeben.

| Zustand | Bedeutung |
|---|---|
| Gesendet, Ankunft unbestätigt | Der Versand hat geklappt. Ohne IMAP bleibt es dabei. |
| Angekommen | Der Weg ist frei. |
| Nicht angekommen | Erst nach 30 Minuten. Greylisting verzögert regelmäßig um 5 bis 15 Minuten. |

:::note[Ein Fehlschlag blockiert den Start nicht]
Er warnt. Die Entscheidung, trotzdem zu starten, bleibt beim Betreiber — Sie kennen Ihr Gateway besser als das Produkt. Ohne eingetragene Adresse entfällt der Test kommentarlos; er ist eine Hilfe, keine Voraussetzung.
:::

Ist das Kanarienpostfach nicht erreichbar, bleibt der Test offen und der Grund wird festgehalten. Ein IMAP-Problem wird **nie** als Zustellfehler ausgewiesen — alles andere würde ein funktionierendes Gateway fälschlich anschwärzen.

## 3. Zustellprobleme diagnostizieren

Auf der Ergebnisseite jeder Kampagne. Ausgewertet werden drei Quellen.

### Zustellstatus je Empfänger

Der Versand speichert den SMTP-Statuscode. Der trägt die entscheidende Information:

- **4xx — vorübergehend.** Greylisting, Rate Control. Ein erneuter Versand genügt meist.
- **5xx — dauerhaft.** Postfach unbekannt, Absender blockiert, Anhang abgewiesen.

Kampagnen aus älteren Versionen tragen den Status nicht nach und werden entsprechend ausgewiesen.

### Greylisting

Ab drei vorübergehenden Ablehnungen wird es als solches benannt: Die Mails sind **verzögert, nicht verloren**. Einzelne 4xx sind Alltag, erst die Häufung ist ein Muster. Wer hier „nicht angekommen" liest, sucht an der falschen Stelle.

### DNS der Absenderdomain

| Befund | Bedeutung |
|---|---|
| Kein SPF-Eintrag | Viele Empfänger werten das als Fälschungsversuch. |
| Mehrere SPF-Einträge | Nach RFC 7208 ungültig. Viele Empfänger lehnen die Domain dann komplett ab — leicht zu übersehen, weil „SPF vorhanden" ja stimmt. |
| `-all` (hart) | Der Versandserver muss zwingend im Eintrag stehen. |
| `~all` (weich) | Üblich und unkritisch. |
| `+all` / `?all` | Erlaubt jeden Absender. Schützt nichts, schadet der Reputation. |
| DMARC `p=reject` | Passt die Absenderdomain nicht zu SPF/DKIM, wird hart abgelehnt — die häufigste Einzelursache. |
| DMARC `p=quarantine` | Landet im Spam-Ordner statt im Posteingang. |

**DKIM wird ausdrücklich als nicht prüfbar ausgewiesen.** Dafür braucht es den Selektor aus der Signatur der gesendeten Mail, nicht den DNS-Eintrag der Domain. Ein „nicht geprüft" ist ehrlicher als eine vorgetäuschte Prüfung.

Werden alle Empfänger angenommen und trotzdem kommt nichts an, liegt eine Filterung **nach** der Annahme vor — dann zurück zu Schritt 1.

:::note[Datenschutz]
Ausgewertet werden Statuscodes und DNS-Einträge, keine Empfängermerkmale. Das ist eine Zustellungs-, keine Personenauswertung — die k-Anonymitätsschwelle des [Datenschutzmodus](/reference/datenschutz/) greift hier nicht.
:::

## Reihenfolge in der Praxis

1. **Vor der ersten Kampagne:** Allowlisting erzeugen und dem Mailadministrator geben.
2. **Nach dessen Umsetzung:** Kanarienpostfach eintragen, Selbsttest laufen lassen.
3. **Wenn trotzdem etwas fehlt:** Diagnose auf der Ergebnisseite öffnen.
