"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Check, Search, X } from "lucide-react";
import type { DesignCatalogItem, DesignCategory } from "@/lib/types";
import { ImageUploader, type UploadedImage } from "./ImageUploader";

type Tab = "upload" | "catalog";

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

/** Saca tildes para que "Piqué" se encuentre escribiendo "pique". */
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function DesignPicker({
  designs,
  value,
  onChange,
}: {
  designs: DesignCatalogItem[];
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
}) {
  const [tab, setTab] = useState<Tab>("upload");
  const [search, setSearch] = useState("");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<DesignCategory[]>([]);

  useEffect(() => {
    fetch("/api/admin/design-categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Solo ofrecemos filtrar por lo que realmente tiene diseños, para no mostrar
  // opciones que no llevan a ningún lado.
  const availableColors = useMemo(
    () => COLORS.filter((c) => designs.some((d) => d.color_ids.includes(c.value))),
    [designs]
  );
  const availableCategories = useMemo(
    () => categories.filter((c) => designs.some((d) => d.category_ids.includes(c.id))),
    [categories, designs]
  );

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return designs.filter((d) => {
      if (q && !normalize(d.name).includes(q)) return false;
      if (color && !d.color_ids.includes(color)) return false;
      if (category && !d.category_ids.includes(category)) return false;
      return true;
    });
  }, [designs, search, color, category]);

  const hasFilters = !!(search || color || category);

  if (designs.length === 0) {
    // Sin catálogo cargado, solo se puede subir imagen propia.
    return <ImageUploader value={value} onChange={onChange} />;
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-full border border-line p-1 text-sm">
        {([
          ["upload", "Subir mi imagen"],
          ["catalog", "Elegir del catálogo"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={clsx(
              "rounded-full px-4 py-1.5 transition-colors",
              tab === key ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <ImageUploader value={value} onChange={onChange} />
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              className="input h-9 w-full pl-8 pr-8 text-sm"
              placeholder="Buscar diseño..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                aria-label="Borrar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              className="input h-8 flex-1 min-w-28 text-xs"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="">Todos los colores</option>
              {availableColors.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.name}
                </option>
              ))}
            </select>

            {availableCategories.length > 0 && (
              <select
                className="input h-8 flex-1 min-w-28 text-xs"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>
              {filtered.length} de {designs.length} diseño{designs.length !== 1 ? "s" : ""}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setColor("");
                  setCategory("");
                }}
                className="underline underline-offset-2 hover:text-ink"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
              No encontramos diseños con esa búsqueda. Probá con otro nombre o
              subí tu propia imagen.
            </p>
          ) : (
            <div className="grid max-h-112 grid-cols-3 gap-3 overflow-y-auto pr-1">
              {filtered.map((d) => {
                const selected = value?.publicId === d.image_public_id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onChange({ url: d.image_url, publicId: d.image_public_id })}
                    title={d.name}
                    className={clsx(
                      "group relative aspect-square overflow-hidden rounded-xl border-2 bg-accent-soft transition-colors",
                      selected ? "border-accent" : "border-transparent hover:border-line"
                    )}
                  >
                    <Image src={d.image_url} alt={d.name} fill className="object-contain p-2" />

                    {/* El nombre importa para saber qué se está eligiendo, pero
                        taparía el diseño: aparece al pasar por encima. */}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-dark/85 px-1.5 py-1 text-[10px] text-paper opacity-0 transition-opacity group-hover:opacity-100">
                      {d.name}
                    </span>

                    {selected && (
                      <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-paper">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
