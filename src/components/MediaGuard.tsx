"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Estorba el copiado casual de imágenes y videos en todo el sitio público.
 *
 * Antes esto vivía en cada componente, y las imágenes que no pasaban por ellos
 * —la vista previa del pedido, por ejemplo, que usa etiquetas sueltas— quedaban
 * sin cubrir. Escuchando en el documento se cubren todas, incluidas las que se
 * agreguen después.
 *
 * Solo actúa sobre imágenes, videos y lienzos: el clic derecho sobre el texto
 * sigue funcionando. Bloquearlo entero molesta a quien quiere copiar un precio
 * o abrir un enlace en otra pestaña, y no protege nada más.
 *
 * En el panel no se aplica: ahí uno sí quiere poder abrir un archivo en otra
 * pestaña o guardarlo.
 *
 * Alcance real: frena a quien pasa y quiere la foto de un clic. No frena a
 * nadie que abra las herramientas del navegador. No existe forma de mostrar una
 * imagen e impedir que se guarde; lo que de verdad protege es que la copia que
 * se sirve sea chica y no sirva para imprimir.
 */
export function MediaGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    const TAGS = ["IMG", "VIDEO", "CANVAS", "PICTURE"];

    const esMedia = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el?.tagName) return false;
      if (TAGS.includes(el.tagName)) return true;

      // Cuando la imagen tiene los eventos apagados —como el diseño sobre la
      // prenda, que deja pasar el arrastre al contenedor— el clic llega al
      // padre. Se mira un solo nivel: alcanza para ese caso y evita bloquear
      // una sección entera por tener una foto adentro.
      const hijo = el.firstElementChild;
      return !!hijo && TAGS.includes(hijo.tagName);
    };

    const bloquear = (e: Event) => {
      if (esMedia(e.target)) e.preventDefault();
    };

    document.addEventListener("contextmenu", bloquear);
    document.addEventListener("dragstart", bloquear);
    return () => {
      document.removeEventListener("contextmenu", bloquear);
      document.removeEventListener("dragstart", bloquear);
    };
  }, [pathname]);

  return null;
}
