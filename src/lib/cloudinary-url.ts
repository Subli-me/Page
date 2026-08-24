/**
 * Convierte una URL de Cloudinary en una de descarga.
 *
 * El atributo `download` de un enlace no sirve cuando el archivo está en otro
 * dominio: el navegador lo ignora y abre la imagen en una pestaña. Cloudinary
 * responde `Content-Disposition: inline` por defecto, y con la bandera
 * `fl_attachment` pasa a `attachment`, que es lo que fuerza la descarga real y
 * además permite ponerle un nombre con sentido al archivo.
 */
export function attachmentUrl(url: string, filename?: string): string {
  if (!url.includes("/upload/")) return url;

  const safe = filename
    ? filename
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9-]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()
    : "";

  const flag = safe ? `fl_attachment:${safe}` : "fl_attachment";
  return url.replace("/upload/", `/upload/${flag}/`);
}

/**
 * Versión reducida para mostrar en público.
 *
 * El catálogo exponía la dirección del archivo original, que sirve el diseño en
 * resolución de impresión: alcanzaba con mirar el código fuente para bajarlo
 * listo para estampar. Bloquear el clic derecho no cambia eso.
 *
 * Acá se pide a Cloudinary una copia angosta. Se ve igual de bien en pantalla y
 * deja de ser útil para imprimir, que es lo que se quiere proteger. El archivo
 * original sigue disponible para producción, que es donde hace falta.
 */
export function publicImageUrl(url: string, width = 700): string {
  if (!url.includes("/upload/")) return url;
  // `q_auto` deja que Cloudinary elija la compresión según el formato.
  return url.replace("/upload/", `/upload/w_${width},q_auto/`);
}
