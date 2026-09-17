$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo
$nodeDir = Get-ChildItem "$repo/.tools" -Directory -Filter 'node-*-win-x64' | Select-Object -First 1
if ($nodeDir) { $env:Path = "$($nodeDir.FullName);$repo/.tools/python;$repo/.tools/pnpm/node_modules/.bin;" + $env:Path }
$env:DJANGO_DEBUG = 'true'
$env:USE_SQLITE = 'true'
python server/manage.py safe_migrate
if ($LASTEXITCODE) { exit $LASTEXITCODE }
python server/manage.py seed_club
if ($LASTEXITCODE) { exit $LASTEXITCODE }
$pythonExe = (Get-Command python).Source
$backend = Start-Process -FilePath $pythonExe -ArgumentList 'server/manage.py','runserver','127.0.0.1:8000','--noreload' -WorkingDirectory $repo -WindowStyle Hidden -PassThru
try { pnpm --dir frontend dev } finally { Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue }
