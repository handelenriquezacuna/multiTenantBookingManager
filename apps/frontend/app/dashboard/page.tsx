import Link from "next/link";
import { PrivateShell } from "@/components/layout/PrivateShell";
import { buttonVariants } from "@/components/ui/button";

const kpis = [
  ["Reservas hoy", "12", "en la agenda de hoy"],
  ["Proximas", "34", "en los proximos 7 dias"],
  ["Servicios activos", "18", "disponibles para reservar"],
  ["Clientes", "248", "registrados"]
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

function statusClass(status: string) {
  if (status === "Confirmada") return "bg-primary/10 text-primary";
  if (status === "Pendiente") return "bg-muted text-muted-foreground";
  return "bg-foreground/10 text-foreground";
}

export default function DashboardPage() {
  return (
    <PrivateShell>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vista operativa del negocio: reservas de hoy, agenda y acciones principales.
            </p>
          </div>
          <Link href="/bookings" className={buttonVariants({ size: "sm" })}>
            Ver reservas
          </Link>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Indicadores">
          {kpis.map(([label, value, helper]) => (
            <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 font-serif text-3xl font-medium">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold">Reservas recientes</h2>
              <Link href="/bookings" className="text-sm font-semibold text-primary hover:underline">
                Ver todas
              </Link>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentBookings.map(([customer, service, date, time, status]) => (
                    <tr key={`${customer}-${time}`}>
                      <td className="px-5 py-3 font-semibold">{customer}</td>
                      <td className="px-5 py-3 text-muted-foreground">{service}</td>
                      <td className="px-5 py-3 text-muted-foreground">{date}</td>
                      <td className="px-5 py-3 font-mono text-xs">{time}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold">Agenda de hoy</h2>
            </div>
            <div className="space-y-2 p-4">
              {agenda.map(([time, customer, service]) => (
                <div key={`${time}-${customer}`} className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5">
                  <span className="w-12 font-mono text-xs text-muted-foreground">{time}</span>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">{customer}</strong>
                    <p className="truncate text-xs text-muted-foreground">{service}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          Datos ilustrativos. El cableado a <code className="font-mono">GET /reports/dashboard</code> es
          parte del pase funcional.
        </p>
      </div>
    </PrivateShell>
  );
}
