"use client";

import { useState } from "react";
import { useEditMode } from "@/contexts/EditModeContext";
import type { SiteSettings } from "@/lib/types";

export function EditableColor({
  field,
  value,
  label,
}: {
  field: keyof SiteSettings;
  value: string;
  label: string;
}) {
  const editing = useEditMode();
  const [current, setCurrent] = useState(value);
  if (!editing) return null;

  async function save(next: string) {
    setCurrent(next);
    // Reflejo instantáneo: el color se inyecta como CSS variable en <body>
    // (ver layout.tsx), así que actualizarla ahí se ve en toda la página
    // al instante, sin esperar el guardado ni recargar.
    const cssVar = field === "color_lime" ? "--lime" : field === "color_accent" ? "--accent" : null;
    if (cssVar) document.body.style.setProperty(cssVar, next);

    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: next }),
    });
  }

  return (
    <label
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-accent/50 bg-paper/90 px-2 py-1 text-[10px] text-ink"
      title={`Editar: ${label}`}
    >
      <span
        className="h-3.5 w-3.5 rounded-full border border-ink/20"
        style={{ backgroundColor: current }}
      />
      {label}
      <input
        type="color"
        value={current}
        onChange={(e) => save(e.target.value)}
        className="h-0 w-0 opacity-0"
      />
    </label>
  );
}
