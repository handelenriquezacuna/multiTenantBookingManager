# Despliegue

Filosofía: **este repositorio contiene la aplicación y cómo construirla, no la
infraestructura que la hospeda.** El homelab (Dockploy, Traefik, Cloudflare
Tunnel, Tailscale, etc.) vive en un repositorio aparte. GitHub Actions compila
y publica las imágenes; el servidor **nunca compila código**, solo baja
imágenes ya construidas.

```
git push / tag  ─▶  GitHub Actions  ─▶  build imágenes  ─▶  push a GHCR
                                                              │
                                          Dockploy vigila ────┘  y redeploya
```

## Imágenes publicadas (GHCR)

El workflow [`.github/workflows/publish-images.yml`](../.github/workflows/publish-images.yml)
construye y publica dos imágenes de producción:

| Imagen | Dockerfile | Contenido |
|--------|-----------|-----------|
| `ghcr.io/handelenriquezacuna/citari/frontend` | `apps/frontend/Dockerfile` | Next.js standalone (multi-stage, sin código fuente ni node_modules completo) |
| `ghcr.io/handelenriquezacuna/citari/api` | `apps/api/Dockerfile` | FastAPI + uvicorn + driver ODBC 18 |

**Se dispara con:**

- push a `main` → etiquetas `:main` y `:<sha-corto>`
- tag `vX.Y.Z` → etiquetas `:X.Y.Z` y `:latest`
- ejecución manual (pestaña **Actions → Publish images → Run workflow**)

No hace falta configurar credenciales: usa el `GITHUB_TOKEN` del propio
workflow. La primera vez, en **Settings → Packages**, marcá los paquetes como
visibles para que Dockploy pueda bajarlos (o configurá un token de lectura si
los dejás privados).

## Configuración obligatoria antes del primer deploy

### Frontend: URL pública de la API (build-time)

Las variables `NEXT_PUBLIC_*` se **incrustan en el bundle al compilar**, no en
runtime. Definí la URL pública real de la API en
**Settings → Secrets and variables → Actions → Variables**:

```
NEXT_PUBLIC_API_BASE_URL = https://api.tu-dominio.com
```

Si no se define, se usa `http://localhost:8000` (solo sirve para pruebas). Cada
vez que cambie esa URL hay que **reconstruir** la imagen del frontend (no
alcanza con reiniciar el contenedor).

### API: variables de runtime (las lee Dockploy/compose al arrancar)

| Variable | Descripción |
|----------|-------------|
| `SQLSERVER_HOST` / `SQLSERVER_PORT` | Host y puerto de SQL Server |
| `SQLSERVER_USER` / `SQLSERVER_PASSWORD` | Credenciales |
| `SQLSERVER_DB` | `citari` |
| `JWT_SECRET` | Secreto JWT (mín. 32 caracteres) — **cambiar en producción** |
| `JWT_EXPIRES_MIN` | Expiración del token (min), por defecto 60 |
| `CORS_ORIGINS` | Origen del frontend, ej. `https://tu-dominio.com` |
| `LOG_FORMAT` | `json` en producción |

## Base de datos

Los scripts de esquema y seed están en [`database/scripts/`](../database/scripts)
(`01`…`07`, en orden; `08-full-script.sql` los concatena). En producción se
ejecutan una sola vez contra la instancia de SQL Server; el homelab decide si
usa un contenedor de SQL Server, un volumen persistente o una instancia
gestionada. La app no crea el esquema sola.

## Probar la imagen de producción localmente (opcional)

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 \
  -t citari-frontend:local apps/frontend
docker run --rm -p 3000:3000 citari-frontend:local

docker build -t citari-api:local apps/api
```

## Desarrollo (no producción)

Para trabajar día a día se usa `docker compose up` (ver `docker-compose.yml`):
bind mounts + hot reload en frontend (`next dev`) y API (`uvicorn --reload`).
Esos overrides de desarrollo **no** son los que se despliegan; la producción
siempre corre las imágenes de GHCR de arriba.
