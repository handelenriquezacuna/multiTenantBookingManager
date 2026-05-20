# setup-db.ps1 — levanta SQL Server y crea el schema completo con seed data.
# Uso: .\scripts\setup-db.ps1
#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$SQLCMD   = "/opt/mssql-tools18/bin/sqlcmd"
$CONTAINER = "mbm_sqlserver"
$ENV_FILE  = ".env"
$ENV_EXAMPLE = ".env.example"

# ── 1. Verificar .env ───────────────────────────────────────────────────────
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "[setup] .env no encontrado. Copiando desde $ENV_EXAMPLE..."
    Copy-Item $ENV_EXAMPLE $ENV_FILE
    Write-Host "[setup] Edita .env con tu contraseña y vuelve a correr el script."
    exit 1
}

# Cargar variables desde .env
Get-Content $ENV_FILE | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

$SA_PASSWORD = [Environment]::GetEnvironmentVariable("SQLSERVER_PASSWORD", "Process")
$SA_PORT     = [Environment]::GetEnvironmentVariable("SQLSERVER_PORT", "Process")
$SA_DB       = [Environment]::GetEnvironmentVariable("SQLSERVER_DB", "Process")

if (-not $SA_PASSWORD) {
    Write-Error "[ERROR] SQLSERVER_PASSWORD no está definido en $ENV_FILE"
    exit 1
}

# ── 2. Levantar contenedor ──────────────────────────────────────────────────
Write-Host "[setup] Levantando contenedor SQL Server..."
docker compose up -d

# ── 3. Esperar healthcheck ──────────────────────────────────────────────────
Write-Host "[setup] Esperando que SQL Server esté listo..."
$attempts = 0
$max = 20
do {
    Start-Sleep -Seconds 5
    $attempts++
    $status = docker inspect --format='{{.State.Health.Status}}' $CONTAINER 2>$null
    Write-Host "  ... esperando ($attempts/$max)"
    if ($attempts -ge $max) {
        Write-Error "[ERROR] SQL Server no respondió después de $($max * 5) segundos."
        docker compose logs sqlserver
        exit 1
    }
} until ($status -eq "healthy")
Write-Host "[setup] SQL Server está healthy."

# ── 4. Ejecutar scripts en orden ────────────────────────────────────────────
function Run-Script($fileName) {
    Write-Host "[setup] Ejecutando $fileName..."
    docker exec -i $CONTAINER `
        $SQLCMD -S localhost -U sa -P "$SA_PASSWORD" -C `
        -i "/scripts/$fileName"
}

Run-Script "01-create-database.sql"
Run-Script "02-create-tables.sql"
Run-Script "03-seed-data.sql"

# ── 5. Listo ─────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Setup completo. Conecta DBeaver con:"
Write-Host "  Host:     localhost"
Write-Host "  Port:     $($SA_PORT ?? '1433')"
Write-Host "  Database: $($SA_DB ?? 'mbm_booking')"
Write-Host "  User:     sa"
Write-Host "  Driver Properties -> trustServerCertificate = true"
