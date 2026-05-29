import { BookingShell } from "@/components/layout/BookingShell";
import Link from "next/link";

export default function BookingConfirmationPage() {
  return (
    <BookingShell>
      <section className="confirmation-panel">
        <span className="badge">Reserva creada</span>
        <h1>Tu cita quedo registrada.</h1>
        <p>Guarda este codigo para consultar, cancelar o reagendar tu reserva cuando lo necesites.</p>
        <div className="tracking-code">MBM-8F3K2A</div>
        <div className="landing-actions">
          <Link className="btn" href="/track/MBM-8F3K2A">Consultar reserva</Link>
          <Link className="btn secondary" href="/book/clinica-dental-sonrisa">Volver al negocio</Link>
        </div>
      </section>
    </BookingShell>
  );
}
