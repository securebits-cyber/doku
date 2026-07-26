---
title: "Offline updates"
description: "Build, verify and apply signed update bundles for installations without internet access."
sidebar:
  order: 4
---

The normal way to update a SentryMail instance is `./update.sh`: it fetches the new state via `git pull` and rebuilds the stack. That assumes the machine can reach the internet.

For many of the installations SentryMail is built for, it cannot — air-gapped networks in public administration, in production environments or in regulated areas have no way out. For those there is the **signed offline update bundle**: a single file that reaches the server by any route (USB stick, internal share, data diode) and is applied there without the instance ever talking to the outside.

Offline updates are part of the **Open Core version** and need no license.

## Why a bundle is signed

An update bundle replaces source code that afterwards runs with database access. Whoever can swap the bundle takes over the instance. A bundle is therefore **verified completely before a single file is extracted**:

| Check | Answers the question |
|---|---|
| Ed25519 signature over the raw manifest bytes | Does the bundle come from the publisher? |
| SHA-256 per file against the manifest | Was an individual file altered afterwards? |
| Completeness in **both** directions | Is a file missing — or is one present that the manifest does not know? |
| Version chain (`min_version`, downgrade block) | Does the bundle match the installed version? |

:::danger[No pass-through]
If any of these checks fails, **nothing** is extracted — the installation stays unchanged. There is no switch that skips verification.
:::

Archives with absolute paths, with `..` in a path, with symlinks or device files, and disproportionately large archives are rejected as well. Those are the classic ways of escaping the target directory during extraction.

## Step 1: configure a signing key

Without a configured public key **every** bundle is rejected. In the instance's `.env`:

```bash
UPDATE_BUNDLE_PUBKEYS=EqUAHgRJOksXN26/DQ0CNYhW5yGzXoq3kh8yVLTsL9g=
```

Several keys are comma-separated. The entry **extends** the publisher's built-in release key, it does not replace it: an instance can additionally accept its own, self-signed bundles without making official releases unusable.

Your own key pair — for example when a managed service provider supplies its customer instances itself:

```bash
python tools/build_update_bundle.py keygen --out release-key
```

This produces `release-key.priv` (file mode 600) and `release-key.pub`. The printed value can be copied straight into the `.env`.

:::caution[Private key]
The private key belongs in a vault and **never** in the repository or in a backup that is more widely accessible than the instance itself. Whoever holds it can produce bundles that every instance configured for it will accept.
:::

## Step 2: build a bundle

On a machine that **does** have access to the source tree:

```bash
python tools/build_update_bundle.py build \
  --source . \
  --key release-key.priv \
  --target-version 0.38.0 \
  --min-version 0.30.0 \
  --out dist/sentrymail-update-0.38.0.tar.gz
```

| Option | Meaning |
|---|---|
| `--source` | source tree to ship |
| `--key` | private Ed25519 key from `keygen` |
| `--target-version` | version contained in the bundle |
| `--min-version` | oldest installed version this bundle may be applied to |
| `--out` | output file (`.tar.gz`) |

`--min-version` is the lever for migration chains: if a release requires an intermediate release, set it here. An instance that is too old then rejects the bundle with an understandable message instead of ending up in a half-completed migration.

Among others, `.env`, `.git`, `node_modules`, `__pycache__`, `backups` and `dist` are excluded from the bundle. The `.env` deliberately heads that list: a bundle gets passed around, and a bundled `.env` would be a credential leak.

The format is deliberately `.tar.gz` rather than the more compact zstd — an offline bundle lands on machines whose tooling is unknown, and gzip is available everywhere.

## Step 3: verify the bundle

In the dashboard under **Settings → Offline updates** a bundle can be uploaded and verified. Shown are the target version, the installed version, the minimum version, the identifier of the signing key used, and the number of files contained.

:::note[This page applies nothing]
It only answers the question that comes first: is the bundle genuine? Applying it replaces source code and restarts the stack — that belongs on the operator's command line, not behind a click whose misuse takes down a running campaign.
:::

Verified **and** rejected bundles are recorded in the audit log (`update.bundle.verified` and `update.bundle.rejected` respectively). A tampering attempt therefore stays traceable.

It also works directly, without the dashboard:

```bash
docker compose cp bundle.tar.gz backend:/tmp/b.tar.gz
docker compose exec -T backend python -m app.services.update_bundle /tmp/b.tar.gz
```

Exit code 0 means the bundle is fine. Exit code 1 means it was rejected, with the reason on the output.

## Step 4: apply the bundle

On the server:

```bash
./update.sh --bundle sentrymail-update-0.38.0.tar.gz
```

The sequence:

1. Check prerequisites (`docker`, `docker compose`, `.env`)
2. Create a **database backup** — with a prompt, strongly recommended
3. Copy the bundle into the running backend container and verify it there. If verification fails, the process aborts **before** anything was changed
4. After confirmation, extract and lay it over the existing installation — the `.env` is not touched
5. Rebuild and restart the stack; migrations run automatically on backend start
6. Health check against `/health`

Step 3 requires the backend container to be running, because it carries the verification logic. If it is not running, the script says so and does **not** continue unverified. If the installation directory is owned by root (for example under `/opt`), run the routine as `sudo ./update.sh --bundle …`.

## Rollback

Rollback is no different from the online path: restore the previous code state, restart the stack with `docker compose up -d --build` and, if needed, restore the backup from step 2. Details are in the **Rollback** section of the [installation guide](/en/guides/installation/).

Downgrading through a bundle is deliberately not possible — a bundle with an older target version is rejected.

## What a bundle does not solve

- **Add-ons.** Business and Enterprise add-ons have their own releases. In a production installation they are part of the backend image, so the rebuild in step 5 covers them.
- **License checks.** The license is verified online against the license server. A permanently air-gapped instance keeps running with the Open Core feature set once the grace period expires — it is **not** shut down.
- **Update notifications.** An air-gapped instance does not learn on its own that a new version exists. Emptying `UPDATE_CHECK_URL` in the `.env` turns the hint off entirely.
