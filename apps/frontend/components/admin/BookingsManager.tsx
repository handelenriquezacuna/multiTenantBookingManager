"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader, selectClass } from "@/components/ui/page-header";
import { mockAvailability, mockBookings } from "@/lib/mock-data";
import type { Booking } from "@/types/booking";

function statusClass(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-primary/10 text-primary";
    case "completed":
      return "bg-foreground/10 text-foreground";
    case "cancelled":
      return "bg-destructive/10 text-destructive";
    case "rescheduled":
      return "bg-primary/5 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");

  function setStatus(id: number, status: Booking["status"]) {
    setBookings((current) =>
      current.map((booking) => (booking.bookingId === id ? { ...booking, status } : booking))
    );
  }

  function openReschedule(booking: Booking) {
    setSelectedBooking(booking);
    setSelectedSlot("");
  }

  function rescheduleBooking() {
    if (!selectedBooking || !selectedSlot) return;
    const slot = mockAvailability.find((block) => String(block.availabilityBlockId) === selectedSlot);
    if (!slot) return;
    setBookings((current) =>
      current.map((booking) =>
        booking.bookingId === selectedBooking.bookingId
          ? { ...booking, bookingDate: slot.blockDate, startTime: slot.startTime, status: "rescheduled" }
          : booking
      )
    );
    setSelectedBooking(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Reservas"
        subtitle="Revisa, confirma, completa, cancela o reagenda citas desde el panel del negocio."
      />

      <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Agenda de reservas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Servicio</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Hora</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Codigo</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td className="px-5 py-3 font-semibold">{booking.customerName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{booking.serviceName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{booking.bookingDate}</td>
                  <td className="px-5 py-3 font-mono text-xs">{booking.startTime}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{booking.trackingCode}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <button type="button" onClick={() => setStatus(booking.bookingId, "confirmed")} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Confirmar</button>
                      <button type="button" onClick={() => setStatus(booking.bookingId, "completed")} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Completar</button>
                      <button type="button" onClick={() => openReschedule(booking)} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Reagendar</button>
                      <button type="button" onClick={() => setStatus(booking.bookingId, "cancelled")} className="rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10">Cancelar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Reagendar reserva">
        {selectedBooking ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/60 p-4 text-sm">
              <strong className="block">{selectedBooking.customerName}</strong>
              <span className="text-muted-foreground">{selectedBooking.serviceName}</span>
              <span className="mt-1 block text-muted-foreground">
                {selectedBooking.bookingDate} - {selectedBooking.startTime}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-slot">Nuevo horario disponible</Label>
              <select id="new-slot" className={selectClass} value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                <option value="">Selecciona un horario</option>
                {mockAvailability.filter((b) => !b.isReserved).map((block) => (
                  <option key={block.availabilityBlockId} value={block.availabilityBlockId}>
                    {block.blockDate} - {block.startTime} a {block.endTime}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>Cancelar</Button>
              <Button onClick={rescheduleBooking}>Guardar reagendamiento</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
