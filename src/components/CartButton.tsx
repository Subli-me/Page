"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { countDraftLines, subscribeDraft } from "@/lib/order-draft";

/**
 * Acceso al pedido a medio armar desde cualquier página.
 *
 * El carrito vive en el navegador, así que el conteo recién se puede leer una
 * vez montado: si lo pintáramos en el servidor no coincidiría con el cliente.
 * Por eso arranca oculto y aparece solo cuando hay algo, sin ocupar lugar ni
 * parpadear para quien todavía no empezó un pedido.
 */
export function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(countDraftLines());
    refresh();
    return subscribeDraft(refresh);
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/pedido?ver=pedido"
      title={`Ver mi pedido (${count} prenda${count !== 1 ? "s" : ""})`}
      className="relative inline-flex items-center gap-2 rounded-full border border-paper/25 px-4 py-2.5 text-sm text-paper transition-colors hover:border-paper/60"
    >
      <ShoppingBag size={16} />
      <span className="hidden sm:inline">Mi pedido</span>
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1.5 text-xs font-medium tabular-nums text-dark">
        {count}
      </span>
    </Link>
  );
}
