---
title: "Sicherheitsüberblick"
description: "Wie SentryMail mit Zugangsdaten, personenbezogenen Daten und fremden Inhalten umgeht — und wie das geprüft wird."
sidebar:
  order: 4
---

:::caution[Was dieses Dokument ist — und was nicht]
Dies ist eine **Selbstauskunft des Herstellers**, kein Prüfbericht einer unabhängigen Stelle. Es hat **kein** externes Penetrationstest-Team und **keine** Zertifizierungsstelle geprüft; es gibt kein Testat und keine Bescheinigung.

Beschrieben ist, wie die Software gebaut ist und wie wir sie prüfen. Wer eine unabhängige Bewertung braucht — etwa für eine Lieferantenprüfung —, sollte einen eigenen Test beauftragen. Der Quelltext des Kerns ist offen und lässt sich dafür vollständig einsehen.
:::

## Der Ausgangspunkt: Selbst gehostet

SentryMail läuft vollständig in der Infrastruktur des Betreibers. Es gibt keinen Herstellerzugriff, keine Telemetrie und keine Cloud-Komponente, ohne die die Software nicht arbeitet. Kampagnendaten, Empfängerlisten und Nachweise verlassen die Installation nicht.

Die einzige nach außen gerichtete Verbindung ist die **Lizenzprüfung** der kostenpflichtigen Add-ons: Die Instanz holt beim Lizenzserver ein kurzlebiges, signiertes Lease. Geprüft wird lokal gegen den öffentlichen Schlüssel — der Lizenzserver muss für den laufenden Betrieb nicht erreichbar sein. Der reine Open-Core-Betrieb kommt ganz ohne diese Verbindung aus.

## Anmeldung und Sitzungen

| Baustein | Umsetzung |
|---|---|
| Passwörter | Argon2id (OWASP-Empfehlung) |
| Sitzung | httpOnly-Cookie, dazu CSRF-Token im Double-Submit-Verfahren |
| Zwei-Faktor | Authenticator-App oder E-Mail-Code; Backup-Codes nur als Hash gespeichert, verbrauchte Codes werden entwertet |
| Zweistufiger Login | Zwischen Passwort und Faktor liegt ein kurzlebiger, gescopeter Token, der keinen regulären API-Zugriff erlaubt |
| Optional | OIDC und SAML 2.0 als Zweitmethode; Passkeys (WebAuthn) als zweiter Faktor |

Administratoren können Zwei-Faktor verpflichtend machen — für alle oder nur für Administratoren.

## Umgang mit Geheimnissen

**Laufzeit-Zugangsdaten** — SMTP der Sending Profiles, LDAP-Bind, OIDC-Secret, TOTP-Secret, Token für SCIM, Melde-Button, SMS-Gateway und Learning Record Store — liegen **Fernet-verschlüsselt** in der Datenbank. Der Schlüssel wird aus `SECRET_KEY` abgeleitet.

Über die API werden sie **nie im Klartext zurückgegeben**; die Oberfläche erhält nur ein `has_*`-Kennzeichen. Ein einmal gesetztes Geheimnis lässt sich ersetzen, aber nicht auslesen.

**Betreiber-Geheimnisse** (`SECRET_KEY`, Datenbankpasswort) kommen aus `.env` oder einem Secrets-Manager. Beides ist möglich, weil die Anwendung sie als Umgebungsvariablen liest — woher die stammen, entscheidet der Betrieb. Siehe [Sicherheit](/reference/sicherheit/).

## Datensparsamkeit und Mitbestimmung

Der **Datenschutzmodus** ist keine Anzeigeeinstellung, sondern eine serverseitige Sperre — sie greift auch gegenüber Administratoren:

