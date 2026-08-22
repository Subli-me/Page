"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Shirt,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import type { PrintZone, Product, ProductColor, ProductSize, ProductMockup } from "@/lib/types";
import { EditableNumber } from "./EditableNumber";
import { ImageUploader } from "@/components/order/ImageUploader";
import { MediaDisplay } from "@/components/MediaDisplay";
import { MockupZoneEditor } from "./MockupZoneEditor";
import { GarmentPreview, fabricColor } from "@/components/GarmentPreview";

export function ProductsAdmin({
  initialProducts,
  initialZones,
  initialSizes,
  initialColors,
  initialMockups,
}: {
  initialProducts: Product[];
  initialZones: PrintZone[];
  initialSizes: ProductSize[];
  initialColors: ProductColor[];
  initialMockups: ProductMockup[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [zones, setZones] = useState(initialZones);
  const [sizes, setSizes] = useState(initialSizes);
  const [colors, setColors] = useState(initialColors);
  const [mockups, setMockups] = useState(initialMockups);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingMockup, setEditingMockup] = useState<{ productId: string; zoneKey: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null);
  const [brokenProductIds, setBrokenProductIds] = useState<string[]>([]);
  const [brokenMockupIds, setBrokenMockupIds] = useState<string[]>([]);

  // Revisa que las fotos de prendas y mockups sigan existiendo en Cloudinary.
  // Vale la pena correrlo cada tanto: el navegador cachea, así que una foto
  // caída se sigue viendo bien para quien ya la cargó y solo se rompe para los
  // clientes nuevos.
  async function verifyMedia() {
    setVerifying(true);
    setVerifyMsg(null);
    try {
      const res = await fetch("/api/admin/products/verify", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falló la verificación");

      const bp = json.brokenProducts.map((p: { id: string }) => p.id);
      const bm = json.brokenMockups.map((m: { id: string }) => m.id);
      setBrokenProductIds(bp);
      setBrokenMockupIds(bm);

      const partes = [];
      if (bp.length) partes.push(`${bp.length} foto${bp.length > 1 ? "s" : ""} de prenda`);
      if (bm.length) partes.push(`${bm.length} mockup${bm.length > 1 ? "s" : ""}`);
      setVerifyMsg(
        partes.length === 0
          ? `Todo en orden: ${json.totalProducts} prendas y ${json.totalMockups} mockups disponibles.`
          : `Falta el archivo de ${partes.join(" y ")}. Hay que volver a subirlos.`
      );
    } catch (e) {
      setVerifyMsg(e instanceof Error ? e.message : "Falló la verificación");
    } finally {
      setVerifying(false);
    }
  }

  const [newProduct, setNewProduct] = useState({ name: "", price: "0", cost: "0" });
  const [newZone, setNewZone] = useState({ label: "", extraPrice: "0", extraCost: "0" });

  async function saveProduct(
    id: string,
    field: "base_price" | "base_cost" | "image_url" | "name" | "description",
    value: string | number | null
  ) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function toggleActive(id: string, active: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  }

  async function moveProduct(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const [moved] = newProducts.splice(index, 1);
    newProducts.splice(targetIndex, 0, moved);

    const updatedWithOrder = newProducts.map((p, idx) => ({ ...p, sort_order: idx + 1 }));
    setProducts(updatedWithOrder);

    await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: updatedWithOrder.map((p) => ({ id: p.id, sort_order: p.sort_order })),
      }),
    });
  }

  async function addProduct() {
    if (!newProduct.name.trim()) return;
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newProduct.name.trim(),
        basePrice: Number(newProduct.price) || 0,
        baseCost: Number(newProduct.cost) || 0,
      }),
    });
    const json = await res.json();
    if (json.product) {
      const nextSortOrder = products.length + 1;
      const prod = { ...json.product, sort_order: nextSortOrder };
      setProducts((prev) => [...prev, prod]);
      setNewProduct({ name: "", price: "0", cost: "0" });
    }
  }

  async function removeProduct(id: string) {
    if (!confirm("¿Borrar esta prenda? También se van a borrar sus talles y colores.")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  }

  async function saveZone(id: string, field: "extra_price" | "extra_cost" | "label", value: number | string) {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, [field]: value } : z)));
    await fetch(`/api/admin/zones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function addZone() {
    if (!newZone.label.trim()) return;
    const res = await fetch("/api/admin/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newZone.label.trim(),
        extraPrice: Number(newZone.extraPrice) || 0,
        extraCost: Number(newZone.extraCost) || 0,
      }),
    });
    const json = await res.json();
    if (json.zone) {
      setZones((prev) => [...prev, json.zone]);
      setNewZone({ label: "", extraPrice: "0", extraCost: "0" });
    }
  }

  async function removeZone(id: string) {
    if (!confirm("¿Borrar esta zona de estampado?")) return;
    setZones((prev) => prev.filter((z) => z.id !== id));
    await fetch(`/api/admin/zones/${id}`, { method: "DELETE" });
  }

  async function addSize(productId: string, size: string) {
    if (!size.trim()) return;
    const res = await fetch("/api/admin/sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size: size.trim(), priceDelta: 0 }),
    });
    const json = await res.json();
    if (json.size) setSizes((prev) => [...prev, json.size]);
  }

  async function removeSize(id: string) {
    setSizes((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/admin/sizes/${id}`, { method: "DELETE" });
  }

  async function saveSizeMeasurement(id: string, field: "chest_cm" | "length_cm", value: number | null) {
    setSizes((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    await fetch(`/api/admin/sizes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function moveSize(productId: string, sizeIndex: number, direction: "up" | "down") {
    const productSizes = sizes.filter((s) => s.product_id === productId);
    const targetIndex = direction === "up" ? sizeIndex - 1 : sizeIndex + 1;
    if (targetIndex < 0 || targetIndex >= productSizes.length) return;

    const newSizes = [...productSizes];
    const [moved] = newSizes.splice(sizeIndex, 1);
    newSizes.splice(targetIndex, 0, moved);

    const updatedWithOrder = newSizes.map((s, idx) => ({ ...s, sort_order: idx }));
    setSizes((prev) => [
      ...prev.filter((s) => s.product_id !== productId),
      ...updatedWithOrder,
    ]);

    await fetch("/api/admin/sizes/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: updatedWithOrder.map((s) => ({ id: s.id, sort_order: s.sort_order })),
      }),
    });
  }

  async function addColor(productId: string, name: string, hex: string) {
    if (!name.trim()) return;
    const res = await fetch("/api/admin/colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, name: name.trim(), hex }),
    });
    const json = await res.json();
    if (json.color) setColors((prev) => [...prev, json.color]);
  }

  async function removeColor(id: string) {
    setColors((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/admin/colors/${id}`, { method: "DELETE" });
  }

  async function saveColor(id: string, field: "name" | "hex", value: string) {
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    await fetch(`/api/admin/colors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function saveMockup(productId: string, mockupData: Omit<ProductMockup, "id" | "product_id">) {
    const existing = mockups.find((m) => m.product_id === productId && m.print_zone_key === mockupData.print_zone_key);

    if (existing) {
      const updated = { ...existing, ...mockupData };
      setMockups((prev) => prev.map((m) => (m.id === existing.id ? updated : m)));
      await fetch(`/api/admin/mockups/${existing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockupData),
      });
    } else {
      const res = await fetch(`/api/admin/mockups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...mockupData }),
      });
      const json = await res.json();
      if (json.mockup) setMockups((prev) => [...prev, json.mockup]);
    }
  }

  async function removeMockup(id: string) {
    setMockups((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/admin/mockups/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl">Prendas</h2>
          <button
            type="button"
            onClick={verifyMedia}
            disabled={verifying}
            title="Revisa que las fotos de las prendas y los mockups sigan existiendo"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:border-ink hover:bg-panel transition-colors disabled:opacity-50"
          >
            {verifying ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {verifying ? "Verificando..." : "Verificar fotos"}
          </button>
        </div>

        {verifyMsg && (
          <div
            className={clsx(
              "mb-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs",
              brokenProductIds.length || brokenMockupIds.length
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-line bg-panel text-ink-soft"
            )}
          >
            {brokenProductIds.length || brokenMockupIds.length ? (
              <AlertTriangle size={14} className="shrink-0" />
            ) : (
              <Check size={14} className="shrink-0" />
            )}
            <span>{verifyMsg}</span>
          </div>
        )}
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-left text-ink-soft">
                <th className="px-4 py-3 font-medium text-center w-24">Orden</th>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Precio venta</th>
                <th className="px-4 py-3 font-medium">Costo</th>
                <th className="px-4 py-3 font-medium">Margen</th>
                <th className="px-4 py-3 font-medium">Activo</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <ProductRow
                  key={p.id}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === products.length - 1}
                  onMoveUp={() => moveProduct(index, "up")}
                  onMoveDown={() => moveProduct(index, "down")}
                  product={p}
                  sizes={sizes.filter((s) => s.product_id === p.id)}
                  colors={colors.filter((c) => c.product_id === p.id)}
                  mockups={mockups.filter((m) => m.product_id === p.id)}
                  zones={zones}
                  imageBroken={brokenProductIds.includes(p.id)}
                  brokenMockupIds={brokenMockupIds}
                  expanded={expanded === p.id}
                  onToggleExpand={() => setExpanded((e) => (e === p.id ? null : p.id))}
                  onSaveField={saveProduct}
                  onToggleActive={toggleActive}
                  onRemove={removeProduct}
                  onAddSize={addSize}
                  onRemoveSize={removeSize}
                  onSaveSizeMeasurement={saveSizeMeasurement}
                  onMoveSize={moveSize}
                  onAddColor={addColor}
                  onRemoveColor={removeColor}
                  onSaveColor={saveColor}
                  onSaveMockup={saveMockup}
                  onRemoveMockup={removeMockup}
                  editingMockup={editingMockup}
                  onEditMockup={setEditingMockup}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-line p-4">
          <label className="text-sm">
            <span className="mb-1 block text-ink-soft">Nombre</span>
            <input className="input w-48" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ej: Campera" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-ink-soft">Precio</span>
            <input type="number" className="input w-28" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-ink-soft">Costo</span>
            <input type="number" className="input w-28" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} />
          </label>
          <button type="button" onClick={addProduct} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm text-paper hover:bg-accent">
            <Plus size={14} /> Agregar prenda
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl">Zonas de estampado</h2>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-left text-ink-soft">
                <th className="px-4 py-3 font-medium">Zona</th>
                <th className="px-4 py-3 font-medium">Extra venta</th>
                <th className="px-4 py-3 font-medium">Extra costo</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <input
                      className="input"
                      defaultValue={z.label}
                      onBlur={(e) => e.target.value !== z.label && saveZone(z.id, "label", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableNumber value={z.extra_price} onSave={(v) => saveZone(z.id, "extra_price", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <EditableNumber value={z.extra_cost} onSave={(v) => saveZone(z.id, "extra_cost", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => removeZone(z.id)} className="rounded-full p-1.5 text-ink-soft hover:bg-accent-soft hover:text-accent">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-line p-4">
          <label className="text-sm">
            <span className="mb-1 block text-ink-soft">Nombre de la zona</span>
            <input className="input w-48" value={newZone.label} onChange={(e) => setNewZone({ ...newZone, label: e.target.value })} placeholder="Ej: Bolsillo" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-ink-soft">Extra venta</span>
            <input type="number" className="input w-28" value={newZone.extraPrice} onChange={(e) => setNewZone({ ...newZone, extraPrice: e.target.value })} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-ink-soft">Extra costo</span>
            <input type="number" className="input w-28" value={newZone.extraCost} onChange={(e) => setNewZone({ ...newZone, extraCost: e.target.value })} />
          </label>
          <button type="button" onClick={addZone} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm text-paper hover:bg-accent">
            <Plus size={14} /> Agregar zona
          </button>
        </div>
      </section>
    </div>
  );
}

function ProductRow({
  product,
  sizes,
  colors,
  mockups,
  zones,
  imageBroken,
  brokenMockupIds,
  expanded,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggleExpand,
  onSaveField,
  onToggleActive,
  onRemove,
  onAddSize,
  onRemoveSize,
  onSaveSizeMeasurement,
  onMoveSize,
  onAddColor,
  onRemoveColor,
  onSaveColor,
  onSaveMockup,
  onRemoveMockup,
  editingMockup,
  onEditMockup,
}: {
  product: Product;
  sizes: ProductSize[];
  colors: ProductColor[];
  mockups: ProductMockup[];
  zones: PrintZone[];
  imageBroken: boolean;
  brokenMockupIds: string[];
  expanded: boolean;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleExpand: () => void;
  onSaveField: (
    id: string,
    field: "base_price" | "base_cost" | "image_url" | "name" | "description",
    value: string | number | null
  ) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onRemove: (id: string) => void;
  onAddSize: (productId: string, size: string) => void;
  onRemoveSize: (id: string) => void;
  onSaveSizeMeasurement: (id: string, field: "chest_cm" | "length_cm", value: number | null) => void;
  onMoveSize: (productId: string, sizeIndex: number, direction: "up" | "down") => void;
  onAddColor: (productId: string, name: string, hex: string) => void;
  onRemoveColor: (id: string) => void;
  onSaveColor: (id: string, field: "name" | "hex", value: string) => void;
  onSaveMockup: (productId: string, mockupData: Omit<ProductMockup, "id" | "product_id">) => void;
  onRemoveMockup: (id: string) => void;
  editingMockup: { productId: string; zoneKey: string } | null;
  onEditMockup: (mockup: { productId: string; zoneKey: string } | null) => void;
}) {
  const [newSize, setNewSize] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#16150f");

  // Para las muestras de color usamos el mockup de la primera zona que tenga
  // foto cargada — normalmente el frente de la prenda.
  const previewMockup =
    zones.map((z) => mockups.find((m) => m.print_zone_key === z.key)).find(Boolean) ?? null;

  return (
    <>
      <tr className="border-b border-line last:border-0">
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              title="Mover arriba"
              className={clsx(
                "rounded p-1 text-ink-soft transition-colors",
                isFirst ? "opacity-20 cursor-not-allowed" : "hover:bg-accent-soft hover:text-accent"
              )}
            >
              <ChevronUp size={16} />
            </button>
            <span className="w-5 text-center text-xs font-mono text-ink-soft">
              {index + 1}
            </span>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              title="Mover abajo"
              className={clsx(
                "rounded p-1 text-ink-soft transition-colors",
                isLast ? "opacity-20 cursor-not-allowed" : "hover:bg-accent-soft hover:text-accent"
              )}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </td>
        <td className="px-4 py-3 font-medium">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleExpand}
              className={clsx(
                "relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border bg-accent-soft hover:opacity-80 transition-opacity",
                imageBroken ? "border-accent" : "border-line"
              )}
              title={imageBroken ? "Falta el archivo de esta foto" : "Cambiar foto/video / detalles"}
            >
              {product.image_url ? (
                <MediaDisplay src={product.image_url} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-soft">
                  <Shirt size={18} />
                </div>
              )}
              {imageBroken && (
                <span className="absolute inset-0 flex items-center justify-center bg-dark/70 text-lime">
                  <AlertTriangle size={14} />
                </span>
              )}
            </button>
            <button type="button" onClick={onToggleExpand} className="inline-flex items-center gap-1.5 hover:text-accent text-left">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{product.name}</span>
              {imageBroken && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                  falta la foto
                </span>
              )}
            </button>
          </div>
        </td>
        <td className="px-4 py-3">
          <EditableNumber value={product.base_price} onSave={(v) => onSaveField(product.id, "base_price", v)} />
        </td>
        <td className="px-4 py-3">
          <EditableNumber value={product.base_cost} onSave={(v) => onSaveField(product.id, "base_cost", v)} />
        </td>
        <td className="px-4 py-3 text-ink-soft">
          ${(product.base_price - product.base_cost).toLocaleString("es-AR")}
        </td>
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={product.active}
            onChange={(e) => onToggleActive(product.id, e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </td>
        <td className="px-4 py-3">
          <button type="button" onClick={() => onRemove(product.id)} className="rounded-full p-1.5 text-ink-soft hover:bg-accent-soft hover:text-accent">
            <Trash2 size={14} />
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-line bg-paper/60 last:border-0">
          <td colSpan={7} className="px-4 py-6">
            <div className="space-y-6">
              {/* Foto de la prenda y detalles principales */}
              <div className="grid gap-6 sm:grid-cols-[220px_1fr] items-start rounded-xl border border-line bg-panel p-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Foto / Video de portada
                  </p>
                  <div className="w-full">
                    <ImageUploader
                      value={product.image_url ? { url: product.image_url, publicId: "" } : null}
                      onChange={(img) => onSaveField(product.id, "image_url", img?.url ?? null)}
                      label="Arrastrá o elegí foto/video"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
                      Nombre de la prenda
                    </label>
                    <input
                      className="input w-full max-w-md"
                      defaultValue={product.name}
                      onBlur={(e) => e.target.value !== product.name && onSaveField(product.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1">
                      Descripción (opcional)
                    </label>
                    <input
                      className="input w-full max-w-md"
                      defaultValue={product.description ?? ""}
                      placeholder="Ej: Algodón 24/1 corte oversize..."
                      onBlur={(e) => e.target.value !== (product.description ?? "") && onSaveField(product.id, "description", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Talles y Colores */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-soft">Talles</p>
                  <p className="mb-2 text-[11px] text-ink-soft">
                    Pecho y largo en cm — se muestran en la sección pública de Talles.
                  </p>
                  <div className="space-y-1.5">
                    {sizes.map((s, sizeIndex) => (
                      <div key={s.id} className="flex items-center gap-2 rounded-lg border border-line bg-panel px-2 py-1.5 text-xs">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => onMoveSize(product.id, sizeIndex, "up")}
                            disabled={sizeIndex === 0}
                            className={clsx(
                              "rounded p-0.5 text-ink-soft transition-colors",
                              sizeIndex === 0 ? "opacity-20 cursor-not-allowed" : "hover:bg-accent-soft hover:text-accent"
                            )}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveSize(product.id, sizeIndex, "down")}
                            disabled={sizeIndex === sizes.length - 1}
                            className={clsx(
                              "rounded p-0.5 text-ink-soft transition-colors",
                              sizeIndex === sizes.length - 1 ? "opacity-20 cursor-not-allowed" : "hover:bg-accent-soft hover:text-accent"
                            )}
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <span className="w-8 shrink-0 font-medium">{s.size}</span>
                        <label className="flex items-center gap-1 text-ink-soft">
                          Pecho
                          <input
                            type="number"
                            className="input h-7 w-16 px-2 text-xs"
                            defaultValue={s.chest_cm ?? ""}
                            placeholder="cm"
                            onBlur={(e) => {
                              const v = e.target.value === "" ? null : Number(e.target.value);
                              if (v !== s.chest_cm) onSaveSizeMeasurement(s.id, "chest_cm", v);
                            }}
                          />
                        </label>
                        <label className="flex items-center gap-1 text-ink-soft">
                          Largo
                          <input
                            type="number"
                            className="input h-7 w-16 px-2 text-xs"
                            defaultValue={s.length_cm ?? ""}
                            placeholder="cm"
                            onBlur={(e) => {
                              const v = e.target.value === "" ? null : Number(e.target.value);
                              if (v !== s.length_cm) onSaveSizeMeasurement(s.id, "length_cm", v);
                            }}
                          />
                        </label>
                        <button type="button" onClick={() => onRemoveSize(s.id)} className="ml-auto text-ink-soft hover:text-accent">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      className="input h-8 w-24 text-xs"
                      placeholder="Ej: XXL"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => { onAddSize(product.id, newSize); setNewSize(""); }}
                      className="rounded-full bg-ink px-3 py-1 text-xs text-paper hover:bg-accent"
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-soft">Colores</p>
                  <p className="mb-2 text-[11px] text-ink-soft">
                    {previewMockup
                      ? "Así ve el cliente cada color. Tocá el círculo para ajustarlo."
                      : "Cargá un mockup abajo para ver cada color sobre la prenda."}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {colors.map((c) => (
                      <div
                        key={c.id}
                        className="group/color relative w-20 rounded-lg border border-line bg-panel p-1.5"
                      >
                        <div className="relative overflow-hidden rounded bg-accent-soft/40">
                          {previewMockup ? (
                            <GarmentPreview
                              imageUrl={previewMockup.image_url}
                              colorHex={c.hex}
                              imageClassName="w-full"
                              alt={`${product.name} en ${c.name}`}
                            />
                          ) : (
                            <div
                              className="aspect-square w-full"
                              style={{ backgroundColor: fabricColor(c.hex) }}
                            />
                          )}
                        </div>

                        <div className="mt-1.5 flex items-center gap-1">
                          <input
                            type="color"
                            value={c.hex}
                            onChange={(e) => onSaveColor(c.id, "hex", e.target.value)}
                            title={`${c.name} — ${c.hex}`}
                            className="h-5 w-5 shrink-0 cursor-pointer rounded-full border border-line bg-transparent p-0"
                          />
                          <input
                            className="min-w-0 flex-1 bg-transparent text-[11px] outline-none focus:underline"
                            defaultValue={c.name}
                            onBlur={(e) =>
                              e.target.value.trim() &&
                              e.target.value !== c.name &&
                              onSaveColor(c.id, "name", e.target.value.trim())
                            }
                          />
                          <button
                            type="button"
                            onClick={() => onRemoveColor(c.id)}
                            className="shrink-0 text-ink-soft opacity-0 transition-opacity hover:text-accent group-hover/color:opacity-100"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="input h-8 w-28 text-xs"
                      placeholder="Ej: Bordo"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-line bg-transparent p-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => { onAddColor(product.id, newColorName, newColorHex); setNewColorName(""); }}
                      className="rounded-full bg-ink px-3 py-1 text-xs text-paper hover:bg-accent"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Mockups por zona */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Mockups por Zona</p>
                <div className="space-y-2">
                  {zones.map((zone) => {
                    const mockup = mockups.find((m) => m.print_zone_key === zone.key);
                    return (
                      <div key={zone.id} className="flex items-center justify-between rounded-lg border border-line bg-panel px-3 py-2">
                        <span className="text-xs font-medium">
                          {zone.label}
                          {mockup &&
                            (brokenMockupIds.includes(mockup.id) ? (
                              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                                <AlertTriangle size={10} /> falta el archivo
                              </span>
                            ) : (
                              <span className="ml-2 text-[10px] text-ink-soft">foto cargada</span>
                            ))}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEditMockup({ productId: product.id, zoneKey: zone.key })}
                            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs text-paper hover:bg-accent"
                          >
                            <Edit2 size={12} />
                            {mockup ? "Editar" : "Agregar"}
                          </button>
                          {mockup && (
                            <button
                              type="button"
                              onClick={() => onRemoveMockup(mockup.id)}
                              className="text-ink-soft hover:text-accent"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Modal para editar mockup */}
      {editingMockup?.productId === product.id && (
        <MockupZoneEditor
          mockup={mockups.find((m) => m.print_zone_key === editingMockup.zoneKey) ?? null}
          imageUrl={mockups.find((m) => m.print_zone_key === editingMockup.zoneKey)?.image_url ?? null}
          onSave={(data) => {
            onSaveMockup(product.id, {
              ...data,
              print_zone_key: editingMockup.zoneKey,
            });
            onEditMockup(null);
          }}
          onClose={() => onEditMockup(null)}
        />
      )}
    </>
  );
}
