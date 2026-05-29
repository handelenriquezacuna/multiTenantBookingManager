import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Inicio",
  description: "MBM es un software de reservas online para negocios de servicios que necesitan agenda, disponibilidad y seguimiento en un solo lugar.",
  alternates: {
    canonical: "/"
  }
};

const benefits = [
  ["Pagina de reservas por negocio", "Cada negocio tiene un espacio publico donde sus clientes pueden elegir servicio, fecha y hora."],
  ["Panel operativo", "El equipo administra servicios, horarios, disponibilidad, clientes y reservas desde una vista clara."],
  ["Seguimiento por codigo", "Cada cliente recibe un codigo para consultar, cancelar o reagendar sin crear una cuenta."],
  ["Control multi negocio", "MBM permite operar distintos negocios dentro de una misma plataforma sin mezclar informacion."]
];

const industries = ["Clinicas", "Consultorios", "Barberias", "Salones", "Spas", "Veterinarias", "Centros esteticos", "Consultores"];

const previewBookings = [
  ["09:00", "Handel Enriquez", "Limpieza dental"],
  ["10:30", "Isaac Chaves", "Consulta odontologica"],
  ["12:00", "Andrew Fuentes", "Blanqueamiento"],
  ["15:00", "Luna Delgado", "Revision de control"]
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="marketing-hero refined-hero">
        <div className="marketing-copy">
          <p className="hero-kicker">Software de reservas multi negocio</p>
          <h1>Reservas online para negocios que viven de su agenda.</h1>
          <p>
            MBM centraliza paginas de reserva, servicios, disponibilidad y seguimiento para negocios de servicios.
            Simple para el cliente, ordenado para cada negocio.
          </p>
          <div className="marketing-actions">
            <Link className="btn" href="/register">Solicitar acceso</Link>
            <Link className="text-link" href="/book/clinica-dental-sonrisa">Ver reserva demo</Link>
          </div>
        </div>

        <div className="marketing-device" aria-label="Vista previa de MBM">
          <div className="device-toolbar">
            <span>Clinica Dental Sonrisa</span>
            <span>Agenda activa</span>
          </div>
          <div className="device-content">
            <div>
              <p className="section-eyebrow">Hoy</p>
              <h2>Reservas confirmadas por horario</h2>
            </div>
            <div className="device-metrics">
              <span>12 reservas</span>
              <span>9 horarios libres</span>
              <span>248 clientes</span>
            </div>
            <table className="data-table" aria-label="Reservas de ejemplo">
              <tbody>
                {previewBookings.map(([time, customer, service]) => (
                  <tr key={`${time}-${customer}`}>
                    <td>{time}</td>
                    <td>{customer}</td>
                    <td>{service}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "MBM Booking Manager",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "Software de reservas para negocios de servicios"
          })
        }}
      />

      <section className="marketing-band subtle-band">
        <span>Servicios</span>
        <span>Disponibilidad</span>
        <span>Reservas</span>
        <span>Clientes</span>
        <span>Reportes</span>
      </section>

      <section className="marketing-section split-section clean-section">
        <div>
          <p className="section-eyebrow">Producto SaaS para operar reservas</p>
          <h2>Una plataforma para negocios distintos, con una experiencia consistente.</h2>
        </div>
        <p>
          MBM no esta pensado para un solo rubro. Cada negocio configura sus servicios, horarios y disponibilidad,
          mientras sus clientes reservan desde una pagina publica propia.
        </p>
      </section>

      <section className="benefit-list clean-benefits">
        {benefits.map(([title, description]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="marketing-section industries-section clean-section">
        <p className="section-eyebrow">Diseñado para servicios con cita</p>
        <h2>Una base clara para clinicas, salones, consultorios y negocios locales.</h2>
        <div className="industry-row">
          {industries.map((industry) => <span key={industry}>{industry}</span>)}
        </div>
      </section>

      <section className="marketing-cta soft-cta">
        <div>
          <p className="section-eyebrow">Empieza con una agenda mas clara</p>
          <h2>Recibe reservas sin perder control de tus horarios.</h2>
        </div>
        <Link className="btn" href="/register">Solicitar acceso</Link>
      </section>
    </PublicShell>
  );
}
