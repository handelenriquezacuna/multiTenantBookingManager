# SQL Server con Docker — POC

Guía para levantar SQL Server 2022 en Docker, crear el schema y ejecutar queries de ejemplo en DBeaver.
Válida para **macOS** y **Windows**.

---

## Requisitos previos

| Herramienta | macOS | Windows |
|---|---|---|
| Docker Desktop | docker.com/products/docker-desktop | docker.com/products/docker-desktop |
| Git | `brew install git` | git-scm.com o WSL2 |
| DBeaver | dbeaver.io | dbeaver.io |
| SSMS (alternativa) | — | aka.ms/ssmsfullsetup |

> **Windows:** en Docker Desktop → Settings → General habilita **"Use the WSL 2 based engine"** para mejor compatibilidad.

> **macOS Apple Silicon (M1/M2/M3):** la imagen corre vía Rosetta 2. El `docker-compose.yml` incluye `platform: linux/amd64` para declararlo explícitamente. El contenedor funciona con normalidad.

---

## Flujo completo

```
1. Copiar .env  →  2. Correr setup script  →  3. Conectar DBeaver  →  4. Ejecutar queries
```

---

## Paso 1 — Copiar el archivo de entorno

El `docker-compose.yml` no tiene valores hardcodeados. Todos los secrets vienen del `.env` local, que está en `.gitignore` y **nunca se commitea**.

```bash
# macOS
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

Verifica que `.env` tenga estos valores (ajusta la contraseña si lo necesitas):

```env
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=YourStrong!Passw0rd
SQLSERVER_DB=mbm_booking
```

> La contraseña debe tener mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos.

> **Regla de oro:** `.env.example` se commitea con valores de referencia. `.env` nunca se commitea. Cada colaborador copia el `.example` y define su propia contraseña local.

> **Roadmap de secrets:** cuando el proyecto escale, el `.env` se reemplaza con un secrets manager gratuito (Doppler, Infisical) sin modificar el `docker-compose.yml`.

---

## Paso 2 — Correr el setup script

Un solo comando que levanta el contenedor, espera a que esté healthy y ejecuta los 3 scripts SQL en orden:

```bash
# macOS
bash scripts/setup-db.sh
```

```powershell
# Windows PowerShell
.\scripts\setup-db.ps1
```

### Qué hace el script

| Paso | Acción |
|---|---|
| 1 | Verifica que `.env` exista y tenga `SQLSERVER_PASSWORD` |
| 2 | Ejecuta `docker compose up -d` |
| 3 | Espera a que el healthcheck reporte `healthy` (polling cada 5s, máx. 100s) |
| 4 | Ejecuta `01-create-database.sql` → crea `mbm_booking` |
| 5 | Ejecuta `02-create-tables.sql` → crea las 15 tablas |
| 6 | Ejecuta `03-seed-data.sql` → inserta catálogos y tenant demo |
| 7 | Imprime los datos de conexión para DBeaver |

### Output esperado

```
[setup] Levantando contenedor SQL Server...
[setup] Esperando que SQL Server esté listo...
  ... esperando (1/20)
  ... esperando (2/20)
[setup] SQL Server está healthy.
[setup] Ejecutando 01-create-database.sql...
[setup] Ejecutando 02-create-tables.sql...
[setup] Ejecutando 03-seed-data.sql...

✓ Setup completo. Conecta DBeaver con:
  Host:     localhost
  Port:     1433
  Database: mbm_booking
  User:     sa
  Driver Properties → trustServerCertificate = true
```

---

## Paso 3 — Conectar DBeaver

### macOS y Windows (mismo flujo)

1. Abre DBeaver → `File → New Database Connection` (o el ícono `+`).
2. Selecciona **SQL Server** → **Next**.
3. Si es la primera vez, DBeaver pide descargar el driver → acepta.

### Parámetros de conexión

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Port | `1433` |
| Database | `mbm_booking` |
| Authentication | SQL Server Authentication |
| Username | `sa` |
| Password | `********` |

### Trust Server Certificate (obligatorio)

En la pestaña **Driver Properties** agrega:

| Property | Value |
|---|---|
| `trustServerCertificate` | `true` |

### Verificar y finalizar

Click **Test Connection** → debe responder `Connected` → **Finish**.

### Navegar los datos

```
mbm_booking
  └── Schemas
        └── dbo
              └── Tables
                    ├── tenants          ← tenant demo: "demo-barberia"
                    ├── services         ← 3 servicios de barbería
                    ├── service_categories
                    ├── bookings
                    └── ...              ← 15 tablas en total
