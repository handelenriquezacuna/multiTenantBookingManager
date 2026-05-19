import { PublicShell } from "@/components/layout/PublicShell";

export default async function AdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PublicShell>
      <section className="card">
        <h2>Detalle tenant #{id}</h2>
        <p>Nombre: Barberia Elite</p>
        <p>Estado: active</p>
        <p>Owner: owner@barberiaelite.com</p>
      </section>
    </PublicShell>
  );
}
