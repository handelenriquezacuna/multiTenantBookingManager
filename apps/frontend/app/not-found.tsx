import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="not-found-page">
        <span className="badge">404</span>
        <h1>Pagina no encontrada</h1>
        <p>La ruta que buscas no existe o ya no esta disponible.</p>
        <div className="track-actions">
          <Link className="btn" href="/">Volver al inicio</Link>
          <Link className="btn secondary" href="/track">Consultar reserva</Link>
        </div>
      </section>
    </PublicShell>
  );
}
