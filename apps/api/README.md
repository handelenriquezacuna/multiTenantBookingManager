# MBM API (apps/api)

FastAPI + pyodbc (synchronous) API for the MultiTenantBookingManager project.

Layers: Router (HTTP only) -> Service (orchestration) -> Repository (the only
layer that knows SQL/stored procedures) -> pyodbc, running on FastAPI's
threadpool. No ORM, no async DB drivers.

As of this work package (WP5) only `GET /health` and `GET /ready` are fully
functional; every other route is scaffolded (schemas, routers, services,
repositories, mappers all exist) but answers `501 Not Implemented` until its
SP/view lands and the repository body is wired up in WP6/WP7.

## Run locally

```bash
cd apps/api
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"

# minimal env to boot the process (DB is only touched by /ready):
export SQLSERVER_HOST=localhost
export SQLSERVER_PASSWORD=YourStrong!Passw0rd
export JWT_SECRET=devsecretdevsecretdevsecret12345

.venv/bin/uvicorn app.main:app --reload --port 8000
```

`GET http://localhost:8000/health` -> `{"status": "ok"}` (no DB access).
`GET http://localhost:8000/ready` -> `{"status": "ok"}` if `SELECT 1` against
SQL Server succeeds, otherwise HTTP 503.

## Run tests

```bash
.venv/bin/pytest tests/unit -q
```

`tests/unit` has no database dependency (mappers, errors, security, logging
formatters). `tests/integration` (added in a later WP) will run against a
real SQL Server instance.

## Lint / type-check

```bash
.venv/bin/ruff check app tests
.venv/bin/ruff format --check app tests
.venv/bin/mypy app
```

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `SQLSERVER_HOST` | `localhost` | SQL Server host |
| `SQLSERVER_PORT` | `1433` | SQL Server port |
| `SQLSERVER_USER` | `sa` | SQL Server login |
| `SQLSERVER_PASSWORD` | (none) | SQL Server password |
| `SQLSERVER_DB` | `mbm_booking` | Database name |
| `JWT_SECRET` | `change-me` | HS256 signing secret - set a real one outside dev |
| `JWT_EXPIRES_MIN` | `60` | Access token lifetime in minutes |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `LOG_FORMAT` | `json` | `dev` for a human-readable pipe-delimited line, `json` (default) for one JSON object per line |

## Docker

```bash
docker build -t mbm-api apps/api
docker run --rm -p 8000:8000 \
  -e SQLSERVER_HOST=sqlserver -e SQLSERVER_PASSWORD=... -e JWT_SECRET=... \
  mbm-api
```
