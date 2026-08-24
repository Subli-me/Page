import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";

/**
 * Lo que necesita el celular para instalar el sitio como una app.
 *
 * Sin esto, "Agregar a pantalla de inicio" crea apenas un acceso directo: abre
 * el navegador con la barra de direcciones a la vista y usa una captura de la
 * página como ícono.
 *
 * Se arma desde la configuración y no fijo, así que el nombre acompaña al del
 * sitio si algún día cambia.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();

  return {
    name: settings.logo_text,
    short_name: settings.logo_text,
    description: settings.seo_description,

    // Arranca en la portada: quien instala el sitio quiere el catálogo, no un
    // paso suelto del pedido.
    start_url: "/",
    scope: "/",

    // Sin barra de direcciones, como una app.
    display: "standalone",

    // El color de fondo se ve mientras carga; el del tema pinta la barra de
    // estado. Van iguales a los del sitio para que no haya un salto al abrir.
    background_color: "#faf9f6",
    theme_color: settings.color_accent,
    lang: "es-AR",

    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      // Android recorta el ícono según el teléfono (círculo, cuadrado
      // redondeado). Estos traen margen para que el logo no quede cortado.
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    // Accesos directos al mantener apretado el ícono.
    shortcuts: [
      {
        name: "Armar un pedido",
        short_name: "Pedido",
        url: "/pedido",
      },
      {
        name: "Ver diseños",
        short_name: "Diseños",
        url: "/disenos",
      },
    ],
  };
}
