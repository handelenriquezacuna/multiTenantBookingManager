"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet, clearAuthToken, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { useAuth, userInitials } from "@/hooks/useAuth";

const navItems: [string, string][] = [
  ["/dashboard", "Resumen"],
  ["/bookings", "Reservas"],
  ["/services", "Servicios"],
  ["/service-categories", "Categorias"],
  ["/locations", "Sedes"],
  ["/business-hours", "Horarios"],
  ["/customers", "Clientes"],
  ["/reports", "Reportes"],
  ["/settings/business", "Configuracion"]
];

type CurrentTenant = { tenantId: number; slug: string; name: string; status: string };

const MOCK_TENANT: CurrentTenant = {
  tenantId: 1,
  slug: "barberia-el-colocho",
  name: "Negocio demo",
  status: "activo"
};

export function PrivateShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading } = useAuth();
  const [tenant, setTenant] = useState<CurrentTenant | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    let active = true;
    if (isMockMode()) {
      setTenant(MOCK_TENANT);
      return;
    }
    if (!user) return;
    apiGet<CurrentTenant>(endpoints.tenant.current)
      .then((current) => active && setTenant(current))
      .catch(() => active && setTenant(null));
    return () => {
      active = false;
    };
  }, [user]);

  function logout() {
    clearAuthToken();
    router.push("/login");
  }

  if (loading || !user) {
    return (
      <div data-ct className="flex min-h-[100dvh] items-center justify-center bg-background font-sans text-muted-foreground">
        Cargando tu panel...
      </div>
    );
  }

  const tenantName = tenant?.name ?? "Panel del negocio";
  const tenantSlug = tenant?.slug ?? "";
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div data-ct className="flex min-h-[100dvh] bg-background font-sans text-foreground antialiased">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/60 lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="font-serif text-xl font-semibold tracking-tight">
            Citari
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Navegacion del panel">
          {navItems.map(([href, label]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Negocio activo
          </span>
          <p className="mt-2 text-xs text-muted-foreground">{tenantName}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{tenantName}</p>
            <strong className="text-sm">Panel del negocio</strong>
          </div>
          <div className="flex items-center gap-3">
            {tenantSlug ? (
              <Link
                href={`/book/${tenantSlug}`}
                className="hidden rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Ver pagina publica
              </Link>
            ) : null}
            <div className="relative">
              <button
                type="button"
                aria-label="Abrir menu de perfil"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background"
              >
                {userInitials(user)}
              </button>
              {profileOpen ? (
                <div className="absolute right-0 top-11 z-20 w-56 rounded-2xl border border-border bg-card p-2 shadow-lift" role="menu">
                  <div className="px-3 py-2">
                    <strong className="block text-sm">{fullName}</strong>
                    <small className="text-muted-foreground">Responsable de {tenantName}</small>
                  </div>
                  <Link href="/settings/business" role="menuitem" className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                    Configuracion del negocio
                  </Link>
                  <button type="button" role="menuitem" onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10">
                    Cerrar sesion
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-6">{children}</section>
      </div>
    </div>
  );
}
