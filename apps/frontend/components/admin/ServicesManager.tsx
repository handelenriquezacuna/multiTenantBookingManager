"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader, StatusBadge, selectClass, textareaClass } from "@/components/ui/page-header";
import { mockServices } from "@/lib/mock-data";
import type { Service } from "@/types/service";

const emptyForm = {
  name: "",
  description: "",
  durationMinutes: 30,
  price: 0,
  showPrice: true,
  isActive: true
};

type ServiceForm = typeof emptyForm;
type ServiceRow = Service & { isActive: boolean; categoryName: string };

const initialServices: ServiceRow[] = mockServices.map((service) => ({
  ...service,
  isActive: true,
  categoryName: "Odontologia general"
}));

export function ServicesManager() {
  const [services, setServices] = useState<ServiceRow[]>(initialServices);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );
  const isEditing = editingId !== null;

  function saveService() {
    if (!form.name.trim()) return;
    if (editingId) {
      setServices((current) =>
        current.map((service) => (service.serviceId === editingId ? { ...service, ...form } : service))
      );
    } else {
      setServices((current) => [
        ...current,
        { serviceId: Date.now(), categoryName: "Odontologia general", ...form }
      ]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setIsModalOpen(false);
  }

  function editService(service: ServiceRow) {
    setEditingId(service.serviceId);
    setForm({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price || 0,
      showPrice: service.showPrice,
      isActive: service.isActive
    });
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function toggleService(id: number) {
    setServices((current) =>
      current.map((service) =>
        service.serviceId === id ? { ...service, isActive: !service.isActive } : service
      )
    );
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
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
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
                    <td className="px-5 py-3 text-muted-foreground">{service.categoryName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{service.durationMinutes} min</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {service.showPrice && service.price ? `CRC ${service.price}` : "No visible"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge active={service.isActive} />
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
                          onClick={() => toggleService(service.serviceId)}
                          className="rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {service.isActive ? "Inactivar" : "Activar"}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="svc-show">Mostrar precio</Label>
              <select id="svc-show" className={selectClass} value={form.showPrice ? "yes" : "no"} onChange={(e) => setForm({ ...form, showPrice: e.target.value === "yes" })}>
                <option value="yes">Si</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-state">Estado</Label>
              <select id="svc-state" className={selectClass} value={form.isActive ? "active" : "inactive"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveService}>{isEditing ? "Guardar" : "Agregar"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
