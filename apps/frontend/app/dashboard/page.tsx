import { PrivateShell } from "@/components/layout/PrivateShell";

const kpis = [
  ["Reservas hoy", "12", "+3 vs ayer"],
  ["Proximas", "34", "7 dias"],
  ["Servicios activos", "18", "2 destacados"],
  ["Clientes", "248", "+15 este mes"]
];

const recentBookings = [
  ["Handel Enriquez", "Limpieza dental", "Hoy", "09:00", "Confirmada"],
  ["Isaac Chaves", "Consulta odontologica", "Hoy", "10:30", "Pendiente"],
  ["Andrew Fuentes", "Blanqueamiento", "Hoy", "12:00", "Confirmada"],
  ["Luna Delgado", "Revision de control", "Manana", "08:30", "Reagendada"]
];

const agenda = [
  ["09:00", "Handel Enriquez", "Limpieza dental"],
  ["10:30", "Isaac Chaves", "Consulta odontologica"],
  ["12:00", "Andrew Fuentes", "Blanqueamiento"],
  ["15:30", "Melannie Campos", "Revision de control"]
];

export default function DashboardPage() {
  return (
    <PrivateShell>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Vista operativa del negocio: reservas de hoy, disponibilidad y acciones principales.</p>
        </div>
        <a className="btn" href="/availability">Crear disponibilidad</a>
      </div>

      <section className="kpi-strip" aria-label="Indicadores principales">
        {kpis.map(([label, value, helper]) => (
          <article className="kpi-panel" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small style={{ color: "var(--muted)" }}>{helper}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-layout">
        <div className="panel">
          <div className="panel-header">
            <h2>Reservas recientes</h2>
            <a href="/bookings" style={{ color: "var(--primary)", fontWeight: 800 }}>Ver todas</a>
          </div>
          <div className="panel-body" style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(([customer, service, date, time, status]) => (
                  <tr key={`${customer}-${time}`}>
                    <td><strong>{customer}</strong></td>
                    <td>{service}</td>
                    <td>{date}</td>
                    <td>{time}</td>
                    <td><span className="status-dot">{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel">
          <div className="panel-header">
            <h3>Agenda de hoy</h3>
          </div>
          <div className="panel-body agenda-list">
            {agenda.map(([time, customer, service]) => (
              <div className="agenda-item" key={`${time}-${customer}`}>
                <span className="agenda-time">{time}</span>
                <div>
                  <strong>{customer}</strong>
                  <p style={{ margin: "0.2rem 0 0", color: "var(--muted)", fontSize: "0.88rem" }}>{service}</p>
                </div>
                <span className="status-dot">activa</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </PrivateShell>
  );
}
