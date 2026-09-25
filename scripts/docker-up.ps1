$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

if (-not (Test-Path -LiteralPath '.env')) {
    throw 'Create .env from .env.example and set secrets and SITE_DOMAIN first.'
}

function Invoke-Compose {
    docker compose @args
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed with exit code $LASTEXITCODE"
    }
}

Invoke-Compose config --quiet
Invoke-Compose build
Invoke-Compose up -d --wait db
Invoke-Compose run --rm backend python manage.py safe_migrate
Invoke-Compose run --rm backend python manage.py seed_club
Invoke-Compose up -d --wait
Invoke-Compose ps