- **Einzelpersonen-Auswertungen** sind gesperrt. Die Sperre liegt an **einem** Durchsetzungspunkt, den jede betroffene Route aufruft; verteilte Prüfungen wären früher oder später auseinandergelaufen.
- **k-Anonymität** für Gruppenauswertungen: Unterhalb der Schwelle (Standard 5 Personen) erscheint „unter Schwellenwert" statt einer Aufschlüsselung. Gezählt werden Personen, nicht Ereignisse.
- **Vier-Augen-Freigabe** zur befristeten Aufhebung: beantragt von einem Administrator, entschieden von einem Datenschutzbeauftragten. Antragsteller und Entscheider können nicht dieselbe Person sein — das erzwingt die Datenbank.
- **Aufbewahrungsfrist** mit automatischer **Anonymisierung** statt Löschung. Sie ist nicht umkehrbar; danach lässt sich auch ein Auskunftsersuchen nach Art. 15 DSGVO nicht mehr beantworten — das ist der Zweck der Regel, kein Versäumnis.
- **Client-Fingerprinting** ist im Auslieferungszustand **aus** und braucht eine ausdrückliche Freigabe.

Vorlagen für Betriebsvereinbarung und Datenschutz-Kurzdarstellung liegen dem Quelltext bei (`compliance/`, deutsch und englisch). Sie beschreiben, was die Software durchsetzt — sie sind kein Rechtsrat.

## Fremde Inhalte

Der heikelste Teil der Anwendung: Sie verarbeitet Material, das Angreifer geschickt haben, und Inhalte, die der Betreiber eingekauft hat.

### Gemeldete Phishing-Mails

Die Originaldatei bleibt erhalten, wird aber nie ausgeführt oder gerendert. Enthaltene Adressen werden **entschärft** gespeichert und angezeigt (`hxxp://`, `[.]`) und nirgends verlinkt — beim Sichten soll niemand mit einem Fehlklick auf der Angreiferseite landen.

### Anhang-Prüfung

Optional gegen ein eigenes **ClamAV** und gegen **YARA**-Regeln des Betreibers, dazu Abgleich mit einer eigenen **MISP**-Instanz. Durchgehend gilt:

> **Nicht erreichbar heißt „nicht geprüft" — nie „sauber".** Eine falsche Entwarnung wäre die gefährlichste Meldung, die diese Module erzeugen könnten.

YARA-Regeln liefern wir bewusst **nicht** mit: Ein Regelsatz ist eine inhaltliche Aussage darüber, was als verdächtig gilt. Zudem stehen verbreitete freie Sammlungen unter nicht-kommerziellen Lizenzen.

### SCORM-Schulungen (Beta)

Ein SCORM-Paket ist fremdes HTML und JavaScript, häufig eingekauft. Zwei Entscheidungen begrenzen das:

- **Kein Pfad aus dem Archiv wird je ein Dateipfad.** Die Dateinamen aus dem ZIP landen als Datenbankzeilen, jede Datei liegt unter einem serverseitig erzeugten, inhaltsadressierten Schlüssel. Ein „Zip Slip" ist damit nicht abgewehrt, sondern strukturell unmöglich. Manifeste liest `defusedxml`; ausführbare Dateien, Zip-Bomben und übergroße Pakete werden abgelehnt.
- **Der Kurs läuft in einem abgeschotteten Rahmen ohne `allow-same-origin`.** Er bekommt eine eigene, undurchsichtige Herkunft und erreicht die Sitzung der schulungspflichtigen Person nicht. Den Fortschritt meldet er per `postMessage`; erst die Anwendung gibt ihn mit der Sitzung weiter, sodass im Kursinhalt kein Geheimnis liegt.

Der Preis: Pakete, die auf `localStorage` bestehen, laufen nicht. Der Zugriff auf die Sitzung wäre der teurere Verlust.

### USB-Simulation

Es entstehen **keine ausführbaren Dateien** — kein Makro, kein Skript, keine Verknüpfung, die ein Programm startet. Erzeugt wird eine HTML-Datei, die den Browser auf die Aufklärungsseite schickt. Wer eine Datei baut, die auf fremden Rechnern Code ausführt, hat ein Schadprogramm geschrieben, auch mit guter Absicht.

Jeder Datenträger trägt eine Kennung für den **Fundort**, nicht für eine Person. Es entstehen dort keine personenbezogenen Daten.

## Eingriffe in fremde Systeme

Zwei Funktionen greifen über die eigene Installation hinaus. Beide sind bewusst eng geführt:

