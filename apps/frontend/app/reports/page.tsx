import { PrivateShell } from "@/components/layout/PrivateShell";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { PageHeader } from "@/components/ui/page-header";
import { reportLabels } from "@/lib/labels";

const kpis = [
  ["Reservas totales", "143", "Periodo actual"],
  ["Clientes registrados", "248", "Con historial"],
  ["Servicios activos", "18", "Disponibles"],
  ["Horarios libres", "9", "Disponibles hoy"]
];

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

const tabs = [
  reportLabels.dashboard,
  reportLabels.dailyAgenda,
  reportLabels.bookingsDetail,
  reportLabels.servicesDemand,
  reportLabels.availabilityStatus
];

export default function ReportsPage() {
  return (
    <PrivateShell>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Reportes"
          subtitle="Indicadores operativos basados en reservas, servicios y disponibilidad."
        />

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab, i) => (
            <span
              key={tab}
              className={`rounded-full border px-3 py-1 text-sm ${i === 3 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            >
              {tab}
            </span>
          ))}
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(([label, value, helper]) => (
            <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 font-serif text-3xl font-medium">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-semibold">{reportLabels.servicesDemand}</h2>
            <SimpleTable headers={["Servicio", "Total de reservas", "Duracion"]} rows={demandRows} />
          </div>
          <div>
            <h2 className="mb-3 font-semibold">{reportLabels.availabilityStatus}</h2>
            <SimpleTable headers={["Fecha", "Horario", "Estado"]} rows={availabilityRows} />
          </div>
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          Datos ilustrativos. Cableado a <code className="font-mono">GET /reports/*</code> en el pase funcional.
        </p>
      </div>
    </PrivateShell>
  );
}
