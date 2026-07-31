---
title: "Schulungsmodul (LMS)"
description: "Selbstgehostete Pflichtschulungen mit Videos einrichten: Videospeicher, automatische Zuweisung, Verständnis-Quiz, Fristen und revisionssichere Zertifikate."
sidebar:
  label: "Schulungsmodul"
  order: 5
---

Das **Schulungsmodul (LMS – Learning Management System)** liefert die logische Folgemaßnahme zur Phishing-Simulation: Wer auffällig wird, bekommt automatisch eine **selbstgehostete Pflichtschulung mit Videos** zugewiesen — ohne Drittanbieter-CDN, mit revisionssicherem Nachweis.

:::note[Enterprise-Add-on]
Das LMS ist Teil des **Enterprise-Add-ons** und per Lizenz freigeschaltet. Ohne gültige Enterprise-Lizenz ist der Bereich gesperrt. Der Open-Core-Kern und das Business-Add-on enthalten das Modul nicht — siehe [Funktionen](/reference/funktionen/).
:::

## Was das LMS leistet

- **Videobasierte Pflichtschulungen** vollständig **selbstgehostet** — die Videos liegen im eigenen Speicher, es wird kein externes CDN kontaktiert.
- **Automatische Kurszuweisung** bei Unterschreiten eines **Awareness-Schwellwerts** (Human-Risk-Score) — riskante Personen werden ohne manuellen Aufwand eingeschult.
- **Manipulationssicheres Fortschritts-Tracking**: Es zählt nur die **tatsächlich gesehene Wiedergabezeit**; Vorspulen erfüllt die Anforderung nicht.
- **Verständnis-Quiz** je Kurs als Abschlusskontrolle.
- **Fristen mit Erinnerungen und Overdue-Eskalation**.
- **Revisionssichere Schulungs-Nachweise** als PDF mit Integritäts-Hash; sie bleiben auch **nach Ablauf der Lizenz** abrufbar.
- **Abschluss-Reporting** mit **CSV-Export** sowie Einbindung in das Enterprise-Reporting (Schulungsfortschritt, Zertifikatsstatus) auf der Berichte-Seite.

## Videospeicher konfigurieren (`.env`)

