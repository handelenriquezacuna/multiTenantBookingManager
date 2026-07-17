# Preguntas de dominio

Preguntas clave sobre el negocio y sus datos para guiar decisiones de diseño de base de datos.

---

## Autenticación y usuarios

- ¿Cuántos tipos de usuario maneja el sistema y cuáles necesitan contraseña en la base de datos?
  - Tres: superadmin y business owner guardan contraseña. El cliente no tiene cuenta.

- ¿Un owner puede administrar más de un tenant con el mismo email?
  - No. Cada owner pertenece a un único tenant.

- ¿Los clientes se identifican solo por email y teléfono, o necesitan un identificador único propio?
  - Tienen su propio ID en la tabla `clientes`, pero se identifican públicamente por email dentro de su tenant.

- ¿El sistema necesita guardar intentos de login fallidos o sesiones activas?
  - No para el MVP.

---

## Tenants y negocios

- ¿Qué información mínima debe tener un tenant para considerarse listo para operar?
  - Nombre, slug, tipo de negocio y al menos un owner registrado.

- ¿Un tenant puede cambiar de tipo de negocio después de registrarse?
  - No está definido en el proyecto. El campo existe en la tabla pero no hay endpoint ni procedure planteado para ese cambio.

- ¿Qué acciones del superadmin deben quedar en auditoría?
  - Activar y suspender tenants.

- ¿El slug del tenant puede cambiar una vez creado?
  - No. El slug se usa en URLs públicas y cambiarlo rompería los enlaces existentes.

---

## Servicios y categorías

- ¿Un servicio puede pertenecer solo a una categoría o a varias?
  - Solo a una categoría.

- ¿La duración de un servicio es fija o puede variar por reserva?
  - Fija. La duración se define en el servicio y no cambia por reserva.

- ¿Se puede hacer una reserva que incluya más de un servicio al mismo tiempo?
  - No para el MVP. Una reserva corresponde a un solo servicio.

- ¿Qué pasa con las reservas existentes si un servicio se desactiva?
  - Las reservas existentes no se modifican. El servicio desactivado deja de aparecer para nuevas reservas.

---

## Disponibilidad y horarios

- ¿Los bloques de disponibilidad se generan automáticamente desde `horarios` o los crea el owner manualmente?
  - Para el MVP se insertan mediante scripts de seed (`scripts/gen-seed.py`). En producción se generarían desde `horarios`, pero esa lógica automática queda fuera del alcance del curso.

- ¿Un bloque puede tener capacidad para más de un cliente a la vez?
  - No para el MVP. Cada bloque admite una sola reserva activa.

- ¿Existen excepciones al horario general, como días festivos o cierres especiales?
  - No para el MVP. El horario semanal en `horarios` es fijo.

- ¿Cuál es el intervalo mínimo de duración de un bloque?
  - 30 minutos.

- ¿Los horarios pueden variar por temporada?
  - No para el MVP. 
---

## Reservas

- ¿Cuántas veces puede reagendarse una reserva?
  - Sin límite definido para el MVP.

- ¿Existe un tiempo límite para cancelar o reagendar?
  - No para el MVP.

- ¿El historial de cambios de estado de una reserva necesita guardarse?
  - El estado actual se guarda en `reservaciones`. Los cambios importantes quedan en `registros`.

- ¿Una reserva cancelada libera automáticamente su bloque de disponibilidad?
  - Sí. Un trigger o el procedimiento de cancelación marca el bloque como disponible nuevamente.

- ¿Las notas del cliente son visibles para el owner en el panel privado?
  - Sí. El owner puede ver las notas que el cliente escribió al momento de reservar.

---

## Tracking

- ¿Cuánto tiempo es válido un código de tracking?
  - 30 días desde la creación de la reserva.

- ¿El código expira aunque la reserva siga activa?
  - Sí. La reserva puede seguir existiendo pero el código ya no sirve para consultarla.

- ¿Se puede regenerar el código si expira?
  - No para el MVP.

---

## Multi-tenancy y aislamiento

- ¿Un cliente con el mismo email puede tener reservas en dos tenants distintos?
  - Sí. Los clientes son independientes por tenant. El mismo email puede existir en múltiples negocios sin relación entre sí.

- ¿Existen datos compartidos entre tenants?
  - Solo los catálogos globales: `tipos_negocios`, `estados_dominios` y `estados_reservaciones`.

- ¿El superadmin puede ver las reservas individuales de un tenant?
  - No para el MVP.

---

## Reportes y auditoría

- ¿Qué métricas son las más importantes para el dashboard del owner?
  - Total de reservas del día, reservas del mes, y servicios más solicitados.

- ¿Los reportes pueden filtrarse por rango de fechas o por sede?
  - Por rango de fechas sí. Por sede es deseable pero no prioritario para el MVP.
