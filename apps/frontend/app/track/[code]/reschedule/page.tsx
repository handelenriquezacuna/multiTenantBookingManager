import { BookingShell } from "@/components/layout/BookingShell";
import Link from "next/link";
import { mockAvailability } from "@/lib/mock-data";

export default async function TrackReschedulePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const availableSlots = mockAvailability.filter((block) => !block.isReserved);

  return (
    <BookingShell>
      <section className="track-detail card">
        <span className="badge">Reagendar reserva</span>
        <h1>Elige un nuevo horario</h1>
        <p style={{ color: "var(--muted)" }}>Solo se muestran horarios disponibles para reservar.</p>
        <div className="reschedule-slot-list">
          {availableSlots.map((slot) => (
            <Link key={slot.availabilityBlockId} href={`/track/${code}`} className="reschedule-slot">
              <span>{slot.blockDate}</span>
              <strong>{slot.startTime} - {slot.endTime}</strong>
            </Link>
          ))}
        </div>
        <div className="track-actions">
          <Link className="btn secondary" href={`/track/${code}`}>Volver al detalle</Link>
        </div>
      </section>
    </BookingShell>
  );
}
