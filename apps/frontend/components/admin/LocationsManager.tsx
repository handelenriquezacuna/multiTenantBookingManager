"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader, StatusBadge, selectClass } from "@/components/ui/page-header";
import { apiDelete, apiPatch, apiPost, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { errMessage, useResource } from "@/lib/resource";

type Location = {
  locationId: number;
  name: string;
  address: string;
  phone: string | null;
  isMain: boolean;
  isActive: boolean;
};

const initialLocations: Location[] = [
  { locationId: 1, name: "Sede central", address: "San Jose centro", phone: "2222-1010", isMain: true, isActive: true },
  { locationId: 2, name: "Sucursal oeste", address: "Escazu", phone: "2222-3030", isMain: false, isActive: true }
];

const emptyForm = { name: "", address: "", phone: "", isMain: false, isActive: true };
type LocationForm = typeof emptyForm;

export function LocationsManager() {
  const { items: locations, setItems: setLocations, loading, error, setError, reload } = useResource<Location>(
    endpoints.locations.list,
    initialLocations
  );
  const [form, setForm] = useState<LocationForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isEditing = editingId !== null;

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function editLocation(location: Location) {
    setEditingId(location.locationId);
    setForm({ name: location.name, address: location.address, phone: location.phone ?? "", isMain: location.isMain, isActive: location.isActive });
    setIsModalOpen(true);
  }

  async function saveLocation() {
    if (!form.name.trim() || !form.address.trim()) return;
    setError(null);

    if (isMockMode()) {
      if (editingId) {
        setLocations((current) => current.map((l) => (l.locationId === editingId ? { ...l, ...form } : l)));
      } else {
        setLocations((current) => [...current, { locationId: Date.now(), ...form }]);
      }
      setIsModalOpen(false);
      return;
    }

    setBusy(true);
    try {
      const body = { name: form.name, address: form.address, phone: form.phone || null, isMain: form.isMain };
      if (editingId) {
        const updated = await apiPatch<Location>(endpoints.locations.byId(editingId), { ...body, isActive: form.isActive });
        setLocations((current) => current.map((l) => (l.locationId === editingId ? updated : l)));
      } else {
        const created = await apiPost<Location>(endpoints.locations.list, body);
        setLocations((current) => [...current, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(errMessage(err, "No se pudo guardar la sede."));
    } finally {
      setBusy(false);
    }
  }

  async function toggleLocation(location: Location) {
    const next = !location.isActive;
    if (isMockMode()) {
      setLocations((current) => current.map((l) => (l.locationId === location.locationId ? { ...l, isActive: next } : l)));
      return;
    }
    setError(null);
    try {
      const updated = await apiPatch<Location>(endpoints.locations.byId(location.locationId), { isActive: next });
      setLocations((current) => current.map((l) => (l.locationId === location.locationId ? updated : l)));
    } catch (err) {
      setError(errMessage(err, "No se pudo cambiar el estado."));
    }
  }

  async function deleteLocation(location: Location) {
    if (isMockMode()) {
      setLocations((current) => current.filter((l) => l.locationId !== location.locationId));
      return;
    }
    setError(null);
    try {
      await apiDelete(endpoints.locations.byId(location.locationId));
      setLocations((current) => current.filter((l) => l.locationId !== location.locationId));
    } catch (err) {
      setError(errMessage(err, "No se pudo eliminar la sede."));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Sedes"
        subtitle="Ubicaciones donde tu negocio atiende reservas."
        action={
          <Button size="sm" onClick={openCreate}>
            Agregar sede
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
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Listado</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Direccion</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Cargando sedes...</td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Aun no hay sedes. Crea la primera.
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.locationId}>
                    <td className="px-5 py-3 font-semibold">{location.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{location.address}</td>
                    <td className="px-5 py-3 text-muted-foreground">{location.isMain ? "Principal" : "Secundaria"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge active={location.isActive} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => editLocation(location)} className="rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                          Editar
                        </button>
                        <button type="button" onClick={() => toggleLocation(location)} className="rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                          {location.isActive ? "Inactivar" : "Activar"}
                        </button>
                        <button type="button" onClick={() => deleteLocation(location)} className="rounded-lg px-2.5 py-1 text-sm text-destructive hover:bg-destructive/10">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Editar sede" : "Crear sede"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loc-name">Nombre</Label>
            <Input id="loc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc-addr">Direccion</Label>
            <Input id="loc-addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="loc-phone">Telefono</Label>
              <Input id="loc-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc-main">Tipo</Label>
              <select id="loc-main" className={selectClass} value={form.isMain ? "main" : "secondary"} onChange={(e) => setForm({ ...form, isMain: e.target.value === "main" })}>
                <option value="main">Principal</option>
                <option value="secondary">Secundaria</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveLocation} disabled={busy}>{busy ? "Guardando..." : isEditing ? "Guardar" : "Agregar"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
