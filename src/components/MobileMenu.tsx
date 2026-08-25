"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

/**
 * El menú de la barra cuando la pantalla es angosta.
 *
 * En el celular no entran el logo, el carrito, el botón de pedido y encima tres
 * enlaces: antes esos enlaces simplemente se ocultaban, así que desde un
 * teléfono no había forma de llegar al catálogo, a la guía de talles ni al
 * proceso. Ahora se despliegan desde acá.
 *
 * El panel se cuelga de la barra (que ya es `relative`) en vez de vivir en un
 * portal aparte: así hereda su posición y su capa, y no hay que sincronizar dos
 * elementos dibujados en lugares distintos del documento. El fondo oscuro sí va
 * en un portal, porque tiene que quedar por debajo de la barra entera —una capa
 * a la que no se puede llegar desde adentro de ella.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Se resuelve al primer dibujo en vez de con un efecto: en el servidor no hay
  // `document`, y en el navegador el panel arranca cerrado, así que el portal
  // queda vacío en ambos lados y no hay desajuste al hidratar.
  const [contenedor] = useState(() =>
    typeof document === "undefined" ? null : document.body
  );

  useEffect(() => {
    if (!open) return;
    const alEscapar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", alEscapar);
    return () => window.removeEventListener("keydown", alEscapar);
  }, [open]);

  // Si la pantalla se ensancha hasta donde aparece el menú de escritorio, el
  // panel abierto dejaría los mismos enlaces dos veces.
  useEffect(() => {
    const escritorio = window.matchMedia("(min-width: 640px)");
    const alCambiar = () => {
      if (escritorio.matches) setOpen(false);
    };
    escritorio.addEventListener("change", alCambiar);
    return () => escritorio.removeEventListener("change", alCambiar);
  }, []);

  const fondo = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setOpen(false)}
          // z-40: la barra es z-50, así que esto tapa la página y no la barra.
          className="fixed inset-0 z-40 bg-dark/60 sm:hidden"
        />
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 rounded-full p-2 text-paper/80 transition-colors hover:bg-paper/10 hover:text-paper sm:hidden"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full border-b border-white/10 bg-dark/95 backdrop-blur-md sm:hidden"
          >
            {/* Un enlace lleva a otro lado, así que el panel ya cumplió y se
                cierra. Los demás disparadores abren una ventana cuyo estado vive
                dentro de este panel: cerrarlo los desmontaría y la ventana se
                iría con ellos. Esos quedan abiertos por debajo, y la ventana se
                dibuja encima. */}
            <div
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
              className="flex flex-col items-stretch gap-1 px-4 py-3"
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {contenedor && createPortal(fondo, contenedor)}
    </>
  );
}
