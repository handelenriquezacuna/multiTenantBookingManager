"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { AvailabilityBlock } from "@/types/availability";

export function DatetimeSelection({ slug, blocks }: { slug: string; blocks: AvailabilityBlock[] }) {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service") || "";
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

  return (
    <div className="booking-flow">
      <div className="stepper" aria-label="Progreso de reserva">
        <span>Servicio</span>
        <span className="active">Fecha y hora</span>
        <span>Datos</span>
        <span>Confirmacion</span>
      </div>

      <div className="page-header">
        <div>
          <h1>Escoge fecha y hora</h1>
          <p>Solo se muestran horarios disponibles para reservar.</p>
        </div>
      </div>

      <section className="time-slot-list">
        {blocks.filter((block) => !block.isReserved).map((block) => {
          const selected = selectedBlockId === block.availabilityBlockId;
          return (
            <button
              type="button"
              key={block.availabilityBlockId}
              className={`time-slot ${selected ? "selected" : ""}`}
              onClick={() => setSelectedBlockId(block.availabilityBlockId)}
            >
              <span>{block.blockDate}</span>
              <strong>{block.startTime} - {block.endTime}</strong>
            </button>
          );
        })}
      </section>

      <div className="booking-actions">
        <Link className="btn secondary" href={`/book/${slug}/service`}>Volver</Link>
        {selectedBlockId ? (
          <Link className="btn" href={`/book/${slug}/customer?service=${serviceId}&block=${selectedBlockId}`}>Continuar</Link>
        ) : (
          <button className="btn" type="button" disabled>Selecciona un horario</button>
        )}
      </div>
    </div>
  );
}
