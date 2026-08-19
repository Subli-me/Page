"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { DesignCatalogItem } from "@/lib/types";
import { Reveal } from "./Reveal";

export function DesignGrid({ designs }: { designs: DesignCatalogItem[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("todas");

  if (designs.length === 0) return null;

  // Extraer las categorías únicas existentes
  const customCategories = Array.from(
    new Set(designs.map((d) => d.category).filter((c): c is string => Boolean(c)))
  );

  const filters = [
    { value: "todas", label: "Todos", count: designs.length },
    ...customCategories.map((cat) => ({
      value: cat,
      label: cat,
      count: designs.filter((d) => d.category === cat).length,
    })),
  ];

  const filtered =
    activeFilter === "todas"
      ? designs
      : designs.filter((d) => d.category === activeFilter);

  return (
    <div>
      {/* Tabs de filtro */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setActiveFilter(f.value)}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all capitalize",
              activeFilter === f.value
                ? "border-ink bg-ink text-paper shadow-sm"
                : "border-line bg-panel text-ink hover:border-ink"
            )}
          >
            {f.label}
            <span className="ml-0.5 rounded-full bg-paper/20 px-1.5 py-0.5 text-[10px] font-normal tabular-nums">
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grilla */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center text-sm text-ink-soft"
          >
            No hay diseños en esta categoría todavía.
          </motion.p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4"
          >
            {filtered.map((d, i) => (
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
                  {/* Badge Categoría */}
                  {d.category && (
                    <div className="absolute left-2 top-2">
                      <span className="rounded-md bg-dark/70 px-2 py-0.5 text-[10px] font-medium text-paper backdrop-blur-xs capitalize">
                        {d.category}
                      </span>
                    </div>
                  )}
                  {/* Nombre al hover */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-dark/85 px-3 py-2 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
                    <p className="truncate text-[11px] font-medium text-paper">{d.name}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

