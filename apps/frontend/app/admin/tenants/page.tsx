"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { apiGet, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";

type Tenant = { tenantId: number; name: string; slug: string; status?: string };
type Page<T> = { items: T[] };

const mockTenants: Tenant[] = [
  { tenantId: 1, name: "Barberia Elite", slug: "barberia-elite", status: "activo" },
  { tenantId: 2, name: "Spa Luna", slug: "spa-luna", status: "pendiente" },
  { tenantId: 3, name: "Veterinaria Central", slug: "veterinaria-central", status: "suspendido" }
];

function statusClass(status?: string) {
  if (status === "activo") return "bg-primary/10 text-primary";
  if (status === "suspendido") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode()) {
      setTenants(mockTenants);
      setLoading(false);
      return;
    }
    apiGet<Page<Tenant>>(endpoints.admin.tenants)
      .then((page) => setTenants(page.items ?? []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell>
      <PageHeader title="Negocios" subtitle="Administra los negocios registrados en la plataforma." />

      <section className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 text-right font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Cargando...</td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Sin negocios registrados.</td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.tenantId}>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{tenant.tenantId}</td>
                  <td className="px-5 py-3 font-semibold">{tenant.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{tenant.slug}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(tenant.status)}`}>
                      {tenant.status ?? "-"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/tenants/${tenant.tenantId}`} className="text-sm font-semibold text-primary hover:underline">
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
