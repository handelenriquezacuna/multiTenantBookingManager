import { PrivateShell } from "@/components/layout/PrivateShell";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { PageHeader } from "@/components/ui/page-header";

const locations = [
  ["Sede central", "San Jose centro", "Principal"],
  ["Sucursal oeste", "Escazu", "Secundaria"]
];

export default function LocationsPage() {
  return (
    <PrivateShell>
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Sedes" subtitle="Ubicaciones donde tu negocio atiende reservas." />
        <div className="mt-6">
          <SimpleTable headers={["Nombre", "Direccion", "Tipo"]} rows={locations} />
        </div>
      </div>
    </PrivateShell>
  );
}
