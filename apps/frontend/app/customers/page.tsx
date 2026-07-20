import { PrivateShell } from "@/components/layout/PrivateShell";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { PageHeader } from "@/components/ui/page-header";

const customers = [
  ["Sofia Campos", "sofia@email.com", "8787-1010"],
  ["Marco Arias", "marco@email.com", "8686-1212"],
  ["Daniela Rojas", "daniela@email.com", "8585-3434"]
];

export default function CustomersPage() {
  return (
    <PrivateShell>
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Clientes" subtitle="Personas que han reservado en tu negocio." />
        <div className="mt-6">
          <SimpleTable headers={["Nombre", "Correo", "Telefono"]} rows={customers} />
        </div>
      </div>
    </PrivateShell>
  );
}
