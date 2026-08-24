"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import clsx from "clsx";
import type { WorkShowcase as Work } from "@/lib/types";

/**
 * Trabajos ya entregados, en carrusel.
 *
 * Es la prueba de que lo que se promete existe: alguien que nunca compró ve
 * prendas reales, no maquetas. Las que tienen comentario del cliente lo
 * muestran debajo de la foto, porque una foto con testimonio pesa más que las
 * dos cosas por separado.
 *
 * El desplazamiento es scroll nativo con anclaje, no una animación propia: así
 * el gesto del dedo en el celular funciona sin que haya que programarlo, y con
 * el teclado también se navega.
 */
/** Cada cuánto pasa al siguiente grupo. */
const INTERVALO_MS = 5000;

/** Cuánto espera para retomar el avance después de que alguien lo movió. */
const REANUDAR_MS = 10000;

export function WorkShowcase({ works, perView = 3 }: { works: Work[]; perView?: number }) {
  const pistaRef = useRef<HTMLDivElement>(null);
  const reanudarRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pausado, setPausado] = useState(false);
  const [alcanzables, setAlcanzables] = useState({ atras: false, adelante: false });

  // Cuántas entran de verdad. En pantallas chicas se muestran menos aunque la
  // configuración diga más: tres tarjetas en un celular no se leen.
  const [visibles, setVisibles] = useState(1);

  useEffect(() => {
    const calcular = () => {
      const ancho = window.innerWidth;
      const cabe = ancho < 640 ? 1 : ancho < 1024 ? 2 : perView;
      setVisibles(Math.min(cabe, perView));
    };
    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, [perView]);

  // Los botones se apagan en los extremos en vez de quedar sin efecto.
  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;

    const revisar = () => {
      const { scrollLeft, scrollWidth, clientWidth } = pista;
      setAlcanzables({
        atras: scrollLeft > 8,
        adelante: scrollLeft + clientWidth < scrollWidth - 8,
      });
    };
    revisar();

    pista.addEventListener("scroll", revisar, { passive: true });
    window.addEventListener("resize", revisar);
    return () => {
      pista.removeEventListener("scroll", revisar);
      window.removeEventListener("resize", revisar);
    };
  }, [works.length, visibles]);

  const hayCarrusel = works.length > visibles;

  /**
   * Avance solo.
   *
   * Se frena en varios casos a propósito: mover el contenido mientras alguien
   * lee un testimonio es peor que no moverlo. Se pausa al pasar el mouse, al
   * navegar con teclado, cuando la pestaña no está a la vista, y un rato
   * después de que la persona deslizó a mano, para no pelearle el control.
   *
   * Y no corre si el visitante pidió menos movimiento en su sistema.
   */
  useEffect(() => {
    if (!hayCarrusel || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      const pista = pistaRef.current;
      if (!pista || document.hidden) return;

      const alFinal = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 8;
      pista.scrollTo({
        left: alFinal ? 0 : pista.scrollLeft + pista.clientWidth,
        behavior: "smooth",
      });
    }, INTERVALO_MS);

    return () => clearInterval(id);
  }, [hayCarrusel, pausado]);

  /** Un rato sin avance solo después de que la persona deslizó a mano. */
  function pausarUnRato() {
    setPausado(true);
    if (reanudarRef.current) clearTimeout(reanudarRef.current);
    reanudarRef.current = setTimeout(() => setPausado(false), REANUDAR_MS);
  }

  useEffect(() => () => {
    if (reanudarRef.current) clearTimeout(reanudarRef.current);
  }, []);

  function mover(dir: -1 | 1) {
    pausarUnRato();
    const pista = pistaRef.current;
    if (!pista) return;
    // Se avanza una pantalla completa, no una tarjeta: así no queda una mitad
    // colgando al final del recorrido.
    pista.scrollBy({ left: dir * pista.clientWidth, behavior: "smooth" });
  }

  // Sin trabajos cargados la sección no existe: una galería vacía dice lo
  // contrario de lo que se busca. Va después de los hooks, que no pueden
  // quedar detrás de un retorno anticipado.
  if (works.length === 0) return null;

  return (
    <section id="trabajos" className="border-t border-line/70 bg-panel">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl italic tracking-tight">Trabajos hechos</h2>
            <p className="mt-2 max-w-lg text-sm text-ink-soft">
              Prendas que ya entregamos. Así quedan de verdad, fuera de la
              pantalla.
            </p>
          </div>

          {hayCarrusel && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => mover(-1)}
                disabled={!alcanzables.atras}
                aria-label="Ver anteriores"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-line"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => mover(1)}
                disabled={!alcanzables.adelante}
                aria-label="Ver siguientes"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-line"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>

        <div
          ref={pistaRef}
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onFocusCapture={() => setPausado(true)}
          onBlurCapture={() => setPausado(false)}
          onPointerDown={pausarUnRato}
          onWheel={pausarUnRato}
          className={clsx(
            "flex gap-4 overflow-x-auto pb-2",
            // La barra se oculta pero el scroll sigue existiendo: en celular se
            // arrastra con el dedo, y con teclado se navega igual.
            "scrollbar-none",
            hayCarrusel && "snap-x snap-mandatory"
          )}
        >
          {works.map((w) => (
            <figure
              key={w.id}
              className="group w-full shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-paper"
              style={{
                // El ancho sale de cuántas entran, descontando la separación.
                width: `calc((100% - ${(visibles - 1) * 16}px) / ${visibles})`,
              }}
            >
              <div className="relative aspect-4/3">
                <Image
                  src={w.image_url}
                  alt={w.caption ?? "Prenda estampada"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
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
          ))}
        </div>

        {hayCarrusel && (
          <p className="mt-4 text-center text-xs text-ink-soft">
            {works.length} trabajos · pasan solos, o deslizá vos
          </p>
        )}
      </div>
    </section>
  );
}
