"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Palette } from "lucide-react";
import type { DesignCatalogItem, DesignCategory } from "@/lib/types";
import { Reveal } from "./Reveal";

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

export function DesignGrid({ designs }: { designs: DesignCatalogItem[] }) {
  const [activeColor, setActiveColor] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [categories, setCategories] = useState<DesignCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cargar categorías
  useEffect(() => {
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
    loadCategories();
  }, []);

  if (designs.length === 0) return null;

  // Filtrar diseños según color y categoría
  const filtered = designs.filter((d) => {
    if (activeColor && !d.color_ids.includes(activeColor)) return false;
    if (activeCategory && !d.category_ids.includes(activeCategory)) return false;
    return true;
  });

  // Contar diseños por color y categoría
  const colorCounts = COLORS.map((c) => ({
    ...c,
    count: designs.filter((d) => d.color_ids.includes(c.value)).length,
  }));

  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: designs.filter((d) => d.category_ids.includes(cat.id)).length,
  }));

  return (
    <div className="space-y-8">
      {/* Filtros por Color */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-ink-soft font-medium flex items-center gap-2">
          <Palette size={14} /> Filtrar por color
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveColor("")}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              !activeColor
                ? "border-ink bg-ink text-paper shadow-sm"
                : "border-line bg-panel text-ink hover:border-ink"
            )}
          >
            Todos
            <span className="ml-0.5 rounded-full bg-paper/20 px-1.5 py-0.5 text-[10px] font-normal tabular-nums">
              {designs.length}
            </span>
          </button>

          {colorCounts
            .filter((c) => c.count > 0)
            .map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setActiveColor(c.value)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  activeColor === c.value
                    ? "border-ink bg-ink text-paper shadow-sm"
                    : "border-line bg-panel text-ink hover:border-ink"
                )}
              >
                {c.name}
                <span className="ml-0.5 rounded-full bg-paper/20 px-1.5 py-0.5 text-[10px] font-normal tabular-nums">
                  {c.count}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Filtros por Categoría Temática */}
      {!loadingCategories && categoryCounts.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-ink-soft font-medium">
            Filtrar por categoría
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("")}
              className={clsx(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                !activeCategory
                  ? "border-ink bg-ink text-paper shadow-sm"
                  : "border-line bg-panel text-ink hover:border-ink"
              )}
            >
              Todas
              <span className="ml-0.5 rounded-full bg-paper/20 px-1.5 py-0.5 text-[10px] font-normal tabular-nums">
                {designs.length}
              </span>
            </button>

            {categoryCounts
              .filter((c) => c.count > 0)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    activeCategory === c.id
                      ? "border-ink bg-ink text-paper shadow-sm"
                      : "border-line bg-panel text-ink hover:border-ink"
                  )}
                >
                  {c.name}
                  <span className="ml-0.5 rounded-full bg-paper/20 px-1.5 py-0.5 text-[10px] font-normal tabular-nums">
                    {c.count}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Grilla de diseños */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center text-sm text-ink-soft"
          >
            No hay diseños con estos filtros.
          </motion.p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4"
          >
            {filtered.map((d, i) => {
              const designCategories = categories.filter((c) =>
                d.category_ids.includes(c.id)
              );
              return (
                <Reveal key={d.id} delay={i * 0.03}>
                  <motion.div
                    layout
                    whileHover={{ y: -4, scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    className="group relative overflow-hidden rounded-2xl border border-line bg-paper aspect-square cursor-default"
                  >
                    <Image
                      src={d.image_url}
                      alt={d.name}
                      fill
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Badges de Colores y Categoría */}
                    {(d.color_ids.length > 0 || designCategories.length > 0) && (
                      <div className="absolute left-2 top-2 flex flex-col gap-1">
                        {d.color_ids.length > 0 && (
                          <span className="rounded-md bg-dark/70 px-2 py-0.5 text-[10px] font-medium text-paper backdrop-blur-xs capitalize">
                            {d.color_ids.map((cId) => COLORS.find((c) => c.value === cId)?.name).join(", ")}
                          </span>
                        )}
                        {designCategories.length > 0 && (
                          <span className="rounded-md bg-accent/80 px-2 py-0.5 text-[10px] font-medium text-dark backdrop-blur-xs">
                            {designCategories[0].name}
                            {designCategories.length > 1 && `+${designCategories.length - 1}`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Nombre al hover */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-dark/85 px-3 py-2 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
                      <p className="truncate text-[11px] font-medium text-paper">{d.name}</p>
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
