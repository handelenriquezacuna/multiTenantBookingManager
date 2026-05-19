import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export default function LoginPage() {
  return (
    <PublicShell>
      <section className="auth-page">
        <div className="auth-visual">
          <span className="badge">Acceso privado</span>
          <h1>Gestiona tu agenda con calma.</h1>
          <p>
            Entra al panel de tu negocio para revisar reservas, administrar servicios y abrir nuevos bloques de disponibilidad.
          </p>
          <div className="trust-row">
            <span className="trust-pill">Acceso seguro</span>
            <span className="trust-pill">Datos separados por negocio</span>
            <span className="trust-pill">Agenda siempre organizada</span>
          </div>
        </div>

        <section className="auth-card" aria-labelledby="login-title">
          <p className="section-eyebrow">MBM Booking Manager</p>
          <h2 id="login-title" style={{ margin: 0, fontSize: "1.65rem" }}>Iniciar sesion</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>
            Accede al espacio privado para administrar servicios, disponibilidad, clientes y reservas.
          </p>
          <form className="form-stack">
            <label className="field-group">
              <span>Correo electronico</span>
              <input placeholder="owner@negocio.com" type="email" />
            </label>
            <label className="field-group">
              <span>Contrasena</span>
              <input placeholder="Tu contrasena" type="password" />
            </label>
            <Link href="/dashboard" className="btn">Entrar al panel</Link>
            <p className="field-helper">
              Aun no tienes negocio? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 800 }}>Solicita acceso</Link>.
            </p>
          </form>
        </section>
      </section>
    </PublicShell>
  );
}
