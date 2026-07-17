"""Pure mapper functions: Spanish SQL row (dict) -> English snake_case dict.

No I/O here. Callers (repositories/services) feed in the dict produced by
db.exec_sp / db.query_view (already built from cursor.description) and get
back a dict whose keys match the Pydantic schema field names in app/schemas
(which then render as camelCase over the wire via alias_generator=to_camel).

NOTE on assumed Spanish column names: the DB rename to Spanish identifiers
(tables/views/SPs) is happening in parallel in another work package. Table
names are fixed by the WP5 brief; the *column* names used below are this
agent's best-effort, consistent guess (following the one confirmed example:
servicio_id/nombre/duracion_minutos) and MUST be reconciled against the real
vw_* view / SP output column list in WP6/7.
"""
