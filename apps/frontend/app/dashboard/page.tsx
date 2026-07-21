"use client";

import Link from "next/link";
import { PrivateShell } from "@/components/layout/PrivateShell";
import { buttonVariants } from "@/components/ui/button";
import { endpoints } from "@/lib/endpoints";
import { useResource, useResourceOne } from "@/lib/resource";
import { mockBookings } from "@/lib/mock-data";
import type { Booking } from "@/types/booking";

type Dashboard = {
  name: string;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalCustomers: number;
  totalActiveServices: number;
  totalActiveLocations: number;
};

const mockDashboard: Dashboard = {
  name: "Clinica Dental Sonrisa",
  totalBookings: 143,
  pendingBookings: 12,
  confirmedBookings: 110,
  cancelledBookings: 21,
  totalCustomers: 248,
  totalActiveServices: 18,
  totalActiveLocations: 2
};

const statusLabels: Record<Booking["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  rescheduled: "Reagendada"
};

function statusClass(status: Booking["status"]) {
  if (status === "confirmed") return "bg-primary/10 text-primary";
  if (status === "pending") return "bg-muted text-muted-foreground";
  if (status === "cancelled") return "bg-destructive/10 text-destructive";
  return "bg-foreground/10 text-foreground";
}

export default function DashboardPage() {
  const { data: summary } = useResourceOne<Dashboard>(endpoints.reports.dashboard, mockDashboard);
  const { items: bookings } = useResource<Booking>(endpoints.bookings.list, mockBookings);

  const kpis: [string, number, string][] = [
    ["Reservas totales", summary.totalBookings, "acumuladas"],
    ["Pendientes", summary.pendingBookings, "por confirmar"],
    ["Servicios activos", summary.totalActiveServices, "disponibles para reservar"],
    ["Clientes", summary.totalCustomers, "registrados"]
  ];
  const recent = bookings.slice(0, 5);
  const agenda = bookings.slice(0, 4);

  return (
    <PrivateShell>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vista operativa de {summary.name}: reservas, agenda y acciones principales.
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
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Sin reservas recientes.</td>
                    </tr>
                  ) : (
                    recent.map((booking) => (
                      <tr key={booking.bookingId}>
                        <td className="px-5 py-3 font-semibold">{booking.customerName}</td>
                        <td className="px-5 py-3 text-muted-foreground">{booking.serviceName}</td>
                        <td className="px-5 py-3 text-muted-foreground">{booking.bookingDate}</td>
                        <td className="px-5 py-3 font-mono text-xs">{booking.startTime}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(booking.status)}`}>
                            {statusLabels[booking.status]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold">Agenda</h2>
            </div>
            <div className="space-y-2 p-4">
              {agenda.map((booking) => (
                <div key={booking.bookingId} className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5">
                  <span className="w-12 font-mono text-xs text-muted-foreground">{booking.startTime}</span>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">{booking.customerName}</strong>
                    <p className="truncate text-xs text-muted-foreground">{booking.serviceName}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </PrivateShell>
  );
}