**Massen-Quarantäne** verschiebt eine bestätigte Phishing-Welle aus allen Postfächern in einen Quarantäne-Ordner. Gesucht wird **ausschließlich über die Message-ID** — der Betreff einer Welle taucht auch in legitimen Antworten darauf auf. Es wird **nur verschoben, nie gelöscht**. Ein Probelauf ist strukturell verpflichtend: Die Ausführung referenziert einen gespeicherten Vorschau-Datensatz, ohne den technisch nichts auslösbar ist. Beide Schritte landen im Audit-Log.

**Simulationen per SMS und Chat** gehen nur an **dienstliche** Endgeräte, solange nichts anderes ausdrücklich freigegeben ist. Die Freigabe privater Geräte ist möglich, im Auslieferungszustand aus und wird protokolliert.

## Nachweise

Berichte und Zertifikate werden als **PDF/A-3b** mit eingebetteten Schriften ausgegeben. Optional werden sie **digital signiert**; das Zertifikat erzeugt die Instanz selbst.

> Selbstsigniert heißt **unverändert, nicht beglaubigt**. Ein Reader zeigt „Signaturgültigkeit unbekannt", weil ihm die ausstellende Stelle nicht bekannt ist. Wer eine Vertrauenskette braucht, verteilt das Zertifikat als vertrauenswürdig oder verwendet eines der eigenen PKI.

Schulungsnachweise tragen zusätzlich einen **Integritäts-Hash** über Zuweisung, Person, Kursversion, Zeitpunkt und ein Server-Geheimnis — nachträgliche Änderungen am Datensatz werden damit erkennbar.

## Wie geprüft wird

| Maßnahme | Umfang |
|---|---|
| Automatisierte Tests | Kern und beide Add-ons, verpflichtend im PR |
| Typprüfung und Build des Frontends | verpflichtend im PR |
| **CodeQL** (GitHub Code Scanning) | verpflichtend im PR; ein Fund blockiert den Merge |
| Signierte Commits, DCO | verpflichtend |
| Änderungen über Pull Requests | direkte Pushes auf den Hauptzweig sind gesperrt |

Ergänzend werden Änderungen sicherheitsorientiert durchgesehen — mit besonderem Blick auf die oben genannten Stellen, an denen fremde Inhalte oder fremde Systeme berührt werden.

## Bekannte Grenzen

Ehrlichkeit an dieser Stelle ist nützlicher als eine lückenlose Erfolgsmeldung:

- **Kein unabhängiger Penetrationstest.** Siehe den Hinweis am Anfang.
- **Die Sicherheit der Installation liegt beim Betreiber.** TLS, Netzwerktrennung, Betriebssystem-Härtung, Sicherung von `SECRET_KEY` und Datenbank sind nicht Teil der Software.
- **Ein Verlust von `SECRET_KEY` macht alle verschlüsselten Zugangsdaten unlesbar.** Ein Datenbank-Backup ohne ihn ist nur die halbe Wiederherstellung.
- **SCORM-Fortschritt ist nicht manipulationssicher.** Was „bestanden" heißt, entscheidet der Kurs, und der läuft im Browser der Person. Die serverseitig zusammengeführte Video-Abdeckung ist die belastbarere Quelle; die vom Kurs gemeldete Bearbeitungszeit steht im Nachweis daneben.
- **Der Melde-Token des Mail-Report-Buttons liegt auf jedem Arbeitsplatz.** Das ist bei einem kontenlosen Meldeweg unvermeidlich. Begrenzt wird es durch Abschaltbarkeit, erlaubte Absenderdomains und ein Meldelimit je Person und Stunde; ein neues Token entwertet das alte sofort.
- **Veraltete ClamAV-Signaturen sind schlimmer als keine.** In Installationen ohne Internetzugang gehört entweder ein interner Spiegel eingebunden oder die Prüfung ausgeschaltet.

## Schwachstelle melden

Sicherheitsrelevante Funde bitte **nicht** über ein öffentliches Issue melden, sondern an die in `SECURITY.md` des Repositorys genannte Adresse. Wir bitten um koordinierte Offenlegung und melden uns zurück, bevor Details veröffentlicht werden.

---

*Siehe auch: [Sicherheit](/reference/sicherheit/) · [Datenschutz & Mitbestimmung](/reference/datenschutz/) · [Architektur](/reference/architektur/)*
