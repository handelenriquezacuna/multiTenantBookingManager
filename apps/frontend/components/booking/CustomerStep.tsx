"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function CustomerStep({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service") || "1";
  const blockId = searchParams.get("block") || "101";
  const [ready, setReady] = useState(false);

  return (
    <div className="booking-flow">
      <div className="stepper" aria-label="Progreso de reserva">
        <span>Servicio</span>
        <span>Fecha y hora</span>
        <span className="active">Datos</span>
        <span>Confirmacion</span>
      </div>

      <div className="page-header">
        <div>
          <h1>Completa tus datos</h1>
          <p>Usaremos esta informacion solo para gestionar tu reserva.</p>
        </div>
      </div>

      <section className="checkout-layout">
        <form className="auth-card form-stack" onChange={() => setReady(true)}>
          <label className="field-group"><span>Nombre</span><input placeholder="Sofia" /></label>
          <label className="field-group"><span>Apellido</span><input placeholder="Campos" /></label>
          <label className="field-group"><span>Correo electronico</span><input type="email" placeholder="sofia@email.com" /></label>
          <label className="field-group"><span>Telefono</span><input placeholder="8888-8888" /></label>
          <label className="field-group"><span>Notas opcionales</span><textarea placeholder="Algo que el negocio deba saber" rows={4} /></label>
        </form>

        <aside className="panel">
          <div className="panel-header"><h3>Resumen</h3></div>
          <div className="panel-body">
            <p><strong>Negocio:</strong> Barberia Elite</p>
            <p><strong>Servicio:</strong> Corte clasico</p>
            <p><strong>Horario:</strong> 09:00</p>
            <p className="field-helper">Recibiras un codigo para consultar, cancelar o reagendar tu reserva.</p>
          </div>
        </aside>
      </section>

      <div className="booking-actions">
        <Link className="btn secondary" href={`/book/${slug}/datetime?service=${serviceId}`}>Volver</Link>
        {ready ? (
          <Link className="btn" href={`/book/${slug}/confirmation?service=${serviceId}&block=${blockId}`}>Confirmar reserva</Link>
        ) : (
          <button className="btn" type="button" disabled>Completa tus datos</button>
        )}
      </div>
    </div>
  );
}
