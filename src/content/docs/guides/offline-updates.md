---
title: "Offline-Updates"
description: "Signierte Update-Bundles für Installationen ohne Internetzugang bauen, prüfen und einspielen."
sidebar:
  order: 5
---

Der normale Weg, eine SentryMail-Instanz zu aktualisieren, ist `./update.sh`: Es holt den neuen Stand per `git pull` und baut den Stack neu. Das setzt voraus, dass die Maschine ins Internet kommt.

Genau das ist bei vielen Installationen, für die SentryMail gebaut ist, nicht der Fall — abgeschottete Netze in der öffentlichen Verwaltung, in Produktionsumgebungen oder in regulierten Bereichen haben keinen Ausgang. Für diesen Fall gibt es das **signierte Offline-Update-Bundle**: eine einzelne Datei, die auf beliebigem Weg auf den Server kommt (USB-Stick, interne Freigabe, Datenschleuse) und dort eingespielt wird, ohne dass die Instanz je nach außen spricht.

Offline-Updates sind Bestandteil der **Open-Core-Version** und brauchen keine Lizenz.

## Warum ein Bundle signiert ist

Ein Update-Bundle ersetzt Quelltext, der anschließend mit Datenbankzugriff läuft. Wer das Bundle austauschen kann, übernimmt die Instanz. Ein Bundle wird deshalb **vollständig geprüft, bevor auch nur eine Datei entpackt wird**:

| Prüfung | Beantwortet die Frage |
|---|---|
| Ed25519-Signatur über die rohen Manifest-Bytes | Stammt das Bundle vom Herausgeber? |
| SHA-256 je Datei gegen das Manifest | Wurde eine einzelne Datei nachträglich verändert? |
| Vollständigkeit in **beide** Richtungen | Fehlt eine Datei — oder ist eine dabei, die das Manifest nicht kennt? |
| Versionskette (`min_version`, Downgrade-Sperre) | Passt das Bundle zur installierten Version? |

:::danger[Kein Durchwinken]
Schlägt eine dieser Prüfungen fehl, wird **nichts** entpackt — die Installation bleibt unverändert. Es gibt keinen Schalter, der die Prüfung überspringt.
:::

Zusätzlich abgewiesen werden Archive mit absoluten Pfaden, mit `..` im Pfad, mit Symlinks oder Gerätedateien sowie unverhältnismäßig große Archive. Das sind die klassischen Wege, beim Entpacken aus dem Zielverzeichnis auszubrechen.

## Schritt 1: Signaturschlüssel hinterlegen

Ohne hinterlegten öffentlichen Schlüssel wird **jedes** Bundle abgelehnt. In der `.env` der Instanz:

```bash
UPDATE_BUNDLE_PUBKEYS=EqUAHgRJOksXN26/DQ0CNYhW5yGzXoq3kh8yVLTsL9g=
```

Mehrere Schlüssel werden kommagetrennt eingetragen. Der Eintrag **ergänzt** den eingebauten Release-Schlüssel des Herausgebers, er ersetzt ihn nicht: Eine Instanz kann zusätzlich eigene, selbst signierte Bundles akzeptieren, ohne dass offizielle Releases dadurch unbrauchbar werden.

Ein eigenes Schlüsselpaar — etwa wenn ein Systemhaus seine Kundeninstanzen selbst versorgt:

```bash
python tools/build_update_bundle.py keygen --out release-key
```

Dabei entstehen `release-key.priv` (Dateimodus 600) und `release-key.pub`. Der ausgegebene Wert lässt sich direkt in die `.env` übernehmen.

:::caution[Privater Schlüssel]
Der private Schlüssel gehört in einen Tresor und **niemals** ins Repository oder in ein Backup, das breiter zugänglich ist als die Instanz selbst. Wer ihn hat, kann Bundles herstellen, die jede darauf eingestellte Instanz akzeptiert.
:::

## Schritt 2: Bundle bauen

Auf einer Maschine **mit** Zugriff auf den Quellstand:

```bash
python tools/build_update_bundle.py build \
  --source . \
  --key release-key.priv \
  --target-version 0.38.0 \
  --min-version 0.30.0 \
  --out dist/sentrymail-update-0.38.0.tar.gz
```

| Option | Bedeutung |
|---|---|
| `--source` | Quellbaum, der ausgeliefert wird |
| `--key` | privater Ed25519-Schlüssel aus `keygen` |
| `--target-version` | Version, die im Bundle steckt |
| `--min-version` | älteste installierte Version, auf die dieses Bundle eingespielt werden darf |
| `--out` | Zieldatei (`.tar.gz`) |

`--min-version` ist der Hebel für Migrationsketten: Setzt ein Release ein Zwischenrelease voraus, wird es hier eingetragen. Eine zu alte Instanz weist das Bundle dann mit einem verständlichen Hinweis ab, statt in einer halb gelaufenen Migration zu landen.

Nicht mit ins Bundle wandern unter anderem `.env`, `.git`, `node_modules`, `__pycache__`, `backups` und `dist`.

