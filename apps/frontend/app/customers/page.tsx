import { PrivateShell } from "@/components/layout/PrivateShell";
import { SimpleTable } from "@/components/tables/SimpleTable";

const customers = [
  ["Sofia Campos", "sofia@email.com", "8787-1010"],
  ["Marco Arias", "marco@email.com", "8686-1212"],
  ["Daniela Rojas", "daniela@email.com", "8585-3434"]
];

export default function CustomersPage() {
  return (
    <PrivateShell>
      <h2>Clientes</h2>
      <SimpleTable headers={["Nombre", "Correo", "Telefono"]} rows={customers} />
    </PrivateShell>
  );
}
