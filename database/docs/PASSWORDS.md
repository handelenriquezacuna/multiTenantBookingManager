# Credenciales de desarrollo

## Superadmins (5)

| Nombre | Email | Password |
|--------|-------|----------|
| Campos Arias Melanie Yeonsuk | melanie.campos@mbm.admin | Admin123 |
| Chavez Zumbado Isaac | isaac.chavez@mbm.admin | Admin123 |
| Delgado Durango Luna | luna.delgado@mbm.admin | Admin123 |
| Enriquez Acuña Handel Simón | handel.enriquez@mbm.admin | Admin123 |
| Fuentes García Jeferson Andrew | jeferson.fuentes@mbm.admin | Admin123 |

## Dueños de negocio (50)

Todos los dueños usan la misma contraseña: **bowner123**

Ejemplo: `adriana.ramirez@email.com` / `bowner123`

## Algoritmo de hash

bcrypt con 12 rondas (salt generado automáticamente). Los hashes se generan con Python `bcrypt` y se insertan como literales en el seed script.

Formato del hash: `$2b$12$<salt+hash_base64>`
