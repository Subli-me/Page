import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pedido`, changeFrequency: "monthly", priority: 0.8 },
    // El catálogo completo de diseños: es la página con más contenido indexable.
    { url: `${SITE_URL}/disenos`, changeFrequency: "weekly", priority: 0.9 },
  ];
}
