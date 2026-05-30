import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { SimpleTable } from "@/components/tables/SimpleTable";

const rows = [
  ["1", "Barberia Elite", "active"],
  ["2", "Spa Luna", "pending"],
  ["3", "Veterinaria Central", "suspended"]
];

export default function AdminTenantsPage() {
  return (
    <PublicShell>
      <h2>Negocios registrados</h2>
      <SimpleTable headers={["ID", "Nombre", "Estado"]} rows={rows} />
      <Link className="btn" href="/admin/tenants/1" style={{ marginTop: "1rem" }}>Ver detalle tenant 1</Link>
    </PublicShell>
  );
}
