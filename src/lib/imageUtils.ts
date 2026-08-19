/**
 * Convierte un archivo de imagen (PNG, JPG, WEBP, etc.) a formato WebP y optimiza su tamaño.
 * Mantiene la transparencia para PNGs y escala proporcionalmente si excede maxDimension.
 */
export async function convertToWebP(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const { maxDimension = 2400, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Escalar si excede la dimensión máxima respetando la relación de aspecto
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto 2D del canvas"));
        return;
      }

      // Dibujar imagen en canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Error al convertir la imagen a WebP"));
            return;
          }

          // Reemplazar la extensión por .webp
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const convertedFile = new File([blob], newFileName, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          resolve(convertedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}
