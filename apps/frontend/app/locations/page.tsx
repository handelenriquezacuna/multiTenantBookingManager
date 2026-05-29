import { PrivateShell } from "@/components/layout/PrivateShell";
import { SimpleTable } from "@/components/tables/SimpleTable";

const locations = [
  ["Sede central", "San Jose centro", "Principal"],
  ["Sucursal oeste", "Escazu", "Secundaria"]
];

export default function LocationsPage() {
  return (
    <PrivateShell>
      <h2>Ubicaciones</h2>
      <SimpleTable headers={["Nombre", "Direccion", "Tipo"]} rows={locations} />
    </PrivateShell>
  );
}
