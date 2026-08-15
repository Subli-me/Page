import type { PrintZone, Product, ProductColor, ProductSize } from "@/lib/types";

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
