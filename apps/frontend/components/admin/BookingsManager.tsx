"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader, selectClass } from "@/components/ui/page-header";
import { apiPost, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { errMessage, useResource } from "@/lib/resource";
import { mockAvailability, mockBookings } from "@/lib/mock-data";
import type { AvailabilityBlock } from "@/types/availability";
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
  const { items: bookings, setItems: setBookings, loading, error, setError, reload } = useResource<Booking>(
    endpoints.bookings.list,
    mockBookings
  );
  const { items: availability } = useResource<AvailabilityBlock>(endpoints.availabilityBlocks.list, mockAvailability);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  function replace(updated: Booking) {
    setBookings((current) => current.map((b) => (b.bookingId === updated.bookingId ? updated : b)));
  }

  async function lifecycle(booking: Booking, action: "confirm" | "complete" | "cancel") {
    const status: Booking["status"] = action === "confirm" ? "confirmed" : action === "complete" ? "completed" : "cancelled";
    if (isMockMode()) {
      replace({ ...booking, status });
      return;
    }
    setError(null);
    setBusyId(booking.bookingId);
    try {
      const url = endpoints.bookings[action](booking.bookingId);
      const updated = await apiPost<Booking>(url);
      replace(updated);
    } catch (err) {
      setError(errMessage(err, "No se pudo actualizar la reserva."));
    } finally {
      setBusyId(null);
    }
  }

  function openReschedule(booking: Booking) {
    setSelectedBooking(booking);
    setSelectedSlot("");
  }

  async function rescheduleBooking() {
    if (!selectedBooking || !selectedSlot) return;
    const target = selectedBooking;

    if (isMockMode()) {
      const slot = availability.find((block) => String(block.availabilityBlockId) === selectedSlot);
      if (!slot) return;
      replace({ ...target, bookingDate: slot.blockDate, startTime: slot.startTime, status: "rescheduled" });
      setSelectedBooking(null);
      return;
    }

    setError(null);
    setBusyId(target.bookingId);
    try {
      const updated = await apiPost<Booking>(endpoints.bookings.reschedule(target.bookingId), {
        newAvailabilityBlockId: Number(selectedSlot)
      });
      replace(updated);
      setSelectedBooking(null);
    } catch (err) {
      setError(errMessage(err, "No se pudo reagendar la reserva."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Reservas"
        subtitle="Revisa, confirma, completa, cancela o reagenda citas desde el panel del negocio."
      />

      {error ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={reload} className="font-semibold hover:underline">
            Reintentar
          </button>
        </div>
      ) : null}

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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">Cargando reservas...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    Aun no hay reservas.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.bookingId} className={busyId === booking.bookingId ? "opacity-50" : undefined}>
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
                        <button type="button" onClick={() => lifecycle(booking, "confirm")} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Confirmar</button>
                        <button type="button" onClick={() => lifecycle(booking, "complete")} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Completar</button>
                        <button type="button" onClick={() => openReschedule(booking)} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Reagendar</button>
                        <button type="button" onClick={() => lifecycle(booking, "cancel")} className="rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10">Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
                {availability.filter((b) => !b.isReserved).map((block) => (
                  <option key={block.availabilityBlockId} value={block.availabilityBlockId}>
                    {block.blockDate} - {block.startTime} a {block.endTime}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>Cancelar</Button>
              <Button onClick={rescheduleBooking} disabled={busyId === selectedBooking.bookingId}>Guardar reagendamiento</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
