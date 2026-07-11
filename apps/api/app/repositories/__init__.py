"""Repository layer: the only layer allowed to know about SQL/stored
procedures/views. Each class wraps a single pyodbc.Connection (handed in per
request via app.deps.get_db) and exposes typed methods that call
app.db.exec_sp / app.db.query_view.

For WP5 these methods contain the real call plumbing (SP/view name, param
shape) but not yet the full validation/business-rule handling - that lands
in WP6/WP7 once the SPs and views exist in the database. Callers should treat
NotImplementedError as "not wired yet" for anything beyond the basic call.
"""
