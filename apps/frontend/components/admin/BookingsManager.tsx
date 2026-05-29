"use client";

import { useState } from "react";
import { mockAvailability, mockBookings } from "@/lib/mock-data";
import type { Booking } from "@/types/booking";

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");

  function setStatus(id: number, status: Booking["status"]) {
    setBookings((current) => current.map((booking) => booking.bookingId === id ? { ...booking, status } : booking));
  }

  function openReschedule(booking: Booking) {
    setSelectedBooking(booking);
    setSelectedSlot("");
  }

  function rescheduleBooking() {
    if (!selectedBooking || !selectedSlot) return;
    const slot = mockAvailability.find((block) => String(block.availabilityBlockId) === selectedSlot);
    if (!slot) return;

    setBookings((current) => current.map((booking) => booking.bookingId === selectedBooking.bookingId ? {
      ...booking,
      bookingDate: slot.blockDate,
      startTime: slot.startTime,
      status: "rescheduled"
    } : booking));
    setSelectedBooking(null);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Reservas</h1>
          <p>Revisa, confirma, completa, cancela o reagenda citas desde el panel del negocio.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header"><h2>Agenda de reservas</h2></div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Codigo</th><th>Acciones</th></tr></thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td><strong>{booking.customerName}</strong></td>
                  <td>{booking.serviceName}</td>
                  <td>{booking.bookingDate}</td>
                  <td>{booking.startTime}</td>
                  <td><span className={`status-dot status-${booking.status}`}>{booking.status}</span></td>
                  <td>{booking.trackingCode}</td>
                  <td className="row-actions">
                    <button type="button" onClick={() => setStatus(booking.bookingId, "confirmed")}>Confirmar</button>
                    <button type="button" onClick={() => setStatus(booking.bookingId, "completed")}>Completar</button>
                    <button type="button" onClick={() => openReschedule(booking)}>Reagendar</button>
                    <button type="button" className="danger" onClick={() => setStatus(booking.bookingId, "cancelled")}>Cancelar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedBooking ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Reagendar reserva</h2>
              <button type="button" onClick={() => setSelectedBooking(null)}>Cerrar</button>
            </div>
            <div className="form-stack">
              <div className="availability-preview">
                <strong>{selectedBooking.customerName}</strong>
                <span>{selectedBooking.serviceName}</span>
                <span>{selectedBooking.bookingDate} · {selectedBooking.startTime}</span>
              </div>
              <label className="field-group">
                <span>Nuevo horario disponible</span>
                <select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)}>
                  <option value="">Selecciona un horario</option>
                  {mockAvailability.filter((block) => !block.isReserved).map((block) => (
                    <option key={block.availabilityBlockId} value={block.availabilityBlockId}>
                      {block.blockDate} · {block.startTime} - {block.endTime}
                    </option>
                  ))}
                </select>
              </label>
              <div className="settings-actions">
                <button className="btn secondary" type="button" onClick={() => setSelectedBooking(null)}>Cancelar</button>
                <button className="btn" type="button" onClick={rescheduleBooking}>Guardar reagendamiento</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
