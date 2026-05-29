import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export default function AdminLoginPage() {
  return (
    <PublicShell>
      <section className="card" style={{ maxWidth: 460 }}>
        <h2>Inicio de sesion superadmin</h2>
        <form className="grid">
          <input placeholder="Correo" type="email" style={inputStyle} />
          <input placeholder="Contrasena" type="password" style={inputStyle} />
          <Link className="btn" href="/admin/tenants">Ingresar</Link>
        </form>
      </section>
    </PublicShell>
  );
}

const inputStyle = { border: "1px solid var(--border)", borderRadius: "10px", padding: "0.7rem" };
