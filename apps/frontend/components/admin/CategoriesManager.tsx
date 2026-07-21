"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader, StatusBadge, selectClass, textareaClass } from "@/components/ui/page-header";
import { apiDelete, apiPatch, apiPost, isMockMode } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import { errMessage, useResource } from "@/lib/resource";

type Category = { categoryId: number; name: string; description: string | null; isActive: boolean };

const initialCategories: Category[] = [
  { categoryId: 1, name: "Odontologia general", description: "Consultas, limpiezas y controles preventivos.", isActive: true },
  { categoryId: 2, name: "Estetica dental", description: "Blanqueamientos y procedimientos esteticos.", isActive: true },
  { categoryId: 3, name: "Ortodoncia", description: "Valoraciones y controles de tratamiento.", isActive: false }
];

export function CategoriesManager() {
  const { items: categories, setItems: setCategories, loading, error, setError, reload } = useResource<Category>(
    endpoints.serviceCategories.list,
    initialCategories
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function saveCategory() {
    if (!name.trim()) return;
    setError(null);

    if (isMockMode()) {
      if (editingId) {
        setCategories((current) =>
          current.map((category) => (category.categoryId === editingId ? { ...category, name, description, isActive } : category))
        );
      } else {
        setCategories((current) => [...current, { categoryId: Date.now(), name, description, isActive }]);
      }
      resetForm();
      setIsModalOpen(false);
      return;
    }

    setBusy(true);
    try {
      if (editingId) {
        const updated = await apiPatch<Category>(endpoints.serviceCategories.byId(editingId), { name, description, isActive });
        setCategories((current) => current.map((c) => (c.categoryId === editingId ? updated : c)));
      } else {
        const created = await apiPost<Category>(endpoints.serviceCategories.list, { name, description });
        setCategories((current) => [...current, created]);
      }
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      setError(errMessage(err, "No se pudo guardar la categoria."));
    } finally {
      setBusy(false);
    }
  }

  function editCategory(category: Category) {
    setEditingId(category.categoryId);
    setName(category.name);
    setDescription(category.description ?? "");
    setIsActive(category.isActive);
    setIsModalOpen(true);
  }

  async function toggleCategory(category: Category) {
    const next = !category.isActive;
    if (isMockMode()) {
      setCategories((current) => current.map((c) => (c.categoryId === category.categoryId ? { ...c, isActive: next } : c)));
      return;
    }
    setError(null);
    try {
      const updated = await apiPatch<Category>(endpoints.serviceCategories.byId(category.categoryId), { isActive: next });
      setCategories((current) => current.map((c) => (c.categoryId === category.categoryId ? updated : c)));
    } catch (err) {
      setError(errMessage(err, "No se pudo cambiar el estado."));
    }
  }

  async function deleteCategory(category: Category) {
    if (isMockMode()) {
      setCategories((current) => current.filter((c) => c.categoryId !== category.categoryId));
      return;
    }
    setError(null);
    try {
      await apiDelete(endpoints.serviceCategories.byId(category.categoryId));
      setCategories((current) => current.filter((c) => c.categoryId !== category.categoryId));
    } catch (err) {
      setError(errMessage(err, "No se pudo eliminar la categoria."));
    }
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
                <th className="px-5 py-3 font-medium">Descripcion</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    Cargando categorias...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    Aun no hay categorias. Crea la primera.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.categoryId}>
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
                        <button type="button" onClick={() => toggleCategory(category)} className="rounded-lg px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                          {category.isActive ? "Inactivar" : "Activar"}
                        </button>
                        <button type="button" onClick={() => deleteCategory(category)} className="rounded-lg px-2.5 py-1 text-sm text-destructive hover:bg-destructive/10">
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
          {editingId ? (
            <div className="space-y-2">
              <Label htmlFor="cat-state">Estado</Label>
              <select id="cat-state" className={selectClass} value={isActive ? "active" : "inactive"} onChange={(e) => setIsActive(e.target.value === "active")}>
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>
          ) : null}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={saveCategory} disabled={busy}>{busy ? "Guardando..." : editingId ? "Guardar" : "Agregar"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
