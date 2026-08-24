"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { PrintZone, Product, ProductMockup } from "@/lib/types";
import { ImageUploader, type UploadedImage } from "@/components/order/ImageUploader";
import { MockupOverlayEditor } from "./MockupOverlayEditor";

export function MockupsAdmin({
  products,
  zones,
  initialMockups,
}: {
  products: Product[];
  zones: PrintZone[];
  initialMockups: ProductMockup[];
}) {
  const [mockups, setMockups] = useState(initialMockups);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [zoneKey, setZoneKey] = useState(zones[0]?.key ?? "");

  const current = mockups.find((m) => m.product_id === productId && m.print_zone_key === zoneKey) ?? null;

  async function handleUpload(img: UploadedImage | null) {
    if (!img) return;
    const res = await fetch("/api/admin/mockups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        printZoneKey: zoneKey,
        imageUrl: img.url,
        imagePublicId: img.publicId,
      }),
    });
    const json = await res.json();
    if (json.mockup) {
      setMockups((prev) => [...prev.filter((m) => m.id !== json.mockup.id), json.mockup]);
    }
  }

  async function handleOverlayCommit(box: { x: number; y: number; w: number; h: number }) {
    if (!current) return;
    setMockups((prev) =>
      prev.map((m) =>
        m.id === current.id
          ? { ...m, overlay_x: box.x, overlay_y: box.y, overlay_w: box.w, overlay_h: box.h }
          : m
      )
    );
    await fetch(`/api/admin/mockups/${current.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        overlay_x: box.x,
        overlay_y: box.y,
        overlay_w: box.w,
        overlay_h: box.h,
      }),
    });
  }

  async function handleRemove() {
    if (!current) return;
    setMockups((prev) => prev.filter((m) => m.id !== current.id));
    await fetch(`/api/admin/mockups/${current.id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="input w-auto"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={zoneKey}
          onChange={(e) => setZoneKey(e.target.value)}
          className="input w-auto"
        >
          {zones.map((z) => (
            <option key={z.key} value={z.key}>{z.label}</option>
          ))}
        </select>
      </div>

      <div className="max-w-md rounded-2xl border border-line bg-panel p-6">
        {current ? (
          <div>
            <MockupOverlayEditor
              imageUrl={current.image_url}
              overlay={{
                x: current.overlay_x,
                y: current.overlay_y,
                w: current.overlay_w,
                h: current.overlay_h,
              }}
              onCommit={handleOverlayCommit}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-accent"
            >
              <Trash2 size={14} /> Borrar este mockup y subir otra foto
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-ink-soft">
              Todavía no hay foto para esta combinación de prenda y zona. Subí una
              foto real de la prenda (frente, espalda, manga — según corresponda)
              y después vas a poder marcar dónde va el diseño.
            </p>
            <ImageUploader signatureEndpoint="/api/admin/upload-signature" value={null} onChange={handleUpload} />
          </div>
        )}
      </div>
    </div>
  );
}
