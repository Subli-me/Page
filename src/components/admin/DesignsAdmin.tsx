"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Trash2,
  Upload,
  Loader2,
  Check,
  Plus,
  Search,
  CheckSquare,
  Square,
  X,
  Edit2,
  GripVertical,
  Palette,
} from "lucide-react";
import clsx from "clsx";
import type { DesignCatalogItem, DesignCategory } from "@/lib/types";
import { convertToWebP } from "@/lib/imageUtils";

type StagedDesign = {
  id: string;
  name: string;
  url: string;
  publicId: string;
  status: "uploading" | "ready" | "error";
};

type DraggedDesign = {
  id: string;
  name: string;
};

const COLORS = [
  { name: "Rojo", value: "red" },
  { name: "Azul", value: "blue" },
  { name: "Verde", value: "green" },
  { name: "Amarillo", value: "yellow" },
  { name: "Negro", value: "black" },
  { name: "Blanco", value: "white" },
  { name: "Gris", value: "gray" },
  { name: "Púrpura", value: "purple" },
  { name: "Rosa", value: "pink" },
  { name: "Naranja", value: "orange" },
  { name: "Multicolor", value: "multicolor" },
];

function formatFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "");
  return withoutExt
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DesignsAdmin({ initial }: { initial: DesignCatalogItem[] }) {
  const [designs, setDesigns] = useState<DesignCatalogItem[]>(initial);
  const [categories, setCategories] = useState<DesignCategory[]>([]);
  const [staged, setStaged] = useState<StagedDesign[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [colorFilter, setColorFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [draggedDesign, setDraggedDesign] = useState<DraggedDesign | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar categorías
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/design-categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error cargando categorías:", err);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function createCategory() {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/admin/design-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          sort_order: categories.length,
        }),
      });
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
      setNewCategoryName("");
    } catch (err) {
      console.error("Error creando categoría:", err);
    }
  }

  async function updateCategory(id: string, name: string) {
    try {
      await fetch(`/api/admin/design-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name } : c))
      );
      setEditingCategory(null);
    } catch (err) {
      console.error("Error actualizando categoría:", err);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("¿Eliminar esta categoría? Los diseños no se eliminarán.")) return;
    try {
      await fetch(`/api/admin/design-categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error eliminando categoría:", err);
    }
  }

  async function assignCategoriesToDesign(designId: string, categoryIds: string[]) {
    try {
      await fetch(`/api/admin/designs/${designId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_ids: categoryIds }),
      });
      setDesigns((prev) =>
        prev.map((d) =>
          d.id === designId ? { ...d, category_ids: categoryIds } : d
        )
      );
    } catch (err) {
      console.error("Error asignando categorías:", err);
    }
  }

  async function uploadFile(file: File, tempId: string) {
    try {
      const optimizedFile = await convertToWebP(file, { maxDimension: 2400, quality: 0.85 }).catch(() => file);

      const sigRes = await fetch("/api/upload-signature", { method: "POST" });
      const sig = await sigRes.json();

      const form = new FormData();
      form.append("file", optimizedFile);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", sig.timestamp);
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      if (!res.ok) throw new Error();
      const json = await res.json();

      setStaged((prev) =>
        prev.map((item) =>
          item.id === tempId
            ? { ...item, url: json.secure_url, publicId: json.public_id, status: "ready" }
            : item
        )
      );
    } catch {
      setStaged((prev) =>
        prev.map((item) => (item.id === tempId ? { ...item, status: "error" } : item))
      );
    }
  }

  function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    const newItems: StagedDesign[] = fileArray.map((file) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      uploadFile(file, tempId);
      return {
        id: tempId,
        name: formatFileName(file.name),
        url: URL.createObjectURL(file),
        publicId: "",
        status: "uploading",
      };
    });

    setStaged((prev) => [...prev, ...newItems]);
  }

  async function saveAllStaged() {
    const readyItems = staged.filter((s) => s.status === "ready" && s.name.trim());
    if (readyItems.length === 0) return;

    setSavingAll(true);
    try {
      const res = await fetch("/api/admin/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: readyItems.map((s) => ({
            name: s.name.trim(),
            imageUrl: s.url,
            imagePublicId: s.publicId,
          })),
        }),
      });
      const json = await res.json();
      if (json.designs) {
        setDesigns((prev) => [...json.designs, ...prev]);
        setStaged([]);
      }
    } finally {
      setSavingAll(false);
    }
  }

  function removeStaged(id: string) {
    setStaged((prev) => prev.filter((s) => s.id !== id));
  }

  function updateStagedName(id: string, name: string) {
    setStaged((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }

  async function toggleActive(id: string, active: boolean) {
    setDesigns((prev) => prev.map((d) => (d.id === id ? { ...d, active } : d)));
    await fetch(`/api/admin/designs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  }

  async function updateColor(id: string, color: string | null) {
    setDesigns((prev) => prev.map((d) => (d.id === id ? { ...d, color } : d)));
    await fetch(`/api/admin/designs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color }),
    });
  }

  async function removeDesign(id: string) {
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    await fetch(`/api/admin/designs/${id}`, { method: "DELETE" });
  }

  async function removeSelected() {
    if (selectedIds.length === 0) return;
    if (!confirm(`¿Eliminar los ${selectedIds.length} diseños seleccionados?`)) return;

    const idsToDelete = [...selectedIds];
    setDesigns((prev) => prev.filter((d) => !idsToDelete.includes(d.id)));
    setSelectedIds([]);

    await Promise.all(
      idsToDelete.map((id) => fetch(`/api/admin/designs/${id}`, { method: "DELETE" }))
    );
  }

  // Filtros
  const filteredDesigns = designs.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (colorFilter && d.color !== colorFilter) return false;
    if (categoryFilter && !d.category_ids.includes(categoryFilter)) return false;

    return true;
  });

  const readyCount = staged.filter((s) => s.status === "ready").length;
  const uploadingCount = staged.filter((s) => s.status === "uploading").length;

  return (
    <div className="space-y-12">
      {/* Gestión de Categorías Temáticas */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
        <h2 className="font-display text-2xl italic mb-4">Categorías temáticas</h2>
        <p className="text-sm text-ink-soft mb-6">
          Crea categorías como Música, Anime, Series, etc. Luego asigna los diseños a las categorías que correspondan.
        </p>

        {loadingCategories ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-accent" size={24} />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Nueva categoría */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createCategory()}
                placeholder="Nombre de la nueva categoría (ej: Música, Anime...)"
                className="input flex-1"
              />
              <button
                onClick={createCategory}
                disabled={!newCategoryName.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink disabled:opacity-30"
              >
                <Plus size={16} /> Crear
              </button>
            </div>

            {/* Lista de categorías */}
            {categories.length === 0 ? (
              <div className="rounded-lg border border-line/50 p-6 text-center text-ink-soft text-sm">
                Todavía no creaste ninguna categoría. Crea una arriba para empezar.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border border-line bg-paper/40 px-4 py-3"
                  >
                    {editingCategory === cat.id ? (
                      <input
                        type="text"
                        defaultValue={cat.name}
                        onBlur={(e) => {
                          if (e.target.value.trim() && e.target.value !== cat.name) {
                            updateCategory(cat.id, e.target.value.trim());
                          } else {
                            setEditingCategory(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                        autoFocus
                        className="input text-sm flex-1"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {cat.name}{" "}
                        <span className="text-ink-soft">
                          ({designs.filter((d) => d.category_ids.includes(cat.id)).length})
                        </span>
                      </span>
                    )}
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => setEditingCategory(cat.id)}
                        className="rounded p-1 text-ink-soft hover:bg-ink/10 hover:text-ink"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="rounded p-1 text-ink-soft hover:bg-accent-soft hover:text-accent"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Sección Carga Masiva */}
      <section className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl italic">Carga masiva de diseños</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Seleccioná o arrastrá todas las imágenes que quieras cargar al catálogo de una sola vez.
            </p>
          </div>
          {staged.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStaged([])}
                className="text-xs text-ink-soft hover:text-accent"
              >
                Limpiar todo
              </button>
              <button
                type="button"
                disabled={readyCount === 0 || savingAll || uploadingCount > 0}
                onClick={saveAllStaged}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper transition-all hover:bg-ink disabled:opacity-30"
              >
                {savingAll ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Guardar {readyCount} diseño{readyCount !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Dropzone Masivo */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all",
            isDragging
              ? "border-accent bg-accent-soft/30 scale-[1.01]"
              : "border-line bg-paper/40 hover:border-ink hover:bg-paper/70"
          )}
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Upload size={26} />
          </div>
          <p className="font-display text-lg italic">
            Hacé clic o arrastrá tus imágenes aquí
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Podés seleccionar múltiples archivos PNG, JPG o WEBP al mismo tiempo.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Cola de subida */}
        {staged.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm font-medium">
                Imágenes seleccionadas ({staged.length})
                {uploadingCount > 0 && (
                  <span className="ml-2 text-xs text-accent font-normal">
                    (Subiendo {uploadingCount}...)
                  </span>
                )}
              </span>
              <button
                type="button"
                disabled={readyCount === 0 || savingAll || uploadingCount > 0}
                onClick={saveAllStaged}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs text-paper hover:bg-accent disabled:opacity-30"
              >
                <Plus size={14} /> Guardar todo al catálogo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {staged.map((item) => (
                <div
                  key={item.id}
                  className={clsx(
                    "group relative flex flex-col justify-between rounded-xl border p-2.5 transition-all",
                    item.status === "error"
                      ? "border-red-400 bg-red-500/10"
                      : item.status === "uploading"
                      ? "border-line bg-paper/50 opacity-80"
                      : "border-line bg-panel hover:border-ink"
                  )}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-accent-soft">
                    <Image src={item.url} alt={item.name} fill className="object-contain" />
                    {item.status === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-dark/40 backdrop-blur-[2px]">
                        <Loader2 size={24} className="animate-spin text-paper" />
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <input
                      className="input h-7 w-full text-xs font-medium px-2 py-1"
                      value={item.name}
                      onChange={(e) => updateStagedName(item.id, e.target.value)}
                      placeholder="Nombre del diseño"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStaged(item.id)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 shadow-md"
                    title="Quitar"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Catálogo Existente */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl italic">
            Diseños cargados ({filteredDesigns.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Color */}
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1 text-xs">
              <Palette size={14} className="text-ink-soft" />
              <select
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
                className="bg-transparent font-medium text-ink focus:outline-none cursor-pointer"
              >
                <option value="">Todos los colores</option>
                {COLORS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Categoría */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1 text-xs">
                <span className="text-ink-soft">Categoría:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent font-medium text-ink focus:outline-none cursor-pointer"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__UNCATEGORIZED__">Sin categoría</option>
                </select>
              </div>
            )}

            {/* Buscador */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                className="input h-9 w-40 pl-8 text-xs sm:w-56"
                placeholder="Buscar diseño..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Acciones de Selección */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={removeSelected}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-paper transition-colors"
              >
                <Trash2 size={13} /> Eliminar {selectedIds.length}
              </button>
            )}
          </div>
        </div>

        {filteredDesigns.length === 0 ? (
          <div className="rounded-2xl border border-line bg-panel p-12 text-center text-ink-soft">
            {search ? (
              <p>No se encontraron diseños que coincidan con &quot;{search}&quot;.</p>
            ) : (
              <p>Todavía no subiste ningún diseño. Usá la caja de arriba para agregar varios a la vez.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {filteredDesigns.map((d) => {
              const isSelected = selectedIds.includes(d.id);
              return (
                <div
                  key={d.id}
                  draggable
                  onDragStart={() => setDraggedDesign({ id: d.id, name: d.name })}
                  onDragEnd={() => setDraggedDesign(null)}
                  className={clsx(
                    "group relative flex flex-col justify-between rounded-xl border p-2.5 transition-all cursor-move",
                    isSelected
                      ? "border-accent bg-accent-soft/20 ring-2 ring-accent"
                      : "border-line bg-panel hover:border-ink"
                  )}
                >
                  {/* Selector checkbox */}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIds((prev) =>
                        isSelected ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                      )
                    }
                    className="absolute left-4 top-4 z-10 rounded bg-dark/70 p-1 text-paper transition-opacity"
                  >
                    {isSelected ? (
                      <CheckSquare size={14} className="text-lime" />
                    ) : (
                      <Square size={14} className="opacity-70 hover:opacity-100" />
                    )}
                  </button>

                  <div className="relative aspect-square overflow-hidden rounded-lg bg-accent-soft">
                    <Image src={d.image_url} alt={d.name} fill className="object-contain" />
                  </div>

                  <p className="mt-2 truncate text-xs font-medium text-ink" title={d.name}>
                    {d.name}
                  </p>

                  {/* Selector de Color */}
                  <div className="mt-1.5">
                    <select
                      value={d.color ?? ""}
                      onChange={(e) => updateColor(d.id, e.target.value || null)}
                      className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-[11px] text-ink focus:border-ink focus:outline-none"
                    >
                      <option value="">Sin color</option>
                      {COLORS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector y chips de Categorías */}
                  {categories.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {/* Chips de categorías asignadas */}
                      {d.category_ids.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {d.category_ids.map((catId) => {
                            const cat = categories.find((c) => c.id === catId);
                            return cat ? (
                              <button
                                key={catId}
                                onClick={() => {
                                  const newIds = d.category_ids.filter((id) => id !== catId);
                                  assignCategoriesToDesign(d.id, newIds);
                                }}
                                className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] text-accent hover:bg-accent/40 transition-colors"
                                title="Click para quitar"
                              >
                                {cat.name}
                                <X size={12} />
                              </button>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Selector para agregar categorías */}
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const newIds = [...d.category_ids, e.target.value];
                            assignCategoriesToDesign(d.id, newIds);
                            e.target.value = "";
                          }
                        }}
                        className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-[11px] text-ink focus:border-ink focus:outline-none"
                      >
                        <option value="">+ Agregar categoría</option>
                        {categories
                          .filter((cat) => !d.category_ids.includes(cat.id))
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                      <input
                        type="checkbox"
                        checked={d.active}
                        onChange={(e) => toggleActive(d.id, e.target.checked)}
                        className="h-3.5 w-3.5 accent-accent"
                      />
                      Activo
                    </label>
                    <button
                      type="button"
                      onClick={() => removeDesign(d.id)}
                      className="rounded-full p-1 text-ink-soft hover:bg-accent-soft hover:text-accent"
                      title="Eliminar diseño"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
