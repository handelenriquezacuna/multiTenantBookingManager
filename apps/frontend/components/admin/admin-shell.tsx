"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearAuthToken, isMockMode } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isMockMode()) return;
    if (!user || user.role !== "superadmin") router.replace("/admin/login");
  }, [loading, user, router]);

  function logout() {
    clearAuthToken();
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div data-ct className="flex min-h-[100dvh] items-center justify-center bg-background font-sans text-muted-foreground">
        Cargando...
      </div>
    );
  }

  return (
    <div data-ct className="flex min-h-[100dvh] flex-col bg-background font-sans text-foreground antialiased">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-baseline gap-3">
            <Link href="/admin/tenants" className="font-serif text-xl font-semibold tracking-tight">
              Citari
            </Link>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Panel interno</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={logout}>
            Cerrar sesion
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