:::caution[Die `.env` bleibt draußen — erzwungen, nicht nur ausgeschlossen]
Ein Bundle wird weitergereicht, und eine mitgelieferte `.env` wäre gleich zwei Probleme: ein Zugangsdaten-Leck beim Ersteller und ein überschriebenes DB-Passwort samt `SECRET_KEY` beim Empfänger. Der Ausschluss im Bau-Werkzeug allein genügt dafür nicht — ein Bundle kann von jedem beliebigen Werkzeug erzeugt worden sein. Deshalb **weist die Prüfung jedes Bundle ab**, das `.env` oder `.env.*` an irgendeiner Stelle der Nutzlast enthält, auch wenn es korrekt signiert ist.
:::

Das Format ist bewusst `.tar.gz` und nicht das kompaktere zstd — ein Offline-Bundle landet auf Maschinen, deren Werkzeugstand nicht bekannt ist, und gzip ist überall vorhanden.

### Reproduzierbar bauen

Mit gesetztem `SOURCE_DATE_EPOCH` ist das Bundle byte-identisch reproduzierbar — zwei Läufe derselben Quelle liefern dieselbe Datei, auch unter anderem Ausgabenamen:

```bash
SOURCE_DATE_EPOCH=$(git log -1 --format=%ct) python tools/build_update_bundle.py build …
```

Ohne die Variable steht der Erstellzeitpunkt im Manifest und das Bundle unterscheidet sich bei jedem Lauf. Für den Normalbetrieb genügt das; wer ein Bundle unabhängig nachbauen und gegen das ausgelieferte vergleichen will, setzt die Variable.

## Schritt 3: Bundle prüfen

Im Dashboard unter **Einstellungen → Offline-Updates** lässt sich ein Bundle hochladen und prüfen. Angezeigt werden Zielversion, installierte Version, Mindestversion, Kennung des verwendeten Signaturschlüssels und die Zahl der enthaltenen Dateien.

:::note[Diese Seite spielt nichts ein]
Sie beantwortet nur die Frage davor: Ist das Bundle echt? Das Einspielen tauscht Quelltext aus und startet den Stack neu — das gehört auf die Kommandozeile des Betreibers und nicht hinter einen Klick, dessen Fehlbedienung eine laufende Kampagne stilllegt.
:::

Geprüfte **und** abgewiesene Bundles stehen im Audit-Log (`update.bundle.verified` bzw. `update.bundle.rejected`). Ein Manipulationsversuch bleibt dadurch nachvollziehbar.

Ohne Dashboard geht es auch direkt:

```bash
docker compose cp bundle.tar.gz backend:/tmp/b.tar.gz
docker compose exec -T backend python -m app.services.update_bundle /tmp/b.tar.gz
```

Exit-Code 0 heißt: Bundle in Ordnung. Exit-Code 1 heißt: abgelehnt, mit Begründung auf der Ausgabe.

## Schritt 4: Bundle einspielen

Auf dem Server:

```bash
./update.sh --bundle sentrymail-update-0.38.0.tar.gz
```

Der Ablauf:

1. Voraussetzungen prüfen (`docker`, `docker compose`, `.env`)
2. **Datenbank-Backup** anlegen — mit Rückfrage, dringend empfohlen
3. Bundle in den laufenden Backend-Container kopieren und dort prüfen. Schlägt die Prüfung fehl, bricht der Vorgang ab, **bevor** irgendetwas verändert wurde
4. Nach Bestätigung entpacken und über den Bestand legen — die `.env` wird nicht angefasst
5. Stack neu bauen und starten; Migrationen laufen automatisch beim Backend-Start
6. Gesundheitsprüfung gegen `/health`

Für Schritt 3 muss der Backend-Container laufen, denn er bringt die Prüflogik mit. Läuft er nicht, weist das Skript darauf hin und macht **nicht** ungeprüft weiter. Gehört das Installationsverzeichnis root (z. B. unter `/opt`), läuft die Routine mit `sudo ./update.sh --bundle …`.

## Rollback

Das Rollback unterscheidet sich nicht vom Online-Weg: vorherigen Code-Stand wiederherstellen, Stack mit `docker compose up -d --build` neu starten und bei Bedarf das Backup aus Schritt 2 einspielen. Details stehen im Abschnitt **Rollback** der [Installationsanleitung](/guides/installation/).

Ein Downgrade über ein Bundle ist bewusst nicht möglich — ein Bundle mit älterer Zielversion wird abgewiesen.

## Was ein Bundle nicht löst

- **Add-ons.** Business- und Enterprise-Add-ons haben eigene Releases. In einer Produktionsinstallation sind sie Teil des Backend-Images, der Rebuild in Schritt 5 deckt sie also mit ab.
- **Lizenzprüfung.** Die Lizenz wird online gegen den Lizenzserver geprüft. Eine dauerhaft abgeschottete Instanz läuft nach Ablauf der Grace Period im Open-Core-Funktionsumfang weiter — sie wird **nicht** abgeschaltet.
- **Update-Benachrichtigung.** Eine abgeschottete Instanz erfährt nicht von selbst, dass es eine neue Version gibt. `UPDATE_CHECK_URL` in der `.env` leeren schaltet den Hinweis ganz ab.
