"use client";

import Image, { type ImageProps } from "next/image";
import { publicImageUrl } from "@/lib/cloudinary-url";

/**
 * Imagen de catálogo, servida en tamaño de pantalla y con el copiado casual
 * estorbado.
 *
 * Dos aclaraciones honestas sobre hasta dónde llega esto:
 *
 * - Bloquear el clic derecho y el arrastre frena a quien pasa y quiere la foto
 *   de un clic. No frena a nadie que abra el código fuente, la pestaña de red o
 *   las herramientas del navegador. No existe forma de mostrar una imagen y a la
 *   vez impedir que se guarde.
 * - Lo que sí protege de verdad es el ancho: se sirve una copia chica, buena
 *   para mirar y mala para imprimir. El archivo original queda para producción.
 */
export function ProtectedImage({
  src,
  width: displayWidth = 700,
  ...props
}: Omit<ImageProps, "src" | "width"> & { src: string; width?: number }) {
  return (
    <Image
      {...props}
      src={publicImageUrl(src, displayWidth)}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={`${props.className ?? ""} select-none [-webkit-touch-callout:none]`}
    />
  );
}
