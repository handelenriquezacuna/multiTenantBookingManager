"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { apiPost, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { errMessage, useResource } from "@/lib/resource";
import type { Customer } from "@/types/customer";

const initialCustomers: Customer[] = [
  { customerId: 1, firstName: "Sofia", lastName: "Campos", email: "sofia@email.com", phone: "8787-1010" },
  { customerId: 2, firstName: "Marco", lastName: "Arias", email: "marco@email.com", phone: "8686-1212" },
  { customerId: 3, firstName: "Daniela", lastName: "Rojas", email: "daniela@email.com", phone: "8585-3434" }
];

const emptyForm = { firstName: "", lastName: "", email: "", phone: "", notes: "" };

export function CustomersManager() {
  const { items: customers, setItems: setCustomers, loading, error, setError, reload } = useResource<Customer>(
    endpoints.customers.list,
    initialCustomers
  );
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const term = search.toLowerCase();
  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(term)
  );

  async function saveCustomer() {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    setError(null);

    if (isMockMode()) {
      setCustomers((current) => [...current, { customerId: Date.now(), ...form }]);
      setForm(emptyForm);
      setIsModalOpen(false);
      return;
    }

    setBusy(true);
    try {
      const created = await apiPost<Customer>(endpoints.customers.list, form);
      setCustomers((current) => [...current, created]);
      setForm(emptyForm);
      setIsModalOpen(false);
    } catch (err) {
      setError(errMessage(err, "No se pudo registrar el cliente."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Clientes"
        subtitle="Personas que han reservado en tu negocio."
        action={
          <Button size="sm" onClick={() => { setForm(emptyForm); setIsModalOpen(true); }}>
            Agregar cliente
          </Button>
        }
      />

      {error ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={reload} className="font-semibold hover:underline">
            Reintentar
          </button>
        </div>
      ) : null}

      <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="font-semibold">Listado</h2>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cliente"
            className="h-9 w-56"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Correo</th>
                <th className="px-5 py-3 font-medium">Telefono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">Cargando clientes...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
                    No hay clientes que coincidan.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.customerId}>
                    <td className="px-5 py-3 font-semibold">{customer.firstName} {customer.lastName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{customer.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{customer.phone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo cliente">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cus-first">Nombre</Label>
              <Input id="cus-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cus-last">Apellido</Label>
              <Input id="cus-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cus-email">Correo electronico</Label>
            <Input id="cus-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cus-phone">Telefono</Label>
            <Input id="cus-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveCustomer} disabled={busy}>{busy ? "Guardando..." : "Agregar"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
