# Docker setup

## Requisitos previos

- Docker instalado.
- Docker Compose disponible.

## Configuración de variables de entorno

1. Copiar `.env.example` a `.env`.
2. Ajustar valores según el entorno.

## Levantar contenedores

```bash
docker compose up --build
```

## Detener contenedores

```bash
docker compose down
```

## Revisar logs

```bash
docker compose logs -f
```

## Conexión a SQL Server

- Host: `SQLSERVER_HOST`
- Puerto: `SQLSERVER_PORT`
- Usuario: `SQLSERVER_USER`
- Password: `SQLSERVER_PASSWORD`

## Ejecutar scripts

- Usar los archivos en `database/scripts/`.
