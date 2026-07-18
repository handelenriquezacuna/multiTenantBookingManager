#!/bin/bash
# setup-db.sh — levanta SQL Server y crea el schema completo con seed data.
# Uso: bash scripts/setup-db.sh
set -e

SQLCMD="/opt/mssql-tools18/bin/sqlcmd"
CONTAINER="citari-db"
ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

# ── 1. Verificar .env ───────────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
    echo "[setup] .env no encontrado. Copiando desde $ENV_EXAMPLE..."
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "[setup] Edita .env con tu contraseña y vuelve a correr el script."
    exit 1
fi

source "$ENV_FILE"

if [ -z "$SQLSERVER_PASSWORD" ]; then
    echo "[ERROR] SQLSERVER_PASSWORD no está definido en $ENV_FILE"
    exit 1
fi

# ── 2. Levantar contenedor ──────────────────────────────────────────────────
echo "[setup] Levantando contenedor SQL Server..."
docker compose up -d

# ── 3. Esperar healthcheck ──────────────────────────────────────────────────
echo "[setup] Esperando que SQL Server esté listo..."
ATTEMPTS=0
MAX=20
until docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null | grep -q "healthy"; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "$ATTEMPTS" -ge "$MAX" ]; then
        echo "[ERROR] SQL Server no respondió después de $(( MAX * 5 )) segundos."
        docker compose logs sqlserver
        exit 1
    fi
    echo "  ... esperando (${ATTEMPTS}/${MAX})"
    sleep 5
done
echo "[setup] SQL Server está healthy."

# ── 4. Ejecutar scripts en orden ────────────────────────────────────────────
run_script() {
    local file="$1"
    echo "[setup] Ejecutando $file..."
    # -I: QUOTED_IDENTIFIER ON (requerido por el indice unico FILTRADO
    # ux_reservaciones_bloque de 02-create-tables.sql; sqlcmd lo deja OFF
    # por defecto y CREATE INDEX de un indice filtrado falla sin esto).
    docker exec -i "$CONTAINER" \
        "$SQLCMD" -S localhost -U sa -P "$SQLSERVER_PASSWORD" -C -I \
        -i "/scripts/$(basename "$file")"
}

run_script "database/scripts/01-create-database.sql"
run_script "database/scripts/02-create-tables.sql"
run_script "database/scripts/03-seed-data.sql"
run_script "database/scripts/04-procedures.sql"
run_script "database/scripts/05-functions.sql"
run_script "database/scripts/06-views.sql"
run_script "database/scripts/07-triggers.sql"

# ── 5. Listo ─────────────────────────────────────────────────────────────────
echo ""
echo "[OK] Setup completo. Conecta DBeaver con:"
echo "  Host:     localhost"
echo "  Port:     ${SQLSERVER_PORT:-1433}"
echo "  Database: ${SQLSERVER_DB:-citari}"
echo "  User:     sa"
echo "  Driver Properties -> trustServerCertificate = true"
