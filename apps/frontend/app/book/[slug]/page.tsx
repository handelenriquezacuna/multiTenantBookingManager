import Link from "next/link";
import { BookingShell } from "@/components/layout/BookingShell";
import { mockTenant } from "@/lib/mock-data";

export default async function PublicTenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <BookingShell>
      <section className="card">
        <h2 style={{ marginTop: 0 }}>{mockTenant.name}</h2>
        <p>{mockTenant.description}</p>
        <p style={{ color: "var(--muted)" }}>{mockTenant.publicMessage}</p>
        <Link className="btn" href={`/book/${slug}/service`}>
          Empezar reserva
        </Link>
      </section>
    </BookingShell>
  );
}
