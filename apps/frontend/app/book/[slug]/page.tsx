import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingShell } from "@/components/layout/BookingShell";
import { apiGet, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { mockTenant } from "@/lib/mock-data";
import type { Tenant } from "@/types/tenant";

async function loadTenant(slug: string): Promise<Tenant | null> {
  if (isMockMode()) {
    return mockTenant;
  }
  try {
    return await apiGet<Tenant>(endpoints.public.tenant(slug));
  } catch {
    return null;
  }
}

export default async function PublicTenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await loadTenant(slug);
  if (!tenant) {
    notFound();
  }

  return (
    <BookingShell>
      <section className="card">
        <h2 style={{ marginTop: 0 }}>{tenant.name}</h2>
        <p>{tenant.description}</p>
        <p style={{ color: "var(--muted)" }}>{tenant.publicMessage}</p>
        <Link className="btn" href={`/book/${slug}/service`}>
          Empezar reserva
        </Link>
      </section>
    </BookingShell>
  );
}
