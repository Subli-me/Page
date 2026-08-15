import type { PrintZone, Product, ProductColor, ProductSize, SiteSettings } from "@/lib/types";

// Datos de muestra que se usan SOLO cuando no hay un Supabase real configurado
// (NEXT_PUBLIC_SUPABASE_URL sigue en placeholder). Sirven para ver el sitio
// funcionando en local antes de crear la base de datos real. Se ignoran
// automáticamente apenas cargues las variables de entorno reales.
export const isDemoMode = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-remera",
    name: "Remera Oversize",
    slug: "remera-oversize",
    description: "Remera de algodón 24/1 corte oversize.",
    base_price: 12000,
    base_cost: 5000,
    image_url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80",
    active: true,
    sort_order: 1,
  },
  {
    id: "demo-buzo",
    name: "Buzo Canguro",
    slug: "buzo-canguro",
    description: "Buzo frisado con bolsillo canguro.",
    base_price: 22000,
    base_cost: 9500,
    image_url: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80",
    active: true,
    sort_order: 2,
  },
  {
    id: "demo-chomba",
    name: "Chomba Piqué",
    slug: "chomba-pique",
    description: "Chomba de piqué con cuello y puño.",
    base_price: 16000,
    base_cost: 7000,
    image_url: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80",
    active: true,
    sort_order: 3,
  },
];

export const DEMO_SIZES: ProductSize[] = DEMO_PRODUCTS.flatMap((p) =>
  ["S", "M", "L", "XL"].map((size, i) => ({
    id: `${p.id}-${size}`,
    product_id: p.id,
    size,
    price_delta: 0,
    sort_order: i,
  }))
);

export const DEMO_COLORS: ProductColor[] = DEMO_PRODUCTS.flatMap((p) => [
  { id: `${p.id}-blanco`, product_id: p.id, name: "Blanco", hex: "#ffffff", sort_order: 0 },
  { id: `${p.id}-negro`, product_id: p.id, name: "Negro", hex: "#16150f", sort_order: 1 },
]);

export const DEMO_ZONES: PrintZone[] = [
  { id: "z1", key: "front_chest", label: "Pecho", extra_price: 0, extra_cost: 0, sort_order: 1 },
  { id: "z2", key: "back_full", label: "Espalda completa", extra_price: 1500, extra_cost: 400, sort_order: 2 },
  { id: "z3", key: "sleeve_left", label: "Manga izquierda", extra_price: 800, extra_cost: 200, sort_order: 3 },
  { id: "z4", key: "sleeve_right", label: "Manga derecha", extra_price: 800, extra_cost: 200, sort_order: 4 },
];

export const DEMO_SETTINGS: SiteSettings = {
  id: 1,
  logo_text: "Sublime",
  logo_url: null,
  favicon_emoji: "👕",

  color_accent: "#c85a3a",
  color_lime: "#d8f24a",

  hero_badge: "Estampado DTF a medida",
  hero_title_line1: "Tu diseño,",
  hero_title_line2: "en tu prenda.",
  hero_subtitle:
    "Subí tu imagen, elegí la prenda y dónde va el estampado. Nosotros nos encargamos de imprimirlo y hacerlo realidad.",
  hero_cta_label: "Crear mi diseño",
  hero_image_url: "https://images.unsplash.com/photo-1780566035913-9233ca20dc29?w=1200&q=80",

  marquee_text: "REMERAS · BUZOS · CHOMBAS · DTF",

  step1_title: "Elegí la prenda",
  step1_text: "Remera, buzo o chomba. Talle y color a tu gusto.",
  step2_title: "Subí tu imagen",
  step2_text: "Marcá en qué parte de la prenda querés el estampado.",
  step3_title: "Lo imprimimos",
  step3_text: "Recibimos tu pedido y lo mandamos directo a producción.",

  footer_headline_line1: "Hagamos algo",
  footer_headline_line2: "estampado.",
  footer_tagline: "Remeras · Buzos · Chombas, prenda por prenda.",

  contact_email: null,
  contact_phone: null,
  contact_instagram: null,

  seo_title: "Sublime — Estampado DTF a medida",
  seo_description:
    "Remeras, buzos y chombas estampadas con tu diseño. Subí tu imagen, elegí el estampado y lo mandamos a imprimir.",

  nav_catalog_label: "Catálogo",
  nav_process_label: "Cómo estampamos",

  process_title: "Cómo estampamos",
  process_subtitle: "Del archivo a la prenda terminada, así es el proceso DTF que usamos en cada pedido.",
  process_step1_title: "Preparamos el archivo",
  process_step1_text: "Ajustamos tu imagen a la resolución y el tamaño que pediste para que el estampado salga nítido.",
  process_step2_title: "Imprimimos en film DTF",
  process_step2_text: "El diseño se imprime en una película especial con tintas resistentes al lavado.",
  process_step3_title: "Aplicamos con calor",
  process_step3_text: "Con una prensa térmica, transferimos el diseño a la prenda a alta temperatura y presión.",
  process_step4_title: "Control y envío",
  process_step4_text: "Revisamos cada prenda antes de mandarla, para que llegue perfecta.",
  care_title: "Cuidados de la prenda estampada",
  care_text: "Lavá del revés con agua fría, no uses lavandina y evitá planchar directo sobre el estampado. Así te dura mucho más.",

  pedido_badge: "Pedido personalizado",
  pedido_title: "Armemos tu prenda",
  pedido_subtitle: "En unos pasos elegís la prenda, subís tu imagen y nos llega listo para producción.",

  confirmation_title: "¡Pedido recibido!",
  confirmation_message: "Te vamos a contactar para confirmar los detalles y coordinar el pago.",

  footer_copyright_suffix: "DTF Studio",
};
