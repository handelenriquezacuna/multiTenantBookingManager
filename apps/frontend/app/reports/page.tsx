import { PrivateShell } from "@/components/layout/PrivateShell";
import { reportLabels } from "@/lib/labels";

const demandRows = [
  ["Limpieza dental", "42 reservas", "45 min"],
  ["Consulta odontologica", "28 reservas", "30 min"],
  ["Blanqueamiento dental", "21 reservas", "60 min"]
];

const availabilityRows = [
  ["2026-05-20", "09:00 - 09:30", "Disponible"],
  ["2026-05-20", "11:00 - 11:30", "Disponible"],
  ["2026-05-20", "14:00 - 14:30", "Disponible"]
];

export default function ReportsPage() {
  return (
    <PrivateShell>
      <div className="page-header">
        <div>
          <h1>Reportes</h1>
          <p>Consulta indicadores operativos basados en reservas, servicios y disponibilidad del negocio.</p>
        </div>
      </div>

      <section className="report-tabs" aria-label="Tipos de reporte disponibles">
        <span>{reportLabels.dashboard}</span>
        <span>{reportLabels.dailyAgenda}</span>
        <span>{reportLabels.bookingsDetail}</span>
        <span>{reportLabels.servicesDemand}</span>
        <span>{reportLabels.availabilityStatus}</span>
      </section>

      <section className="kpi-strip" style={{ marginTop: "24px" }}>
        <article className="kpi-panel"><span>Reservas totales</span><strong>143</strong><small>Periodo actual</small></article>
        <article className="kpi-panel"><span>Clientes registrados</span><strong>248</strong><small>Con historial de reservas</small></article>
        <article className="kpi-panel"><span>Servicios activos</span><strong>18</strong><small>Disponibles para reserva</small></article>
        <article className="kpi-panel"><span>Horarios libres</span><strong>9</strong><small>Disponibles hoy</small></article>
      </section>

      <section className="dashboard-layout">
        <div className="panel">
          <div className="panel-header"><h2>{reportLabels.servicesDemand}</h2></div>
          <div className="panel-body" style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead><tr><th>Servicio</th><th>Total de reservas</th><th>Duracion</th></tr></thead>
              <tbody>
                {demandRows.map(([service, total, duration]) => (
                  <tr key={service}><td>{service}</td><td>{total}</td><td>{duration}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel">
          <div className="panel-header"><h3>{reportLabels.availabilityStatus}</h3></div>
          <div className="panel-body" style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead><tr><th>Fecha</th><th>Horario</th><th>Estado</th></tr></thead>
              <tbody>
                {availabilityRows.map(([date, time, status]) => (
                  <tr key={`${date}-${time}`}><td>{date}</td><td>{time}</td><td>{status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </section>
    </PrivateShell>
  );
}
