"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet, clearAuthToken, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { useAuth, userInitials } from "@/hooks/useAuth";

const navItems = [
  ["/dashboard", "Resumen"],
  ["/bookings", "Reservas"],
  ["/services", "Servicios"],
  ["/service-categories", "Categorias"],
  ["/business-hours", "Horarios"],
  ["/customers", "Clientes"],
  ["/reports", "Reportes"],
  ["/settings/business", "Configuracion"]
];

type CurrentTenant = {
  tenantId: number;
  slug: string;
  name: string;
  status: string;
};

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

  // Guarda: si termino de cargar la sesion y no hay usuario, redirige a login.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Nombre del negocio para el encabezado.
  useEffect(() => {
    let active = true;
    if (isMockMode()) {
      setTenant(MOCK_TENANT);
      return;
    }
    if (!user) return;
    apiGet<CurrentTenant>(endpoints.tenant.current)
      .then((current) => {
        if (active) setTenant(current);
      })
      .catch(() => {
        if (active) setTenant(null);
      });
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
      <div className="app-shell">
        <section className="app-content" aria-busy="true">
          <p>Cargando tu panel...</p>
        </section>
      </div>
    );
  }

  const tenantName = tenant?.name ?? "Panel del negocio";
  const tenantSlug = tenant?.slug ?? "";
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = userInitials(user);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/dashboard" className="app-brand" aria-label="Panel Citari">
          <span className="app-brand-word">Citari</span>
          <span className="app-brand-copy">Reservas</span>
        </Link>

        <nav className="app-nav" aria-label="Navegacion del panel">
          {navItems.map(([href, label]) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={active ? "active" : ""}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="tenant-state active">Negocio activo</span>
          <p>{tenantName} esta disponible para recibir reservas.</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="breadcrumb">{tenantName}</p>
            <strong>Panel del negocio</strong>
          </div>
          <div className="topbar-actions">
            {tenantSlug ? (
              <Link href={`/book/${tenantSlug}`} className="btn secondary">Ver pagina publica</Link>
            ) : null}
            <div className="profile-menu">
              <button className="owner-chip" type="button" aria-label="Abrir menu de perfil" onClick={() => setProfileOpen((open) => !open)}>
                {initials}
              </button>
              {profileOpen ? (
                <div className="profile-popover" role="menu">
                  <strong>{fullName}</strong>
                  <small>Responsable de {tenantName}</small>
                  <Link href="/settings/business" role="menuitem">Configuracion del negocio</Link>
                  <button type="button" role="menuitem" className="danger" onClick={logout}>Cerrar sesion</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <section className="app-content">{children}</section>
      </div>
    </div>
  );
}
