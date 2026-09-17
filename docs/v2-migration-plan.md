# K-Dojo v2: audit and migration plan

Baseline: 4cf5e30. Clean working tree on existing kdojo-v2; master unchanged.

## Existing architecture
client is the unmodified Vue 3/Vite starter. server is Django with Product and Request in myapp. Only application creation and admin are wired. Other view functions reference missing Application models/templates. Preserve Request (myapp_request), Product, primary keys, timestamps and migration history. Root node_modules is accidentally tracked. No actual club photos exist in tracked files.

## Security findings
Hardcoded Django secret, DEBUG enabled, unrestricted CORS, csrf_exempt creation, unchecked JSON and no throttling. Legacy mutation views lack authorization. Example credentials must be replaced. Makefile db-clear is unsafe for retained data.

## Database discovery
Compose declares PostgreSQL 14.8, named dsf-data volume and port 5534. No local database files or dumps found. Docker CLI not on PATH or standard Docker Desktop path; WSL reports not installed. Database/volume existence is UNVERIFIED, not absent. No database mutations performed.

CRITICAL: migration 0003 removes description, email, status, subject and updated_at. Before migrating any existing database, inspect django_migrations. A database at 0002 MUST first have a verified backup and lossless export of these columns; do not blindly run migrate. Preserve original migration files. Rehearse against a restored copy, compare row counts, IDs, phones, messages and timestamps. Never delete original requests, volumes or database.

## Implementation stages
1. Audit and architecture (this document).
2. Add club content models and additive Request fields. Keep legacy tables. Generate and test migrations in an isolated development database.
3. Design system: warm #F3F1EC, graphite, restrained red/gold/green; typography and editorial sections. Real media supplied through admin; explicit TODOs for absent assets.
4. Nuxt 4 SSR shell, typed API and all specified routes.
5. Django REST API/admin, CSRF-protected applications, validation, throttling and notification abstraction.
6. Content pages, filters, forms, SEO, accessibility and responsive verification.
7. Isolated production Compose, controlled migrations, backups, CI/tests and operating documentation.

Each major stage receives checks and its own commit. No push.

## Safe cutover
Use a separate Compose project and new explicitly named v2 database/media volumes. Never attach a newer PostgreSQL image to old data files. Obtain logical pg_dump backup and restore it to the isolated database. Export legacy fields before migration 0003 if needed. Run migrations on restored copy, compare application records and verify admin/API. Keep original service and backup available for rollback. Production cutover requires verified real data inventory and completed restore rehearsal.

## Sources
https://nuxt.com/docs/4.x/getting-started/installation
https://www.djangoproject.com/download/

## Pending owner content
Real photography, coach credentials/biographies, Mowgli certificate, non-BJJ addresses, club history, results/events, equipment instructions and legal operator details. Do not fabricate these.

## Verification after implementation

See [v2 verification report](v2-verification.md) for the implemented scope, tests, PostgreSQL backup/restore rehearsal and remaining deployment limits. Native PostgreSQL 17.11 passed all 17 backend tests and a synthetic-data restore comparison. The real legacy database and Docker volumes still require inspection on their actual host; they have not been migrated or removed.