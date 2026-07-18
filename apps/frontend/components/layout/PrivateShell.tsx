"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearAuthToken } from "@/lib/api";

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

export function PrivateShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  function logout() {
    clearAuthToken();
    router.push("/login");
  }

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
          <p>Clinica Dental Sonrisa esta disponible para recibir reservas.</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="breadcrumb">Clinica Dental Sonrisa</p>
            <strong>Panel del negocio</strong>
          </div>
          <div className="topbar-actions">
            <Link href="/book/clinica-dental-sonrisa" className="btn secondary">Ver pagina publica</Link>
            <div className="profile-menu">
              <button className="owner-chip" type="button" aria-label="Abrir menu de perfil" onClick={() => setProfileOpen((open) => !open)}>
                SC
              </button>
              {profileOpen ? (
                <div className="profile-popover" role="menu">
                  <strong>Sofia Campos</strong>
                  <small>Responsable de Clinica Dental Sonrisa</small>
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
