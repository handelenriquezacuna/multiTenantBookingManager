"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader, StatusBadge, selectClass, textareaClass } from "@/components/ui/page-header";

type Category = { id: number; name: string; description: string; isActive: boolean };

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
      setCategories((current) =>
        current.map((category) => (category.id === editingId ? { ...category, name, description, isActive } : category))
      );
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
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, isActive: !category.isActive } : category))
    );
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
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Categorias de servicios"
        subtitle="Organiza los servicios que el negocio muestra en su pagina de reservas."
        action={
          <Button size="sm" onClick={openCreateModal}>
            Agregar categoria
          </Button>
        }
      />

      <section className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Listado</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Descripcion</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-3 font-semibold">{category.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{category.description}</td>
                  <td className="px-5 py-3">
                    <StatusBadge active={category.isActive} labels={["Activa", "Inactiva"]} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => editCategory(category)} className="rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                        Editar
                      </button>
                      <button type="button" onClick={() => toggleCategory(category.id)} className="rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                        {category.isActive ? "Inactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar categoria" : "Crear categoria"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Descripcion</Label>
            <textarea id="cat-desc" className={textareaClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-state">Estado</Label>
            <select id="cat-state" className={selectClass} value={isActive ? "active" : "inactive"} onChange={(e) => setIsActive(e.target.value === "active")}>
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveCategory}>{editingId ? "Guardar" : "Agregar"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
