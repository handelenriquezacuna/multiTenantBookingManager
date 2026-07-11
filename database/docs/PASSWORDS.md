# Credenciales de desarrollo

## Superadmins (50)

Todos los superadmins usan la misma contraseña: **Admin123**

Las columnas de nombre son `nombre`, `apellido_1` y `apellido_2` (opcional).

### Miembros del equipo (5 reales)

| Nombre | Apellido 1 | Apellido 2 | Correo | Password |
|--------|------------|------------|--------|----------|
| Melanie Yeonsuk | Campos | Arias | melanie.campos@mbm.admin | Admin123 |
| Isaac | Chavez | Zumbado | isaac.chavez@mbm.admin | Admin123 |
| Luna | Delgado | Durango | luna.delgado@mbm.admin | Admin123 |
| Handel Simón | Enriquez | Acuña | handel.enriquez@mbm.admin | Admin123 |
| Jeferson Andrew | Fuentes | García | jeferson.fuentes@mbm.admin | Admin123 |

### Superadmins de prueba (45)

Correos `superadmin06@mbm.local` a `superadmin50@mbm.local`, generados de forma
determinista por `scripts/gen-seed.py` con nombres/apellidos de prueba y el
mismo hash literal de Admin123.

## Dueños de negocio (50)

Todos los dueños usan la misma contraseña: **bowner123**

Ejemplo: `adriana.ramirez@email.com` / `bowner123`

## Algoritmo de hash

bcrypt con 12 rondas (salt generado automáticamente). Los hashes se generan con
Python `bcrypt` y se insertan como literales en el seed script
(`database/scripts/03-seed-data.sql`, emitido por `scripts/gen-seed.py`).

Formato del hash: `$2b$12$<salt+hash_base64>`
