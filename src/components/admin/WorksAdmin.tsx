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
export function WorksAdmin({
  initial,
  perView,
  autoplay,
  intervalSeconds,
}: {
  initial: WorkShowcase[];
  perView: number;
  autoplay: boolean;
  intervalSeconds: number;
}) {
  const [works, setWorks] = useState(initial);
  const [subiendo, setSubiendo] = useState(false);
  const [porVista, setPorVista] = useState(perView);
  const [pasaSolo, setPasaSolo] = useState(autoplay);
  const [segundos, setSegundos] = useState(intervalSeconds);

  async function guardarAjuste(campo: string, valor: number | boolean) {
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    });
  }

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
        <h2 className="mb-1 font-display text-xl">Cuántos se ven a la vez</h2>
        <p className="mb-3 max-w-2xl text-sm text-ink-soft">
          Es el ancho de la vista, no cuántos hay: el resto sigue ahí y se llega
          deslizando. En celulares se muestra uno solo aunque acá elijas más,
          porque tres tarjetas no se leen en esa pantalla.
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setPorVista(n);
                guardarAjuste("works_per_view", n);
              }}
              className={clsx(
                "h-10 w-10 rounded-full border text-sm transition-colors",
                porVista === n ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-display text-xl">Que pase solo</h2>
        <p className="mb-3 max-w-2xl text-sm text-ink-soft">
          Se frena cuando alguien pasa el mouse por encima o lo desliza a mano,
          así no se mueve mientras están leyendo un comentario.
        </p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pasaSolo}
            onChange={(e) => {
              setPasaSolo(e.target.checked);
              guardarAjuste("works_autoplay", e.target.checked);
            }}
            className="h-4 w-4 accent-accent"
          />
          Pasar al siguiente automáticamente
        </label>

        {pasaSolo && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-soft">Cada</span>
            <input
              type="number"
              min={2}
              max={30}
              value={segundos}
              onChange={(e) => setSegundos(Number(e.target.value))}
              onBlur={(e) => {
                const n = Math.min(30, Math.max(2, Number(e.target.value) || 5));
                setSegundos(n);
                guardarAjuste("works_interval_seconds", n);
              }}
              className="input h-10 w-20 py-0 text-center text-sm"
            />
            <span className="text-sm text-ink-soft">
              segundos <span className="text-ink-soft/70">(entre 2 y 30)</span>
            </span>
          </div>
        )}
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
