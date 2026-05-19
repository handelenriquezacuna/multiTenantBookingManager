"use client";

import Link from "next/link";
import { useState } from "react";
import type { Service } from "@/types/service";

export function ServiceSelection({ slug, services }: { slug: string; services: Service[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = services.find((service) => service.serviceId === selectedId);

  return (
    <div className="booking-flow">
      <div className="stepper" aria-label="Progreso de reserva">
        <span className="active">Servicio</span>
        <span>Fecha y hora</span>
        <span>Datos</span>
        <span>Confirmacion</span>
      </div>

      <div className="page-header">
        <div>
          <h1>Elige un servicio</h1>
          <p>Selecciona el servicio que quieres reservar. Podras escoger fecha y hora en el siguiente paso.</p>
        </div>
      </div>

      <section className="selection-list">
        {services.map((service) => {
          const isSelected = selectedId === service.serviceId;
          return (
            <button
              type="button"
              key={service.serviceId}
              className={`selection-row ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedId(service.serviceId)}
            >
              <div>
                <strong>{service.name}</strong>
                <p>{service.description}</p>
              </div>
              <div className="selection-meta">
                <span>{service.durationMinutes} min</span>
                {service.showPrice && service.price ? <span>CRC {service.price}</span> : null}
              </div>
            </button>
          );
        })}
      </section>

      <div className="booking-actions">
        <Link className="btn secondary" href={`/book/${slug}`}>Volver</Link>
        {selected ? (
          <Link className="btn" href={`/book/${slug}/datetime?service=${selected.serviceId}`}>Continuar</Link>
        ) : (
          <button className="btn" type="button" disabled>Selecciona un servicio</button>
        )}
      </div>
    </div>
  );
}
