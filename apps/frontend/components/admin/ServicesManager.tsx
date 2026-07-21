"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader, selectClass, textareaClass } from "@/components/ui/page-header";
import { apiDelete, apiPatch, apiPost, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { errMessage, useResource } from "@/lib/resource";
import { mockServices } from "@/lib/mock-data";
import type { Service } from "@/types/service";

type Category = { categoryId: number; name: string };
type ServiceRow = Service & { categoryId?: number; categoryName?: string };

const mockCategories: Category[] = [
  { categoryId: 1, name: "Odontologia general" },
  { categoryId: 2, name: "Estetica dental" },
  { categoryId: 3, name: "Ortodoncia" }
];

const initialServices: ServiceRow[] = mockServices.map((service) => ({
  ...service,
  categoryId: 1,
  categoryName: "Odontologia general"
}));

const emptyForm = {
  name: "",
  description: "",
  durationMinutes: 30,
  price: 0,
  showPrice: true,
  categoryId: 0
};
type ServiceForm = typeof emptyForm;

export function ServicesManager() {
  const { items: services, setItems: setServices, loading, error, setError, reload } = useResource<ServiceRow>(
    endpoints.services.list,
    initialServices
  );
  const { items: categories } = useResource<Category>(endpoints.serviceCategories.list, mockCategories);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = services.filter((service) => service.name.toLowerCase().includes(search.toLowerCase()));
  const isEditing = editingId !== null;

  function categoryName(id?: number): string {
    if (!id) return "—";
    return categories.find((c) => c.categoryId === id)?.name ?? "—";
  }

  async function saveService() {
    if (!form.name.trim()) return;
    if (!isMockMode() && !form.categoryId) {
      setError("Selecciona una categoria para el servicio.");
      return;
    }
    setError(null);

    if (isMockMode()) {
      if (editingId) {
        setServices((current) =>
          current.map((service) =>
            service.serviceId === editingId
              ? { ...service, ...form, categoryName: categoryName(form.categoryId) }
              : service
          )
        );
      } else {
        setServices((current) => [
          ...current,
          { serviceId: Date.now(), ...form, categoryName: categoryName(form.categoryId) }
        ]);
      }
      closeModal();
      return;
    }

    setBusy(true);
    try {
      const body = {
        categoryId: form.categoryId,
        name: form.name,
        description: form.description || null,
        durationMinutes: form.durationMinutes,
        price: form.showPrice ? form.price : null,
        showPrice: form.showPrice
      };
      if (editingId) {
        const updated = await apiPatch<Service>(endpoints.services.byId(editingId), body);
        setServices((current) =>
          current.map((s) => (s.serviceId === editingId ? { ...updated, categoryId: form.categoryId, categoryName: categoryName(form.categoryId) } : s))
        );
      } else {
        const created = await apiPost<Service>(endpoints.services.list, body);
        setServices((current) => [...current, { ...created, categoryId: form.categoryId, categoryName: categoryName(form.categoryId) }]);
      }
      closeModal();
    } catch (err) {
      setError(errMessage(err, "No se pudo guardar el servicio."));
    } finally {
      setBusy(false);
    }
  }

  async function deleteService(service: ServiceRow) {
    if (isMockMode()) {
      setServices((current) => current.filter((s) => s.serviceId !== service.serviceId));
      return;
    }
    setError(null);
    try {
      await apiDelete(endpoints.services.byId(service.serviceId));
      setServices((current) => current.filter((s) => s.serviceId !== service.serviceId));
    } catch (err) {
      setError(errMessage(err, "No se pudo eliminar el servicio."));
    }
  }

  function editService(service: ServiceRow) {
    setEditingId(service.serviceId);
    setForm({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price || 0,
      showPrice: service.showPrice,
      categoryId: service.categoryId ?? 0
    });
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.categoryId ?? 0 });
    setIsModalOpen(true);
  }

  function closeModal() {
    setForm(emptyForm);
    setEditingId(null);
    setIsModalOpen(false);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Servicios"
        subtitle="Administra los servicios que tus clientes pueden reservar."
        action={
          <Button size="sm" onClick={openCreateModal}>
            Agregar servicio
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
            placeholder="Buscar servicio"
            className="h-9 w-56"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Categoria</th>
                <th className="px-5 py-3 font-medium">Duracion</th>
                <th className="px-5 py-3 font-medium">Precio</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Cargando servicios...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No hay servicios que coincidan.
                  </td>
                </tr>
              ) : (
                filtered.map((service) => (
                  <tr key={service.serviceId}>
                    <td className="px-5 py-3">
                      <strong className="block font-semibold">{service.name}</strong>
                      <small className="text-muted-foreground">{service.description}</small>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{service.categoryName ?? categoryName(service.categoryId)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{service.durationMinutes} min</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {service.showPrice && service.price ? `CRC ${service.price}` : "No visible"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editService(service)}
                          className="rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteService(service)}
                          className="rounded-lg px-2.5 py-1 text-sm text-destructive hover:bg-destructive/10"
                        >
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

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Editar servicio" : "Crear servicio"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="svc-name">Nombre</Label>
            <Input id="svc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-cat">Categoria</Label>
            <select id="svc-cat" className={selectClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
              <option value={0} disabled>Selecciona una categoria</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-desc">Descripcion</Label>
            <textarea id="svc-desc" className={textareaClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="svc-dur">Duracion</Label>
              <select id="svc-dur" className={selectClass} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}>
                {[15, 30, 45, 60, 90].map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-price">Precio informativo</Label>
              <Input id="svc-price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-show">Mostrar precio</Label>
            <select id="svc-show" className={selectClass} value={form.showPrice ? "yes" : "no"} onChange={(e) => setForm({ ...form, showPrice: e.target.value === "yes" })}>
              <option value="yes">Si</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveService} disabled={busy}>{busy ? "Guardando..." : isEditing ? "Guardar" : "Agregar"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
