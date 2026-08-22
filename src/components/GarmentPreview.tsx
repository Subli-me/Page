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

/** Devuelve el brillo del color, de 0 (negro) a 1 (blanco). */
function luminance(r: number, g: number, b: number) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function parseHex(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return m ? ([1, 2, 3].map((i) => parseInt(m[i], 16)) as [number, number, number]) : null;
}

/**
 * Cuántas veces se dibuja la foto encima del color.
 *
 * El apilado existe para recuperar contraste: sobre un color oscuro, una sola
 * pasada deja llegar apenas 11 niveles y la prenda se ve como un bloque plano;
 * con tres el relieve sube a ~30. Pero sobre una prenda blanca no hay nada que
 * recuperar — la foto ya se ve bien — y apilarla solo la ensucia (la lleva de
 * 243 a 221, un blanco sucio).
 *
 * Por eso la cantidad de copias sigue a lo oscuro que sea el color: 3 para el
 * negro, 1 para el blanco, sin saltos bruscos en el medio.
 */
export function garmentLayers(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 1;
  return 1 + Math.round(2 * (1 - luminance(...rgb)));
}

/**
 * Aclara apenas el color con el que se pinta la prenda.
 *
 * Como el color de atrás aporta la mayor parte del resultado, un negro puro
 * tira el resultado al piso. Lo mezclamos con blanco, más cuanto más oscuro
 * sea: el negro sigue leyéndose como negro y el blanco queda intacto.
 */
export function fabricColor(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;

  const lift = 0.12 * (1 - luminance(...rgb));
  const mix = (c: number) => Math.round(c + (255 - c) * lift);

  return `rgb(${mix(rgb[0])}, ${mix(rgb[1])}, ${mix(rgb[2])})`;
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
        Array.from({ length: garmentLayers(colorHex) - 1 }).map((_, i) => (
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
