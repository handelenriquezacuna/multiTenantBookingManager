"use client";

import { useState } from "react";

type Category = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
};

const initialCategories: Category[] = [
  { id: 1, name: "Odontologia general", description: "Consultas, limpiezas y controles preventivos.", isActive: true },
  { id: 2, name: "Estetica dental", description: "Blanqueamientos y procedimientos esteticos.", isActive: true },
  { id: 3, name: "Ortodoncia", description: "Valoraciones y controles de tratamiento.", isActive: false }
];

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function saveCategory() {
    if (!name.trim()) return;

    if (editingId) {
      setCategories((current) => current.map((category) => category.id === editingId ? { ...category, name, description, isActive } : category));
    } else {
      setCategories((current) => [...current, { id: Date.now(), name, description, isActive }]);
    }

    resetForm();
    setIsModalOpen(false);
  }

  function editCategory(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
    setIsActive(category.isActive);
    setIsModalOpen(true);
  }

  function toggleCategory(id: number) {
    setCategories((current) => current.map((category) => category.id === id ? { ...category, isActive: !category.isActive } : category));
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setIsActive(true);
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Categorias de servicios</h1>
          <p>Organiza los servicios que el negocio muestra en su pagina de reservas.</p>
        </div>
        <button className="btn" type="button" onClick={openCreateModal}>Agregar categoria</button>
      </div>

      <section className="panel">
        <div className="panel-header"><h2>Listado</h2></div>
        <div className="panel-body" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Nombre</th><th>Descripcion</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td><span className="status-dot">{category.isActive ? "activa" : "inactiva"}</span></td>
                  <td className="row-actions"><button type="button" onClick={() => editCategory(category)}>Editar</button><button className="danger" type="button" onClick={() => toggleCategory(category.id)}>{category.isActive ? "Inactivar" : "Activar"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header"><h2>{editingId ? "Editar categoria" : "Crear categoria"}</h2><button type="button" onClick={() => setIsModalOpen(false)}>Cerrar</button></div>
            <div className="settings-form">
              <label className="field-group"><span>Nombre</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label className="field-group"><span>Estado</span><select value={isActive ? "active" : "inactive"} onChange={(event) => setIsActive(event.target.value === "active")}><option value="active">Activa</option><option value="inactive">Inactiva</option></select></label>
              <label className="field-group settings-full"><span>Descripcion</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <div className="settings-actions"><button className="btn secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button><button className="btn" type="button" onClick={saveCategory}>{editingId ? "Guardar" : "Agregar"}</button></div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
