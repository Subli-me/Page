/**
 * Revisa el archivo del cliente antes de subirlo y avisa lo que puede salir
 * mal en la prenda.
 *
 * Son avisos, no bloqueos: hay diseños que a propósito son chicos o llevan
 * fondo. La idea es que nadie se entere del problema recién cuando recibe la
 * remera impresa.
 */

export type ImageWarning = {
  kind: "resolucion" | "fondo";
  title: string;
  detail: string;
};

/**
 * Ancho mínimo recomendado.
 *
 * Un estampado de pecho ronda los 28 cm de ancho. A 150 puntos por pulgada
 * —lo razonable para DTF— eso da unos 1650 px. Por debajo de 1200 la pérdida
 * ya se nota en la prenda.
 */
const MIN_ANCHO = 1200;

/** Porcentaje de píxeles transparentes por debajo del cual se ve el recuadro. */
const MIN_TRANSPARENCIA = 0.02;

function leerImagen(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

/**
 * Un archivo puede tener canal alfa y aun así ser un rectángulo opaco, que es
 * el caso que termina imprimiendo un recuadro. Por eso miramos los píxeles y
 * no el formato.
 */
function medirTransparencia(img: HTMLImageElement): number | null {
  // Alcanza con una versión chica: buscamos una proporción, no precisión.
  const ancho = Math.min(200, img.naturalWidth);
  const alto = Math.max(1, Math.round((ancho / img.naturalWidth) * img.naturalHeight));

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, ancho, alto);

  try {
    const { data } = ctx.getImageData(0, 0, ancho, alto);
    let transparentes = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) transparentes++;
    }
    return transparentes / (ancho * alto);
  } catch {
    return null;
  }
}

export async function checkDesignImage(file: File): Promise<ImageWarning[]> {
  if (!file.type.startsWith("image/")) return [];

  try {
    const img = await leerImagen(file);
    const avisos: ImageWarning[] = [];

    if (img.naturalWidth < MIN_ANCHO) {
      avisos.push({
        kind: "resolucion",
        title: "La imagen es chica para imprimir",
        detail: `Mide ${img.naturalWidth}×${img.naturalHeight} px. Para que el estampado salga nítido conviene al menos ${MIN_ANCHO} px de ancho; con esta puede verse borrosa o pixelada en la prenda.`,
      });
    }

    // Los SVG no tienen píxeles que medir y suelen venir bien recortados.
    if (file.type !== "image/svg+xml") {
      const transparencia = medirTransparencia(img);
      if (transparencia !== null && transparencia < MIN_TRANSPARENCIA) {
        avisos.push({
          kind: "fondo",
          title: "La imagen no tiene fondo transparente",
          detail:
            "Se va a estampar el rectángulo completo, incluido el fondo. Sobre una prenda de color se va a notar como un recuadro. Si querés que salga solo el dibujo, subí un PNG con el fondo recortado.",
        });
      }
    }

    return avisos;
  } catch {
    return [];
  }
}
