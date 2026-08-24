"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { saveDraft } from "@/lib/order-draft";

type ItemParaRepetir = {
  print_zone_key: string;
  image_url: string;
  image_public_id: string;
  design_transform: { tx: number; ty: number; scale: number; rotation: number } | null;
};

type LineaParaRepetir = {
  id: string;
  product_id: string | null;
  size: string;
  color: string | null;
  quantity: number;
  order_items: ItemParaRepetir[];
};

/**
 * Vuelve a armar el pedido en el carrito, listo para confirmar.
 *
 * Un cliente que repite empezaba de cero: elegir prenda, talle, color, volver a
 * subir el diseño y reacomodarlo. Como el borrador guarda exactamente esa forma,
 * alcanza con escribirlo y mandarlo al armado.
 */
export function RepeatOrderButton({
  lines,
  contact,
}: {
  lines: LineaParaRepetir[];
  contact: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [yendo, setYendo] = useState(false);

  // Sin prenda no hay nada que repetir (puede pasar si la borraron del catálogo).
  const repetibles = lines.filter((l) => l.product_id);
  if (repetibles.length === 0) return null;

  function repetir() {
    setYendo(true);

    saveDraft({
      step: 3, // directo al carrito, con todo cargado
      productId: null,
      size: null,
      color: null,
      quantity: 1,
      prints: {},
      activeZone: null,
      contact: { ...contact, notes: "" },
      editingLineId: null,
      lines: repetibles.map((l) => ({
        id: `${l.id}-repetido`,
        productId: l.product_id as string,
        size: l.size,
        color: l.color,
        quantity: l.quantity,
        prints: Object.fromEntries(
          (l.order_items ?? []).map((i) => [
            i.print_zone_key,
            {
              image: { url: i.image_url, publicId: i.image_public_id },
              transform: i.design_transform,
            },
          ])
        ),
      })),
    });

    router.push("/pedido?ver=pedido");
  }

  return (
    <button
      type="button"
      onClick={repetir}
      disabled={yendo}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-60"
    >
      <RotateCcw size={15} />
      {yendo ? "Preparando..." : "Volver a pedir lo mismo"}
    </button>
  );
}
