"use client";

/**
 * Prenda teñida del color elegido.
 *
 * Las fotos de mockup son PNG donde la tela es semitransparente (alfa ~26 de
 * 255) y el fondo opaco. Por eso el color va como capa de atrás: se ve a través
 * de la tela y queda tapado fuera de la silueta.
 *
 * Lo usan tanto el armado del pedido como el panel de administración, así que
 * lo que prueba el admin es exactamente lo que termina viendo el cliente.
 */

/**
 * Cuántas veces se dibuja la foto encima del color.
 *
 * Con una sola pasada llegan apenas 11 niveles de contraste y la prenda se ve
 * como un bloque plano. Cada copia vuelve a componer sobre la anterior: con
 * tres, el relieve sube a ~30 niveles sin ensuciar los colores claros (un
 * blanco queda en ~221, dentro de lo que da la sombra real de una prenda).
 */
export const GARMENT_LAYERS = 3;

/**
 * Aclara apenas el color con el que se pinta la prenda.
 *
 * Como el color de atrás aporta la mayor parte del resultado, un negro puro
 * tira el resultado al piso. Lo mezclamos con blanco, más cuanto más oscuro
 * sea: el negro sigue leyéndose como negro y los claros quedan intactos.
 */
export function fabricColor(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;

  const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const lift = 0.12 * (1 - luminance);
  const mix = (c: number) => Math.round(c + (255 - c) * lift);

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function GarmentPreview({
  imageUrl,
  colorHex,
  imageClassName,
  alt = "Prenda",
}: {
  imageUrl: string;
  colorHex?: string | null;
  imageClassName?: string;
  alt?: string;
}) {
  return (
    <div className="relative inline-block">
      {colorHex && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: fabricColor(colorHex) }}
        />
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className={`relative block ${imageClassName ?? ""}`} draggable={false} />

      {/* Copias apiladas para que se noten los pliegues. Es la misma URL, así
          que el navegador la descarga una sola vez. */}
      {colorHex &&
        Array.from({ length: GARMENT_LAYERS - 1 }).map((_, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={i}
            src={imageUrl}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        ))}
    </div>
  );
}
