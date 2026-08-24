import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad.
 *
 * No hay Content-Security-Policy: el sitio sube archivos directo a Cloudinary,
 * carga fuentes de Google y usa estilos en línea, así que una CSP mal puesta
 * rompe la subida de pedidos. Conviene agregarla aparte, midiendo primero en
 * modo report-only.
 */
const securityHeaders = [
  // Evita que el sitio se pueda incrustar en un iframe ajeno, que es como se
  // arman los engaños de clic (el visitante cree que toca una cosa y toca otra).
  { key: "X-Frame-Options", value: "DENY" },

  // Que el navegador respete el tipo declarado y no adivine: un archivo subido
  // por un cliente no debería poder interpretarse como algo ejecutable.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Al salir del sitio se manda el dominio, nunca la dirección completa: las
  // direcciones de pedido llevan un identificador que hace de enlace privado.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // No usamos cámara, micrófono ni ubicación.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },

  // Solo por HTTPS, incluidos los subdominios.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // No anunciar con qué está hecho el sitio.
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "files.cdn.printful.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Formatos modernos: bastante más livianos que JPEG con la misma calidad.
    formats: ["image/avif", "image/webp"],
    // Los archivos son inmutables (cada subida tiene su propia dirección), así
    // que conviene que la copia optimizada dure. De paso, si el original se
    // borra de Cloudinary, la copia sobrevive más tiempo.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
