"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BookingShell } from "@/components/layout/BookingShell";

export default function TrackLookupPage() {
  const router = useRouter();
  const [code, setCode] = useState("MBM-8F3K2A");

  function submitTrackingCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return;
    router.push(`/track/${encodeURIComponent(normalizedCode)}`);
  }

  return (
    <BookingShell>
      <section className="track-lookup">
        <div>
          <span className="badge">Seguimiento de reserva</span>
          <h1>Consulta tu cita</h1>
          <p>Ingresa el codigo que recibiste al confirmar la reserva para ver, cancelar o reagendar tu cita.</p>
        </div>
        <form className="track-card" onSubmit={submitTrackingCode}>
          <label className="field-group">
            <span>Codigo de tracking</span>
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="MBM-8F3K2A" />
          </label>
          <button className="btn" type="submit">Consultar reserva</button>
        </form>
      </section>
    </BookingShell>
  );
}
