$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo
$nodeDir = Get-ChildItem "$repo/.tools" -Directory -Filter 'node-*-win-x64' | Select-Object -First 1
if ($nodeDir) { $env:Path = "$($nodeDir.FullName);$repo/.tools/python;$repo/.tools/pnpm/node_modules/.bin;" + $env:Path }
$env:DJANGO_DEBUG = 'true'
$env:USE_SQLITE = 'true'
python -m ruff check server scripts/check_postgres.py
if ($LASTEXITCODE) { exit $LASTEXITCODE }
python -m ruff format --check server scripts/check_postgres.py
if ($LASTEXITCODE) { exit $LASTEXITCODE }
python server/manage.py check
if ($LASTEXITCODE) { exit $LASTEXITCODE }
python server/manage.py test club myapp
if ($LASTEXITCODE) { exit $LASTEXITCODE }
python server/manage.py makemigrations --check --dry-run
if ($LASTEXITCODE) { exit $LASTEXITCODE }
pnpm --dir frontend lint
if ($LASTEXITCODE) { exit $LASTEXITCODE }
pnpm --dir frontend format:check
if ($LASTEXITCODE) { exit $LASTEXITCODE }
pnpm --dir frontend typecheck
if ($LASTEXITCODE) { exit $LASTEXITCODE }
pnpm --dir frontend test
if ($LASTEXITCODE) { exit $LASTEXITCODE }
pnpm --dir frontend build
if ($LASTEXITCODE) { exit $LASTEXITCODE }
pnpm --dir frontend test:e2e
exit $LASTEXITCODE