Der Ablageort der Schulungsvideos ist ein Betreiber-Wert und wird in der `.env` gesetzt — analog zu [GeoIP](/guides/konfiguration/#geoip--länder-statistik-optional). Zwei Backends stehen zur Wahl: das lokale Dateisystem (Default) oder ein S3-kompatibler Objektspeicher (z. B. ein **selbstgehostetes MinIO**).

```ini title=".env — lokales Dateisystem"
# Speicher-Backend: filesystem (Default) oder s3
LMS_STORAGE_BACKEND=filesystem

# Ablageort der Videodateien (als Volume in den Container gemountet)
LMS_MEDIA_DIR=/data/lms-media
```

```ini title=".env — S3-kompatibel (z. B. MinIO)"
LMS_STORAGE_BACKEND=s3

# S3-Zugang; die konkreten LMS_S3_*-Schlüssel (Endpoint, Bucket, Access-/Secret-Key,
# Region) entsprechen dem Standard-S3-Schema — Namen und Reihenfolge aus der
# .env.example des jeweiligen Releases übernehmen.
LMS_S3_ENDPOINT=https://minio.example.internal
LMS_S3_BUCKET=sentrymail-lms
LMS_S3_ACCESS_KEY=…
LMS_S3_SECRET_KEY=…
```

- Bei **`filesystem`** muss `LMS_MEDIA_DIR` als persistentes Volume gemountet sein, damit hochgeladene Videos ein Update des Stacks überstehen (siehe [Installation](/guides/installation/)).
- Bei **`s3`** bleibt der Speicher trotzdem in eigener Hand, wenn ein selbstgehostetes MinIO oder ein interner Objektspeicher verwendet wird — die Selbsthosting-Zusage bleibt gewahrt.
- Zugangsdaten liegen ausschließlich in der `.env`; sie werden nicht in der Datenbank abgelegt.

## Kurse und Videos bereitstellen

Im Dashboard verwaltet ein Admin die Schulungen im **Schulungs-Bereich** (Enterprise). Typischer Ablauf:

1. **Kurs anlegen** — Titel, Beschreibung und Sprache festlegen.
2. **Video hochladen** — die Datei landet im konfigurierten Speicher-Backend (Dateisystem oder S3); es wird kein externer Dienst eingebunden. Alternativ ein **SCORM-1.2-Paket** importieren (Beta, siehe unten).
3. **Verständnis-Quiz hinterlegen** — Fragen mit Antwortoptionen und Bestehensgrenze definieren.
4. **Bestehensregeln setzen** — erforderlicher Wiedergabe-Anteil des Videos plus Quiz-Ergebnis.

Erst wenn die geforderte Wiedergabezeit **tatsächlich gesehen** und das Quiz bestanden wurde, gilt der Kurs als abgeschlossen.

## SCORM-1.2-Pakete einbinden (Beta)

:::caution[Beta]
Die Funktion arbeitet, ist aber noch nicht mit einer Breite echter Autorenwerkzeuge erprobt. Vor dem Einsatz in einer Pflichtschulung mit dem eigenen Paket prüfen.
:::

Statt eines eigenen Videos kann ein Modul ein **SCORM-1.2-Paket** enthalten — ein ZIP-Archiv mit `imsmanifest.xml`. Damit lassen sich eingekaufte oder vorhandene Schulungen einbinden, statt sie selbst zu produzieren.

**Ein Modul ist entweder ein Video oder ein SCORM-Paket.** Beides zugleich hätte zwei Fortschrittsquellen für denselben Abschluss — welche gilt, wäre im Audit nicht zu begründen.

Der Import lehnt ab: SCORM 2004 (anderes Laufzeit-Datenmodell), ausführbare Dateien im Paket, Archive, die sich beim Entpacken stark aufblähen, Pakete über 500 MB oder 5000 Dateien und Pakete ohne vorhandenen Einstiegspunkt. Toleriert werden die Freiheiten echter Pakete: fehlender XML-Namensraum, `xml:base`, verschachtelte Gliederung, ein umschließender Ordner im ZIP.

### Wo der Kursinhalt läuft

Der Kurs läuft in einem abgeschotteten Rahmen **ohne `allow-same-origin`**. Kursinhalt ist fremdes JavaScript; käme er von derselben Herkunft wie SentryMail, könnte er das CSRF-Cookie lesen und mit der Sitzung der schulungspflichtigen Person beliebige Aufrufe machen.

Der Preis: Pakete, die auf `localStorage` bestehen, laufen darin nicht — in einer undurchsichtigen Herkunft wirft der Zugriff.

### Was der gemeldete Fortschritt wert ist

:::note
Der Kurs meldet seinen Bearbeitungsstand **selbst**. Das ist nicht manipulationssicher und kann es bei SCORM nicht sein: Was „bestanden" heißt, entscheidet der Inhalt, und der läuft im Browser der Person.
:::

Beim Video führt der Server die gesehenen Abschnitte selbst zusammen — das bleibt die belastbarere Quelle und wird durch SCORM nicht ersetzt. Für SCORM-Module wird die vom Kurs gemeldete **Bearbeitungszeit** mitgeführt und im Nachweis daneben ausgewiesen, damit ein „bestanden nach vier Sekunden" im Audit auffällt.

## Automatische Zuweisung nach Risiko

Das LMS knüpft an das **Human Risk Management** an ([Funktionen → Tracking & Ergebnisse](/reference/funktionen/#tracking--ergebnisse)):

- Ein **Awareness-Schwellwert** legt fest, ab welchem Risiko-Score eine Person eingeschult wird.
- Fällt der Score einer Person nach einer Kampagne unter diesen Wert (z. B. Klick oder Daten-Eingabe), wird der zugehörige Kurs **automatisch zugewiesen**.
- Alternativ lassen sich Kurse **manuell** an einzelne Personen oder Gruppen vergeben.

## Fristen, Erinnerungen, Eskalation

- Je Zuweisung gilt eine **Frist** bis zum Abschluss.
- Vor Fristablauf werden **Erinnerungen** versendet.
- Nach Überschreiten greift eine **Overdue-Eskalation** (z. B. Hinweis an Verantwortliche); überfällige Schulungen sind im Reporting sichtbar.

## xAPI-Export an einen Learning Record Store

Wer bereits einen LRS betreibt, will die Awareness-Schulung nicht getrennt vom Rest der Weiterbildung nachweisen. Unter **Einstellungen → xAPI-Export** wird die Adresse der xAPI-Schnittstelle (1.0.3) eingetragen, dazu Benutzer/Passwort oder ein Token.

Gemeldet werden **Zuweisung**, **Bearbeitung** und **Abschluss**, jeweils mit Kurs, Modul und der Kursversion — der Nachweis im LRS nennt damit denselben Stand wie der in SentryMail.

> **Exportiert werden ausschließlich Schulungsereignisse.** Ereignisse der Phishing-Simulation bleiben außen vor. Ein „hat geklickt" an einen fremden Speicher zu senden wäre genau die Einzelpersonen-Auswertung, die der Datenschutzmodus verhindern soll — und der LRS kennt dessen Sperren nicht.

### Wer im LRS steht

| Kennung | Bedeutung |
|---|---|
| **Pseudonym** (Voreinstellung) | Instanzweit stabile, nicht zurückrechenbare Kennung. Der LRS kann Verläufe je Person zusammenführen, ohne zu wissen, wer dahintersteht |
| **E-Mail-Adresse** | Klarnamen und Adressen verlassen die Instanz |

Die zurückhaltendere Einstellung ist die Voreinstellung: Ein LRS ist ein **weiterer Empfänger personenbezogener Daten**. Wer die Klarnamen dort braucht, schaltet das bewusst ein — die Umstellung wird im Audit-Log protokolliert, gehört mit der Interessenvertretung abgestimmt und ins Verarbeitungsverzeichnis.

### Zustellung

Statements werden **erst gespeichert und dann zugestellt**. Ein LRS ist ein Nachweissystem; ein Statement, das bei einem Netzwerkfehler verlorengeht, fehlt dort dauerhaft. Misslingt die Zustellung, versucht der Scheduler es erneut — bis zu fünfmal, danach bleibt das Statement sichtbar liegen, statt die Warteschlange still wachsen zu lassen. Die Statement-UUID bleibt über alle Versuche gleich, damit der LRS eine Wiederholung erkennt und kein Duplikat anlegt.

Offene und liegengebliebene Statements stehen auf der Einstellungsseite; **Jetzt nachreichen** stößt die Zustellung von Hand an und versucht auch Liegengebliebenes erneut — der übliche Fall nach einer korrigierten Zugangsdatenangabe.

Was **vor** dem Einschalten passiert ist, wird nicht nachträglich verschickt: Eine Warteschlange, die sich bei abgeschaltetem Export füllt, würde beim Einschalten die gesamte Vergangenheit an den LRS schicken, und damit rechnet niemand.

## Zertifikate & Nachweise

- Nach bestandenem Kurs erzeugt das LMS einen **revisionssicheren Schulungs-Nachweis** als PDF mit **Integritäts-Hash** zur Fälschungssicherung.
- Logo und Firmendaten aus **Einstellungen → PDF-Reports** werden als Kopf eingebettet (siehe [Konfiguration → PDF-Reports](/guides/konfiguration/#pdf-reports-logo-und-firmendaten)).
- Zertifikate und Schulungsnachweise bleiben **auch nach Ablauf der Enterprise-Lizenz** abrufbar — Audit-Fähigkeit geht nicht verloren.
- Fortschritt und Zertifikatsstatus erscheinen im **Enterprise-Reporting** und lassen sich per **CSV** exportieren; das **Nachweis-Center** liefert die passenden Compliance-Dokumente ([Funktionen](/reference/funktionen/#business-edition-add-on)).

## Einordnung für NIS2 / BSI

Dokumentierte, verpflichtende Schulungen mit Nachweis adressieren direkt die Anforderungen aus **NIS2 Art. 21** (Cyberhygiene und Schulungen) und dem BSI-Baustein **ORP.3 „Sensibilisierung und Schulung"**. Das LMS schließt damit den Kreis „Simulieren → Messen → Schulen → Nachweisen" — Details unter [Compliance-Einordnung](/reference/compliance/).

Siehe auch: [Funktionen](/reference/funktionen/) · [Konfiguration](/guides/konfiguration/) · [Roadmap](/reference/roadmap/)
