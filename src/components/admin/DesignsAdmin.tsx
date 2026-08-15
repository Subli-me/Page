"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import clsx from "clsx";
import type { DesignCatalogItem } from "@/lib/types";
import { ImageUploader, type UploadedImage } from "@/components/order/ImageUploader";

export function DesignsAdmin({ initial }: { initial: DesignCatalogItem[] }) {
  const [designs, setDesigns] = useState(initial);
  const [pendingImage, setPendingImage] = useState<UploadedImage | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function addDesign() {
    if (!pendingImage || !name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        imageUrl: pendingImage.url,
        imagePublicId: pendingImage.publicId,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.design) {
      setDesigns((prev) => [...prev, json.design]);
      setPendingImage(null);
      setName("");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    setDesigns((prev) => prev.map((d) => (d.id === id ? { ...d, active } : d)));
    await fetch(`/api/admin/designs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  }

  async function removeDesign(id: string) {
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    await fetch(`/api/admin/designs/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-line bg-panel p-6">
        <h2 className="mb-4 font-display text-xl italic">Agregar diseño</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-3 block text-sm font-medium">
              Nombre
              <input
                className="input mt-1.5"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Calavera rosa"
              />
            </label>
            <button
              type="button"
              disabled={!pendingImage || !name.trim() || saving}
              onClick={addDesign}
              className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm text-paper transition-colors hover:bg-accent disabled:opacity-30"
            >
              {saving ? "Guardando..." : "Agregar al catálogo"}
            </button>
          </div>
          <ImageUploader value={pendingImage} onChange={setPendingImage} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl italic">
          Catálogo ({designs.length})
        </h2>
        {designs.length === 0 ? (
          <p className="text-ink-soft">Todavía no subiste ningún diseño.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {designs.map((d) => (
              <div key={d.id} className="rounded-xl border border-line bg-panel p-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-accent-soft">
                  <Image src={d.image_url} alt={d.name} fill className="object-contain" />
                </div>
                <p className="mt-2 truncate text-xs font-medium">{d.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <input
                      type="checkbox"
                      checked={d.active}
                      onChange={(e) => toggleActive(d.id, e.target.checked)}
                      className="h-3.5 w-3.5 accent-accent"
                    />
                    Activo
                  </label>
                  <button
                    type="button"
                    onClick={() => removeDesign(d.id)}
                    className={clsx("rounded-full p-1 text-ink-soft hover:bg-accent-soft hover:text-accent")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
