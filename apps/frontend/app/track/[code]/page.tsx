import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingShell } from "@/components/layout/BookingShell";
import { apiGet, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { mockBookings } from "@/lib/mock-data";
import type { Booking } from "@/types/booking";

async function loadBooking(code: string): Promise<Booking | null> {
  if (isMockMode()) {
    return mockBookings.find((item) => item.trackingCode === code) || mockBookings[0];
  }
  try {
    return await apiGet<Booking>(endpoints.track.get(code));
  } catch {
    return null;
  }
}

export default async function TrackPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const booking = await loadBooking(code);
  if (!booking) {
    notFound();
  }
  return (
    <BookingShell>
      <section className="track-detail card">
        <span className="badge">Reserva encontrada</span>
        <h1>Detalle de tu cita</h1>
        <dl>
          <div><dt>Codigo</dt><dd>{booking.trackingCode}</dd></div>
          <div><dt>Cliente</dt><dd>{booking.customerName}</dd></div>
          <div><dt>Servicio</dt><dd>{booking.serviceName}</dd></div>
          <div><dt>Fecha</dt><dd>{booking.bookingDate} · {booking.startTime}</dd></div>
          <div><dt>Estado</dt><dd>{booking.status}</dd></div>
        </dl>
        <div className="track-actions">
          <Link className="btn" href={`/track/${booking.trackingCode}/reschedule`}>
            Reagendar
          </Link>
          <Link className="btn secondary" href={`/track/${booking.trackingCode}/cancel`}>
            Cancelar
          </Link>
        </div>
      </section>
    </BookingShell>
  );
}
