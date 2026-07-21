"use client";

import { PrivateShell } from "@/components/layout/PrivateShell";
import { PageHeader } from "@/components/ui/page-header";
import { reportLabels } from "@/lib/labels";
import { endpoints } from "@/lib/endpoints";
import { useResource, useResourceOne } from "@/lib/resource";

type Dashboard = {
  totalBookings: number;
  totalCustomers: number;
  totalActiveServices: number;
  totalActiveLocations: number;
};

type ServiceDemand = { serviceId: number; serviceName: string; totalBookings: number; lastBookingAt: string | null };

type AvailabilityStatus = {
  availabilityBlockId: number;
  locationName: string;
  blockDate: string;
  startTime: string;
  endTime: string;
  isReserved: boolean;
};

const mockDashboard: Dashboard = { totalBookings: 143, totalCustomers: 248, totalActiveServices: 18, totalActiveLocations: 2 };

const mockDemand: ServiceDemand[] = [
  { serviceId: 1, serviceName: "Limpieza dental", totalBookings: 42, lastBookingAt: "2026-05-19" },
  { serviceId: 2, serviceName: "Consulta odontologica", totalBookings: 28, lastBookingAt: "2026-05-18" },
  { serviceId: 3, serviceName: "Blanqueamiento dental", totalBookings: 21, lastBookingAt: "2026-05-15" }
];

const mockAvailability: AvailabilityStatus[] = [
  { availabilityBlockId: 1, locationName: "Sede central", blockDate: "2026-05-20", startTime: "09:00", endTime: "09:30", isReserved: false },
  { availabilityBlockId: 2, locationName: "Sede central", blockDate: "2026-05-20", startTime: "11:00", endTime: "11:30", isReserved: false },
  { availabilityBlockId: 3, locationName: "Sede central", blockDate: "2026-05-20", startTime: "14:00", endTime: "14:30", isReserved: true }
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const tabs = [
  reportLabels.dashboard,
  reportLabels.dailyAgenda,
  reportLabels.bookingsDetail,
  reportLabels.servicesDemand,
  reportLabels.availabilityStatus
];

export default function ReportsPage() {
  const { data: summary } = useResourceOne<Dashboard>(endpoints.reports.dashboard, mockDashboard);
  const { items: demand } = useResource<ServiceDemand>(endpoints.reports.servicesDemand, mockDemand);
  const { items: availability } = useResource<AvailabilityStatus>(
    `${endpoints.reports.availabilityStatus}?date=${todayIso()}`,
    mockAvailability
  );

  const kpis: [string, number, string][] = [
    ["Reservas totales", summary.totalBookings, "acumuladas"],
    ["Clientes registrados", summary.totalCustomers, "con historial"],
    ["Servicios activos", summary.totalActiveServices, "disponibles"],
    ["Sedes activas", summary.totalActiveLocations, "operando"]
  ];

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
          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold">{reportLabels.servicesDemand}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Servicio</th>
                    <th className="px-5 py-3 font-medium">Reservas</th>
                    <th className="px-5 py-3 font-medium">Ultima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {demand.map((row) => (
                    <tr key={row.serviceId}>
                      <td className="px-5 py-3 font-semibold">{row.serviceName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.totalBookings}</td>
                      <td className="px-5 py-3 text-muted-foreground">{row.lastBookingAt?.slice(0, 10) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold">{reportLabels.availabilityStatus}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Fecha</th>
                    <th className="px-5 py-3 font-medium">Horario</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {availability.map((row) => (
                    <tr key={row.availabilityBlockId}>
                      <td className="px-5 py-3 text-muted-foreground">{row.blockDate}</td>
                      <td className="px-5 py-3 font-mono text-xs">{row.startTime} - {row.endTime}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.isReserved ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                          {row.isReserved ? "Reservado" : "Disponible"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </PrivateShell>
  );
}
