import type { NextConfig } from "next";

/**
 * Reglas de seguridad de contenido.
 *
 * Sobre `script-src`, que es la parte floja y conviene entender: lo ideal sería
 * un número de un solo uso por pedido, que hace que un script inyectado no se
 * ejecute. No se puede acá: buena parte del sitio —el panel entero incluido— se
 * genera en el build, y una página ya generada no puede llevar un número que
 * cambia en cada visita. Se probó y bloqueaba todos los scripts de esas
 * páginas.
 *
 * Así que `script-src` queda permisivo y el valor real de esta regla está en lo
 * demás: nadie puede incrustar el sitio, cargar complementos, cambiar la base
 * de las direcciones, mandar un formulario a otro lado, ni hablar con
 * servidores que no sean los propios.
 */
const contentSecurityPolicy = [
  "default-src 'self'",

  // Next escribe sus scripts de arranque dentro del HTML, así que no se pueden
  // restringir sin romper la página.
  "script-src 'self' 'unsafe-inline'",

  // Los estilos se escriben en la propia etiqueta en muchos lugares: el color
  // de la prenda, la posición del diseño sobre ella.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",

  // `blob:` es para las composiciones que se arman en el navegador antes de
  // subirlas.
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://files.cdn.printful.com",
  "media-src 'self' https://res.cloudinary.com",

  // A dónde puede hablar el sitio: su propia API, Supabase, y la subida directa
  // a Cloudinary.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com https://res.cloudinary.com",

  // Nadie incrusta el sitio, y el sitio no incrusta a nadie.
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",

  // Los formularios solo se envían acá, y nadie puede cambiar la base de las
  // direcciones relativas.
  "form-action 'self'",
  "base-uri 'self'",
].join("; ");

/**
 * Cabeceras de seguridad.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },

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

  // Una pestaña abierta desde el sitio queda aislada: la que abre no puede
  // manipular la que se abrió, ni al revés. El sitio no usa ventanas emergentes
  // que necesiten hablarse, así que no cuesta nada.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },

  // Otros sitios no pueden incrustar los recursos de este. De paso corta el
  // enganche de imágenes desde afuera.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
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
