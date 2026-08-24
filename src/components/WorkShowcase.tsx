import Image from "next/image";
import { Quote } from "lucide-react";
import type { WorkShowcase as Work } from "@/lib/types";
import { Reveal } from "./Reveal";

/**
 * Trabajos ya entregados.
 *
 * Es la prueba de que lo que se promete existe: alguien que nunca compró ve
 * prendas reales, no maquetas. Las que tienen comentario del cliente lo
 * muestran encima de la foto, porque una foto con testimonio pesa más que las
 * dos cosas por separado.
 */
export function WorkShowcase({ works }: { works: Work[] }) {
  // Sin trabajos cargados la sección no existe: una galería vacía dice lo
  // contrario de lo que se busca.
  if (works.length === 0) return null;

  return (
    <section id="trabajos" className="border-t border-line/70 bg-panel">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <Reveal>
          <h2 className="font-display text-4xl italic tracking-tight">Trabajos hechos</h2>
          <p className="mt-2 max-w-lg text-sm text-ink-soft">
            Prendas que ya entregamos. Así quedan de verdad, fuera de la
            pantalla.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((w, i) => (
            <Reveal key={w.id} delay={i * 0.05}>
              <figure className="group relative overflow-hidden rounded-2xl border border-line bg-paper">
                <div className="relative aspect-4/3">
                  <Image
                    src={w.image_url}
                    alt={w.caption ?? "Prenda estampada"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {(w.caption || w.quote) && (
                  <figcaption className="p-4">
                    {w.caption && <p className="text-sm font-medium">{w.caption}</p>}

                    {w.quote && (
                      <blockquote className="mt-2 flex gap-2">
                        <Quote size={14} className="mt-0.5 shrink-0 text-accent" />
                        <div>
                          <p className="text-sm italic text-ink-soft">{w.quote}</p>
                          {w.customer_name && (
                            <cite className="mt-1 block text-xs not-italic text-ink-soft/80">
                              — {w.customer_name}
                            </cite>
                          )}
                        </div>
                      </blockquote>
                    )}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
