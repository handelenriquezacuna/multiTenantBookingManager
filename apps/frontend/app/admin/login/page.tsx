"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { ApiError, apiPost, isMockMode, setAuthToken } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { LoginResponse } from "@/types/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isMockMode()) {
      router.push("/admin/tenants");
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost<LoginResponse>(endpoints.auth.login, {
        email,
        password,
        role: "superadmin"
      });
      setAuthToken(response.accessToken);
      router.push("/admin/tenants");
    } catch (err) {
      setError(err instanceof ApiError ? err.detail || err.title : "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicShell>
      <section className="card" style={{ maxWidth: 460 }}>
        <h2>Inicio de sesion superadmin</h2>
        <form className="grid" onSubmit={submitLogin}>
          <input
            placeholder="Correo"
            type="email"
            style={inputStyle}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            placeholder="Contrasena"
            type="password"
            style={inputStyle}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p className="field-helper" style={{ color: "var(--danger)" }}>{error}</p> : null}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </PublicShell>
  );
}

const inputStyle = { border: "1px solid var(--border)", borderRadius: "10px", padding: "0.7rem" };
