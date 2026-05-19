import { PublicShell } from "@/components/layout/PublicShell";

export default function RegisterPage() {
  return (
    <PublicShell>
      <section className="auth-page">
        <div className="auth-visual">
          <span className="badge">Solicitud de acceso</span>
          <h1>Crea la pagina de reservas de tu negocio.</h1>
          <p>
            Comparte los datos principales de tu negocio para preparar tu espacio de reservas y comenzar a organizar citas.
          </p>
          <div className="panel" style={{ marginTop: "1.35rem", maxWidth: 520 }}>
            <div className="panel-header"><h3>Despues del registro</h3></div>
            <div className="panel-body">
              <ol style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)", lineHeight: 1.8 }}>
                <li>Revisamos la solicitud del negocio.</li>
                <li>Activamos el acceso cuando todo este listo.</li>
                <li>Configuras servicios, horarios y disponibilidad.</li>
              </ol>
            </div>
          </div>
        </div>

        <section className="auth-card" aria-labelledby="register-title">
          <p className="section-eyebrow">Nuevo negocio</p>
          <h2 id="register-title" style={{ margin: 0, fontSize: "1.65rem" }}>Solicitar acceso</h2>
          <form className="form-stack" style={{ marginTop: "1rem" }}>
            <label className="field-group">
              <span>Nombre de la persona responsable</span>
              <input placeholder="Sofia Campos" />
            </label>
            <label className="field-group">
              <span>Correo de contacto</span>
              <input placeholder="owner@negocio.com" type="email" />
            </label>
            <label className="field-group">
              <span>Telefono</span>
              <input placeholder="8888-8888" />
            </label>
            <label className="field-group">
              <span>Nombre del negocio</span>
              <input placeholder="Barberia Elite" />
            </label>
            <label className="field-group">
              <span>Tipo de negocio</span>
              <select defaultValue="barberia">
                <option value="barberia">Barberia</option>
                <option value="salon">Salon de belleza</option>
                <option value="spa">Spa</option>
                <option value="veterinaria">Veterinaria</option>
                <option value="clinica">Clinica</option>
              </select>
            </label>
            <label className="field-group">
              <span>Slug publico</span>
              <input placeholder="barberia-elite" />
              <small className="field-helper">Vista previa: /book/barberia-elite</small>
            </label>
            <button className="btn" type="button">Enviar solicitud</button>
          </form>
        </section>
      </section>
    </PublicShell>
  );
}
