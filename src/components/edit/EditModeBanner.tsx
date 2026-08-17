"use client";

import Link from "next/link";
import { Pencil, X } from "lucide-react";

export function EditModeBanner() {
  return (
    <div className="fixed inset-x-0 bottom-4 z-100 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full bg-dark px-5 py-3 text-sm text-paper shadow-xl">
        <Pencil size={14} className="text-lime" />
        <span>
          Modo edición — hacé click en cualquier texto, imagen o color de la página para cambiarlo.
        </span>
        <Link
          href="/admin"
          className="ml-2 inline-flex items-center gap-1 rounded-full bg-paper/10 px-3 py-1.5 text-xs hover:bg-paper/20"
        >
          <X size={12} /> Salir
        </Link>
      </div>
    </div>
  );
}
