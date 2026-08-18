"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { PrintZone, Product, ProductColor, ProductSize } from "@/lib/types";
import { EditableNumber } from "./EditableNumber";

export function ProductsAdmin({
  initialProducts,
  initialZones,
  initialSizes,
  initialColors,
}: {
  initialProducts: Product[];
  initialZones: PrintZone[];
  initialSizes: ProductSize[];
  initialColors: ProductColor[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [zones, setZones] = useState(initialZones);
  const [sizes, setSizes] = useState(initialSizes);
  const [colors, setColors] = useState(initialColors);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({ name: "", price: "0", cost: "0" });
  const [newZone, setNewZone] = useState({ label: "", extraPrice: "0", extraCost: "0" });

  async function saveProduct(id: string, field: "base_price" | "base_cost", value: number) {
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

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-display text-xl">Prendas</h2>
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
                  expanded={expanded === p.id}
                  onToggleExpand={() => setExpanded((e) => (e === p.id ? null : p.id))}
                  onSaveField={saveProduct}
                  onToggleActive={toggleActive}
                  onRemove={removeProduct}
                  onAddSize={addSize}
                  onRemoveSize={removeSize}
                  onAddColor={addColor}
                  onRemoveColor={removeColor}
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
  onAddColor,
  onRemoveColor,
}: {
  product: Product;
  sizes: ProductSize[];
  colors: ProductColor[];
  expanded: boolean;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleExpand: () => void;
  onSaveField: (id: string, field: "base_price" | "base_cost", value: number) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onRemove: (id: string) => void;
  onAddSize: (productId: string, size: string) => void;
  onRemoveSize: (id: string) => void;
  onAddColor: (productId: string, name: string, hex: string) => void;
  onRemoveColor: (id: string) => void;
}) {
  const [newSize, setNewSize] = useState("");
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#16150f");

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
          <button type="button" onClick={onToggleExpand} className="inline-flex items-center gap-1.5 hover:text-accent">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {product.name}
          </button>
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
          <td colSpan={7} className="px-4 py-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Talles</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-xs">
                      {s.size}
                      <button type="button" onClick={() => onRemoveSize(s.id)} className="text-ink-soft hover:text-accent">
                        <Trash2 size={11} />
                      </button>
                    </span>
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
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Colores</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-xs">
                      <span className="h-3 w-3 rounded-full border border-line" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      <button type="button" onClick={() => onRemoveColor(c.id)} className="text-ink-soft hover:text-accent">
                        <Trash2 size={11} />
                      </button>
                    </span>
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
          </td>
        </tr>
      )}
    </>
  );
}
