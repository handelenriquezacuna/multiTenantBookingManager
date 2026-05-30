"use client";

import { useState } from "react";
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

const initialServices: ServiceRow[] = mockServices.map((service) => ({ ...service, isActive: true, categoryName: "Odontologia general" }));

export function ServicesManager() {
  const [services, setServices] = useState<ServiceRow[]>(initialServices);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = services.filter((service) => service.name.toLowerCase().includes(search.toLowerCase()));
  const isEditing = editingId !== null;

  function saveService() {
    if (!form.name.trim()) return;

    if (editingId) {
      setServices((current) => current.map((service) => service.serviceId === editingId ? { ...service, ...form } : service));
    } else {
      setServices((current) => [
        ...current,
        {
          serviceId: Date.now(),
          categoryName: "Odontologia general",
          ...form
        }
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
    setServices((current) => current.map((service) => service.serviceId === id ? { ...service, isActive: !service.isActive } : service));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Servicios</h1>
          <p>Administra los servicios que tus clientes pueden reservar.</p>
        </div>
        <button className="btn" type="button" onClick={openCreateModal}>Agregar servicio</button>
      </div>

      <section className="panel">
        <div className="panel-header"><h2>Listado</h2><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar servicio" className="table-search" /></div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Nombre</th><th>Categoria</th><th>Duracion</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map((service) => (
                <tr key={service.serviceId}>
                  <td>{service.name}<br /><small>{service.description}</small></td>
                  <td>{service.categoryName}</td>
                  <td>{service.durationMinutes} min</td>
                  <td>{service.showPrice && service.price ? `CRC ${service.price}` : "No visible"}</td>
                  <td><span className="status-dot">{service.isActive ? "activo" : "inactivo"}</span></td>
                  <td className="row-actions"><button type="button" onClick={() => editService(service)}>Editar</button><button className="danger" type="button" onClick={() => toggleService(service.serviceId)}>{service.isActive ? "Inactivar" : "Activar"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header"><h2>{isEditing ? "Editar servicio" : "Crear servicio"}</h2><button type="button" onClick={() => setIsModalOpen(false)}>Cerrar</button></div>
            <div className="settings-form">
              <label className="field-group"><span>Nombre</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label className="field-group"><span>Duracion</span><select value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })}><option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option><option value={90}>90 min</option></select></label>
              <label className="field-group settings-full"><span>Descripcion</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <label className="field-group"><span>Precio informativo</span><input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} /></label>
              <label className="field-group"><span>Mostrar precio</span><select value={form.showPrice ? "yes" : "no"} onChange={(event) => setForm({ ...form, showPrice: event.target.value === "yes" })}><option value="yes">Si</option><option value="no">No</option></select></label>
              <label className="field-group"><span>Estado</span><select value={form.isActive ? "active" : "inactive"} onChange={(event) => setForm({ ...form, isActive: event.target.value === "active" })}><option value="active">Activo</option><option value="inactive">Inactivo</option></select></label>
              <div className="settings-actions"><button className="btn secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button><button className="btn" type="button" onClick={saveService}>{isEditing ? "Guardar" : "Agregar"}</button></div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