```

Click derecho sobre cualquier tabla → **View Data** para explorar los registros.

---

## Alternativa Windows — SSMS

1. Abre SSMS → `Connect → Database Engine`.
2. Server name: `localhost,1433` (coma, no dos puntos).
3. Authentication: **SQL Server Authentication**.
4. Login: `sa` | Password: `**********`.
5. En **Connection Properties** → marca **Trust server certificate**.

---

## Paso 4 — Ejecutar queries de ejemplo

1. En DBeaver: `File → Open File` → abre `database/scripts/04-example-queries.sql`.
2. Ejecutar query por query:
   - **macOS:** `Cmd+Enter`
   - **Windows:** `Ctrl+Enter`
3. Ejecutar todo el archivo: `Ctrl+Alt+Enter`.

### Queries incluidas

| # | Query | Qué demuestra |
|---|---|---|
| 1 | Listar tenants | JOIN multi-tabla, alias |
| 2 | Servicios activos por tenant | Filtro por slug + estado |
| 3 | Disponibilidad futura | LEFT JOIN + GROUP BY + HAVING |
| 4 | Reservas con detalle completo | JOIN de 6 tablas |
| 5 | Reporte de ingresos por servicio | GROUP BY + SUM |
| 6 | Buscar reserva por tracking code | Variable T-SQL + lookup público |

---

## Detener y limpiar

```bash
# Detener sin borrar datos (macOS y Windows)
docker compose stop

# Detener y eliminar contenedor — datos persisten en el volumen
docker compose down

# Eliminar también el volumen — borra todo, requiere volver a correr el setup script
docker compose down -v
```

---

## Troubleshooting

### `.env` no encontrado o `SQLSERVER_PASSWORD` vacío

```bash
# macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Luego vuelve a correr el setup script.

### El contenedor no arranca (exit code 1)

La contraseña no cumple la política de SQL Server. Edita `SQLSERVER_PASSWORD` en `.env` y reinicia:

```bash
docker compose down && docker compose up -d
```

### Puerto 1433 ocupado

Cambia `SQLSERVER_PORT` en `.env` (ej. `1434`) y actualiza el campo Port en DBeaver/SSMS.

### macOS — platform warning en `docker compose up`

El aviso `requested image's platform (linux/amd64) does not match detected host platform (linux/arm64/v8)` es solo informativo. Rosetta 2 corre la imagen correctamente. El `docker-compose.yml` ya incluye `platform: linux/amd64`.

### macOS — `zsh: event not found: !`

Ocurre si ejecutas sqlcmd manualmente con comillas dobles. Usa siempre comillas simples en zsh:

```bash
# MAL  → -P "********"
# BIEN → -P '********'
```

El setup script maneja esto automáticamente.

### Windows — "Drive sharing is not enabled"

Docker Desktop → Settings → Resources → File Sharing → agrega el disco donde está el proyecto.

---

# SQL Server Docker POC — MBM

## Setup (un solo comando)
- macOS: `bash scripts/setup-db.sh`
- Windows: `.\scripts\setup-db.ps1`
- Requiere: copiar `.env.example` → `.env` antes de correr

## Conexión DBeaver
- Host: localhost | Port: 1433 | Database: mbm_booking | User: sa
- Driver Properties → trustServerCertificate = true
- Ejecutar query: Cmd+Enter (Mac) / Ctrl+Enter (Windows)

## Scripts SQL (ejecutados automáticamente por setup script)
| Archivo | Propósito |
|---|---|
| 01-create-database.sql | Crea mbm_booking |
| 02-create-tables.sql | DDL completo (15 tablas) |
| 03-seed-data.sql | Catálogos + tenant demo |
| 04-example-queries.sql | 6 queries de referencia |

## Comandos útiles
- Teardown completo: `docker compose down -v`
- Ver estado: `docker compose ps`

## Links
- [[docker-setup]] — configuración general de Docker en MBM
- [[database-design]] — diseño de tablas y relaciones
```

---

## Estructura de archivos

```
multiTenantBookingManager/
├── docker-compose.yml                  ← SQL Server 2022, sin valores hardcodeados
├── .env.example                        ← referencia de variables (se commitea)
├── .env                                ← secrets locales (gitignored, NO se commitea)
├── scripts/
│   ├── setup-db.sh                     ← setup automático macOS/Linux
│   └── setup-db.ps1                    ← setup automático Windows
└── database/
    └── scripts/
        ├── 01-create-database.sql      ← crea mbm_booking
        ├── 02-create-tables.sql        ← DDL completo, 15 tablas
        ├── 03-seed-data.sql            ← catálogos + tenant demo
        └── 04-example-queries.sql      ← 6 queries documentadas
```
