"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { WorkShowcase } from "@/lib/types";
import { ImageUploader, type UploadedImage } from "@/components/order/ImageUploader";

/**
 * Trabajos terminados para mostrar en la página de inicio.
 *
 * La foto es lo único obligatorio: una galería de trabajos reales ya convence
 * sola. El testimonio suma cuando el cliente dijo algo, y no siempre pasa.
 */
export function WorksAdmin({ initial }: { initial: WorkShowcase[] }) {
  const [works, setWorks] = useState(initial);
  const [subiendo, setSubiendo] = useState(false);

  async function agregar(img: UploadedImage | null) {
    if (!img) return;
    setSubiendo(true);
    try {
      const res = await fetch("/api/admin/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: img.url, imagePublicId: img.publicId }),
      });
      const json = await res.json();
      if (json.work) setWorks((prev) => [...prev, json.work]);
    } finally {
      setSubiendo(false);
    }
  }

  async function guardar(
    id: string,
    field: "caption" | "customer_name" | "quote" | "active",
    value: string | boolean
  ) {
    setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
    await fetch(`/api/admin/works/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function borrar(id: string) {
    if (!confirm("¿Sacar este trabajo de la galería?")) return;
    setWorks((prev) => prev.filter((w) => w.id !== id));
    await fetch(`/api/admin/works/${id}`, { method: "DELETE" });
  }

  async function mover(index: number, dir: "up" | "down") {
    const destino = dir === "up" ? index - 1 : index + 1;
    if (destino < 0 || destino >= works.length) return;

    const reordenados = [...works];
    const [movido] = reordenados.splice(index, 1);
    reordenados.splice(destino, 0, movido);

    const conOrden = reordenados.map((w, i) => ({ ...w, sort_order: i }));
    setWorks(conOrden);

    await Promise.all(
      conOrden.map((w) =>
        fetch(`/api/admin/works/${w.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: w.sort_order }),
        })
      )
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-1 font-display text-xl">Agregar un trabajo</h2>
        <p className="mb-4 max-w-2xl text-sm text-ink-soft">
          Una foto de la prenda terminada. Después podés agregarle qué es y, si
          el cliente dijo algo, su comentario.
        </p>
        <div className="max-w-md">
          <ImageUploader
            value={null}
            onChange={agregar}
            accept="image/*"
            signatureEndpoint="/api/admin/upload-signature"
            label={subiendo ? "Subiendo..." : "Arrastrá la foto del trabajo, o hacé click"}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl">
          En la galería{" "}
          <span className="text-sm font-normal text-ink-soft">
            ({works.filter((w) => w.active).length} visible
            {works.filter((w) => w.active).length !== 1 ? "s" : ""})
          </span>
        </h2>

        {works.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-ink-soft">
            Todavía no cargaste ningún trabajo. La sección no aparece en la
            página hasta que haya al menos uno.
          </p>
        ) : (
          <div className="space-y-3">
            {works.map((w, i) => (
              <div
                key={w.id}
                className={clsx(
                  "flex flex-wrap gap-4 rounded-2xl border p-4",
                  w.active ? "border-line bg-panel" : "border-line bg-paper opacity-60"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => mover(i, "up")}
                      disabled={i === 0}
                      aria-label="Subir"
                      className="rounded p-0.5 text-ink-soft hover:text-accent disabled:opacity-20"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(i, "down")}
                      disabled={i === works.length - 1}
                      aria-label="Bajar"
                      className="rounded p-0.5 text-ink-soft hover:text-accent disabled:opacity-20"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>

                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-accent-soft">
                    <Image
                      src={w.image_url}
                      alt={w.caption ?? "Trabajo"}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="min-w-56 flex-1 space-y-2">
                  <input
                    className="input h-9 w-full py-0 text-sm"
                    placeholder="Qué es (ej: Remeras para el equipo de fútbol)"
                    defaultValue={w.caption ?? ""}
                    onBlur={(e) =>
                      e.target.value !== (w.caption ?? "") &&
                      guardar(w.id, "caption", e.target.value)
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <input
                      className="input h-9 w-36 py-0 text-sm"
                      placeholder="Nombre del cliente"
                      defaultValue={w.customer_name ?? ""}
                      onBlur={(e) =>
                        e.target.value !== (w.customer_name ?? "") &&
                        guardar(w.id, "customer_name", e.target.value)
                      }
                    />
                    <input
                      className="input h-9 min-w-56 flex-1 py-0 text-sm"
                      placeholder="Lo que dijo (opcional)"
                      defaultValue={w.quote ?? ""}
                      onBlur={(e) =>
                        e.target.value !== (w.quote ?? "") && guardar(w.id, "quote", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <input
                      type="checkbox"
                      checked={w.active}
                      onChange={(e) => guardar(w.id, "active", e.target.checked)}
                      className="h-4 w-4 accent-accent"
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    onClick={() => borrar(w.id)}
                    aria-label="Eliminar"
                    className="rounded-full p-1.5 text-ink-soft hover:bg-accent-soft hover:text-accent"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
