"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { ApiError, apiPost, isMockMode, setAuthToken } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { LoginResponse } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isMockMode()) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost<LoginResponse>(endpoints.auth.login, {
        email,
        password,
        role: "owner"
      });
      setAuthToken(response.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.detail || err.title : "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

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
          <form className="form-stack" onSubmit={submitLogin}>
            <label className="field-group">
              <span>Correo electronico</span>
              <input
                placeholder="owner@negocio.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="field-group">
              <span>Contrasena</span>
              <input
                placeholder="Tu contrasena"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error ? <p className="field-helper" style={{ color: "var(--danger)" }}>{error}</p> : null}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Entrar al panel"}
            </button>
            <p className="field-helper">
              Aun no tienes negocio? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 800 }}>Solicita acceso</Link>.
            </p>
          </form>
        </section>
      </section>
    </PublicShell>
  );
}
