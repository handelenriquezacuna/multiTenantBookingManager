import { BookingShell } from "@/components/layout/BookingShell";
import Link from "next/link";

export default async function TrackCancelPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <BookingShell>
      <section className="track-detail card">
        <span className="badge">Reserva cancelada</span>
        <h1>Cita cancelada</h1>
        <dl>
          <div><dt>Codigo</dt><dd>{code}</dd></div>
          <div><dt>Estado</dt><dd>Cancelada</dd></div>
        </dl>
        <div className="track-actions">
          <Link className="btn" href="/track">Consultar otra reserva</Link>
          <Link className="btn secondary" href="/book/clinica-dental-sonrisa">Reservar de nuevo</Link>
        </div>
      </section>
    </BookingShell>
  );
}
