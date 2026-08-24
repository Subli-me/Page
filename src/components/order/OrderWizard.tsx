"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  Check,
  ChevronDown,
  Copy,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  ShoppingBag,
  Plus,
  RotateCcw,
  Shirt,
  Trash2,
} from "lucide-react";
import { ORDER_WHATSAPP_NUMBERS, whatsappLink } from "@/lib/contact";
import { renderOrderPreview, uploadPreview } from "@/lib/order-preview";
import type {
  DesignCatalogItem,
  PrintZone,
  PrintZoneCombo,
  Product,
  ProductColor,
  ProductSize,
} from "@/lib/types";
import { buildOrderBreakdown, matchingCombos } from "@/lib/pricing";
import { clearDraft, loadDraft, saveDraft } from "@/lib/order-draft";
import { PriceBreakdown } from "./PriceBreakdown";
import { type UploadedImage } from "./ImageUploader";
import { DesignPicker } from "./DesignPicker";
import { PreviewStage } from "./PreviewStage";
import { type DesignTransform } from "./DesignAdjuster";
import { ZoneSelector } from "./ZoneSelector";
import { SizeGuideModal } from "./SizeGuideModal";
import { MediaDisplay } from "@/components/MediaDisplay";

const STEPS = ["Prenda", "Talle y color", "Diseño", "Tu pedido", "Tus datos"] as const;

type PrintEntry = { image: UploadedImage | null; transform: DesignTransform | null };

/** Una prenda ya agregada al pedido, con sus estampados. */
type CartLine = {
  id: string;
  productId: string;
  size: string;
  color: string | null;
  quantity: number;
  prints: Record<string, PrintEntry>;
};

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

export function OrderWizard({
  products,
  sizes,
  colors,
  printZones,
  zoneCombos,
  designs,
  confirmationTitle,
  confirmationMessage,
}: {
  products: Product[];
  sizes: ProductSize[];
  colors: ProductColor[];
  printZones: PrintZone[];
  zoneCombos: PrintZoneCombo[];
  designs: DesignCatalogItem[];
  confirmationTitle: string;
  confirmationMessage: string;
}) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("producto");

  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState<string | null>(
    products.find((p) => p.slug === preselected)?.id ?? null
  );
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [prints, setPrints] = useState<Record<string, PrintEntry>>({});
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [restored, setRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<CartLine[]>([]);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  const product = products.find((p) => p.id === productId) ?? null;
  const productSizes = sizes.filter((s) => s.product_id === productId);
  const productColors = colors.filter((c) => c.product_id === productId);
  const selectedColor = color ? productColors.find((c) => c.name === color) : null;
  const addedZoneKeys = Object.keys(prints);

  // Recargos que aplican por combinar zonas (ej: pecho + espalda). El servidor
  // recalcula el total con la misma función al guardar el pedido.
  const activeCombos = useMemo(
    () => matchingCombos(addedZoneKeys, zoneCombos),
    [addedZoneKeys, zoneCombos]
  );

  const breakdown = useMemo(
    () =>
      buildOrderBreakdown({
        productName: product?.name ?? "Prenda",
        basePrice: Number(product?.base_price ?? 0),
        size,
        sizeDelta: Number(productSizes.find((s) => s.size === size)?.price_delta ?? 0),
        zones: printZones,
        zoneKeys: addedZoneKeys,
        combos: zoneCombos,
        quantity,
      }),
    [product, productSizes, size, addedZoneKeys, printZones, zoneCombos, quantity]
  );

  const total = product ? breakdown.total : 0;

  /** Precio de una prenda ya agregada, con la misma cuenta que usa el servidor. */
  const lineBreakdown = (l: CartLine) =>
    buildOrderBreakdown({
      productName: products.find((p) => p.id === l.productId)?.name ?? "Prenda",
      basePrice: Number(products.find((p) => p.id === l.productId)?.base_price ?? 0),
      size: l.size,
      sizeDelta: Number(
        sizes.find((s) => s.product_id === l.productId && s.size === l.size)?.price_delta ?? 0
      ),
      zones: printZones,
      zoneKeys: Object.keys(l.prints),
      combos: zoneCombos,
      quantity: l.quantity,
    });

  const cartTotal = lines.reduce((sum, l) => sum + lineBreakdown(l).total, 0);
  const cartUnits = lines.reduce((sum, l) => sum + l.quantity, 0);

  /** Deja la configuración en blanco, conservando lo ya agregado al pedido. */
  function resetCurrent() {
    setProductId(null);
    setSize(null);
    setColor(null);
    setQuantity(1);
    setPrints({});
    setActiveZone(null);
    setEditingLineId(null);
  }

  /** Pasa la prenda que se está armando al pedido. */
  function addCurrentToCart() {
    if (!productId || !size) return;
    const line: CartLine = {
      id: editingLineId ?? newId(),
      productId,
      size,
      color,
      quantity,
      prints,
    };
    setLines((prev) =>
      editingLineId ? prev.map((l) => (l.id === editingLineId ? line : l)) : [...prev, line]
    );
    resetCurrent();
    setStep(3);
  }

  /** Vuelve a abrir una prenda del pedido para modificarla. */
  function editLine(id: string) {
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    setProductId(line.productId);
    setSize(line.size);
    setColor(line.color);
    setQuantity(line.quantity);
    setPrints(line.prints);
    setActiveZone(Object.keys(line.prints)[0] ?? null);
    setEditingLineId(id);
    setStep(0);
  }

  /**
   * Repetir una prenda cambiando solo el talle es el caso más común de un
   * pedido de equipo, y sin esto había que volver a subir y reacomodar todo.
   */
  function duplicateLine(id: string) {
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    setLines((prev) => [...prev, { ...line, id: newId() }]);
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function setLineQuantity(id: string, q: number) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity: Math.min(500, Math.max(1, q)) } : l))
    );
  }

  // Restaurar el pedido a medio armar. Solo una vez, al montar.
  useEffect(() => {
    const draft = loadDraft();
    if (draft && (draft.lines?.length || products.some((p) => p.id === draft.productId))) {
      setProductId(draft.productId);
      setSize(draft.size);
      setColor(draft.color);
      setQuantity(draft.quantity || 1);
      setPrints(draft.prints ?? {});
      setActiveZone(draft.activeZone);
      setContact(draft.contact);
      setLines(draft.lines ?? []);
      setEditingLineId(draft.editingLineId ?? null);
      // El boton del nav entra con ?ver=pedido; ahi va directo al carrito.
      setStep(searchParams.get("ver") === "pedido" && draft.lines?.length ? 3 : draft.step);
      setRestored(true);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar en cada cambio, salvo mientras se restaura o una vez enviado.
  useEffect(() => {
    if (!hydrated || status === "done") return;
    saveDraft({ step, productId, size, color, quantity, prints, activeZone, contact, lines, editingLineId });
  }, [hydrated, status, step, productId, size, color, quantity, prints, activeZone, contact]);

  function startOver() {
    clearDraft();
    resetCurrent();
    setLines([]);
    setContact({ name: "", email: "", phone: "", notes: "" });
    setStep(0);
    setRestored(false);
  }

  const allZonesHaveImage = addedZoneKeys.length > 0 && addedZoneKeys.every((k) => prints[k].image);

  const canNext = [
    !!productId,
    !!size && (productColors.length === 0 || !!color),
    allZonesHaveImage,
    lines.length > 0,
    contact.name.length > 1 && contact.email.includes("@"),
  ][step];

  // Un botón apagado sin explicación deja al cliente sin saber qué falta. Acá
  // decimos exactamente qué está esperando el sistema.
  const zonesMissingImage = addedZoneKeys.filter((k) => !prints[k].image);
  const missingLabel = zonesMissingImage
    .map((k) => printZones.find((z) => z.key === k)?.label ?? k)
    .join(", ");

  const blockedReason = canNext
    ? null
    : [
        "Elegí una prenda para seguir.",
        !size
          ? "Elegí un talle para seguir."
          : "Elegí un color para seguir.",
        addedZoneKeys.length === 0
          ? "Agregá al menos una zona de estampado y subí tu diseño."
          : `Falta subir la imagen de ${missingLabel}.`,
        "Agregá al menos una prenda al pedido.",
        contact.name.length <= 1
          ? "Escribí tu nombre para poder confirmar."
          : "Escribí un email válido para poder confirmar.",
      ][step];

  function addZone(key: string) {
    setPrints((prev) => (prev[key] ? prev : { ...prev, [key]: { image: null, transform: null } }));
    setActiveZone(key);
  }

  function removeZone(key: string) {
    setPrints((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setActiveZone((current) => {
      if (current !== key) return current;
      const remaining = addedZoneKeys.filter((k) => k !== key);
      return remaining[0] ?? null;
    });
  }

  function setActiveImage(img: UploadedImage | null) {
    if (!activeZone) return;
    setPrints((prev) => ({ ...prev, [activeZone]: { ...prev[activeZone], image: img } }));
  }

  function setActiveTransform(t: DesignTransform | null) {
    if (!activeZone) return;
    setPrints((prev) => ({ ...prev, [activeZone]: { ...prev[activeZone], transform: t } }));
  }

  /**
   * Arma, para cada prenda y cada zona, la imagen de como quedo con el diseno
   * puesto, y la sube. Es lo que se manda por WhatsApp: sin esto solo viaja el
   * diseno suelto y hay que adivinar donde y de que tamano va.
   *
   * Si algo falla se sigue igual: el pedido no se traba por la vista previa.
   */
  async function buildPreviews(): Promise<Record<string, string>> {
    const previews: Record<string, string> = {};

    await Promise.all(
      lines.flatMap((line) =>
        Object.entries(line.prints).map(async ([key, entry]) => {
          if (!entry.image) return;
          try {
            const res = await fetch("/api/mockup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: line.productId,
                size: line.size,
                color: line.color,
                printZoneKey: key,
                imageUrl: entry.image.url,
              }),
            });
            const data = await res.json();
            if (!data.available || !data.mockup?.baseImageUrl) return;

            const hex = colors.find(
              (c) => c.product_id === line.productId && c.name === line.color
            )?.hex;

            const blob = await renderOrderPreview({
              garmentUrl: data.mockup.baseImageUrl,
              colorHex: hex,
              overlay: data.mockup.overlay,
              designUrl: entry.image.url,
              transform: entry.transform,
            });
            if (!blob) return;

            const url = await uploadPreview(blob);
            if (url) previews[`${line.id}:${key}`] = url;
          } catch {
            // seguimos sin la composicion de esta zona
          }
        })
      )
    );

    return previews;
  }

  async function submit() {
    if (lines.length === 0) return;
    setStatus("submitting");
    try {
      setPreviewUrls(await buildPreviews());
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({
            productId: l.productId,
            size: l.size,
            color: l.color,
            quantity: l.quantity,
            prints: Object.entries(l.prints).map(([key, entry]) => ({
              printZoneKey: key,
              imageUrl: entry.image!.url,
              imagePublicId: entry.image!.publicId,
              designTransform: entry.transform,
            })),
          })),
          customerName: contact.name,
          customerEmail: contact.email,
          customerPhone: contact.phone || null,
          notes: contact.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setOrderId(json.order?.id ?? null);
      // El pedido ya esta guardado: el borrador no tiene mas razon de existir.
      clearDraft();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    // El pedido ya quedo guardado; esto es para que nos llegue el aviso al
    // celular con todo lo necesario para producirlo sin abrir el panel.
    const money = (n: number) => "$" + Number(n).toLocaleString("es-AR");

    const bloques = lines.flatMap((l, i) => {
      const lb = lineBreakdown(l);
      const nombre = products.find((p) => p.id === l.productId)?.name ?? "";

      const zonas = Object.entries(l.prints).flatMap(([key, entry]) => {
        const zona = printZones.find((z) => z.key === key);
        const extra = Number(zona?.extra_price ?? 0);
        const preview = previewUrls[l.id + ":" + key];
        return [
          "  - " + (zona?.label ?? key) + (extra > 0 ? " (+" + money(extra) + ")" : ""),
          // Primero como lo acomodo el cliente, despues el archivo original.
          preview ? "    Asi lo quiere: " + preview : null,
          entry.image ? "    Archivo: " + entry.image.url : null,
        ].filter((x) => x !== null);
      });

      return [
        "*" + (i + 1) + ". " + nombre + "*",
        "Talle " + l.size + (l.color ? " - " + l.color : "") + " - x" + l.quantity,
        ...zonas,
        "  Subtotal: " + money(lb.total),
        "",
      ];
    });

    // Sin emojis a proposito: en algunos WhatsApp aparecen como rombos. Los
    // asteriscos los muestra en negrita.
    const waMessage = [
      "*NUEVO PEDIDO" + (orderId ? " #" + orderId.slice(0, 8) : "") + "*",
      new Date().toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "",
      "*PRENDAS (" + lines.length + ")*",
      ...bloques,
      "*TOTAL: " + money(cartTotal) + "*",
      "",
      "*CLIENTE*",
      contact.name,
      contact.email,
      contact.phone || null,
      contact.notes ? "\n*NOTAS*\n" + contact.notes : null,
    ]
      .filter((l) => l !== null)
      .join("\n");

    return (
      <div className="rounded-2xl border border-line bg-panel px-8 py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Check size={28} />
        </div>
        <h2 className="font-display text-3xl">{confirmationTitle}</h2>
        <p className="mt-3 text-ink-soft">
          {confirmationMessage} Te escribimos a <strong>{contact.email}</strong>.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-xl border border-line bg-paper px-6 py-5">
          <p className="text-sm font-medium">Mandanos el pedido por WhatsApp</p>
          <p className="mt-1 text-xs text-ink-soft">
            Así lo vemos al toque y te confirmamos más rápido. Elegí a quién
            escribirle:
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {ORDER_WHATSAPP_NUMBERS.map((n) => (
              <a
                key={n.wa}
                href={whatsappLink(n.wa, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
              >
                <MessageCircle size={15} />
                {n.name ?? n.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeZoneLabel = printZones.find((z) => z.key === activeZone)?.label ?? null;

  return (
    <div>
      {/* Volver y encontrar todo cargado sin aviso desconcierta: conviene decir
          qué pasó y dar salida para empezar de cero. */}
      {restored && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel px-4 py-3">
          <p className="text-sm text-ink-soft">
            Retomamos tu pedido donde lo habías dejado.
          </p>
          <button
            type="button"
            onClick={startOver}
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            <RotateCcw size={13} /> Empezar de nuevo
          </button>
        </div>
      )}

      {/* Stepper. Los pasos ya recorridos son navegables: si no, para volver al
          pedido habia que terminar el paso en el que uno estaba. */}
      <div className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const alcanzable = i < step || (i === 3 && lines.length > 0);
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!alcanzable}
                onClick={() => alcanzable && setStep(i)}
                aria-current={i === step ? "step" : undefined}
                title={alcanzable ? `Ir a ${label}` : undefined}
                className={clsx(
                  "flex items-center gap-2",
                  alcanzable ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors",
                    i < step
                      ? "bg-ink text-paper hover:bg-accent"
                      : i === step
                        ? "bg-accent text-paper"
                        : alcanzable
                          ? "border border-line bg-panel text-ink-soft hover:border-ink hover:text-ink"
                          : "border border-line bg-panel text-ink-soft"
                  )}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </span>
                <span
                  className={clsx(
                    "hidden text-sm sm:block",
                    i === step ? "text-ink" : "text-ink-soft"
                  )}
                >
                  {label}
                  {i === 3 && lines.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-accent-soft px-1.5 py-0.5 text-xs text-accent tabular-nums">
                      {lines.length}
                    </span>
                  )}
                </span>
              </button>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-line" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-line bg-panel p-8"
        >
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProductId(p.id);
                    setSize(null);
                    setColor(null);
                    setPrints({});
                    setActiveZone(null);
                  }}
                  className={clsx(
                    "group overflow-hidden rounded-xl border text-left transition-all",
                    productId === p.id ? "border-ink bg-accent-soft/40 ring-2 ring-ink" : "border-line hover:border-ink hover:shadow-sm"
                  )}
                >
                  <div className="relative aspect-[4/5] bg-accent-soft overflow-hidden">
                    {p.image_url ? (
                      <MediaDisplay src={p.image_url} alt={p.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-soft">
                        <Shirt size={36} className="text-accent" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm sm:text-base italic truncate text-ink">{p.name}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">${p.base_price.toLocaleString("es-AR")}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 1 && product && (
            <div className="space-y-8">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">Talle</p>
                  <SizeGuideModal
                    productSlug={product.slug}
                    productName={product.name}
                    sizes={productSizes}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(productSizes.length ? productSizes.map((s) => s.size) : ["S", "M", "L", "XL"]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={clsx(
                        "h-11 w-11 rounded-full border text-sm transition-colors",
                        size === s ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {productColors.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-medium">Color</p>
                  <div className="flex flex-wrap gap-3">
                    {productColors.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.name)}
                        title={c.name}
                        className={clsx(
                          "h-9 w-9 rounded-full border-2 transition-transform",
                          color === c.name ? "border-accent scale-110" : "border-line"
                        )}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-1 text-sm font-medium">Cantidad</p>
                <p className="mb-3 text-xs text-ink-soft">
                  Todas con el mismo talle, color y diseño.
                </p>
                <div className="inline-flex items-center gap-1 rounded-full border border-line p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Quitar una prenda"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-panel hover:text-ink disabled:opacity-30"
                  >
                    <Minus size={15} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.min(500, Math.max(1, Number(e.target.value) || 1)))
                    }
                    aria-label="Cantidad de prendas"
                    className="w-14 border-0 bg-transparent text-center text-sm tabular-nums outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(500, q + 1))}
                    disabled={quantity >= 500}
                    aria-label="Agregar una prenda"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-panel hover:text-ink disabled:opacity-30"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                {quantity > 1 && (
                  <p className="mt-2 text-xs text-ink-soft">
                    ¿Necesitás talles o colores distintos? Escribinos y lo
                    armamos a medida.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && product && (
            <div>
              <div className="mb-6">
                <p className="mb-3 text-sm font-medium">
                  Elegí una o varias zonas de estampado
                </p>
                <ZoneSelector
                  zones={printZones}
                  addedZones={addedZoneKeys}
                  activeZone={activeZone}
                  hasImage={(key) => !!prints[key]?.image}
                  onAdd={addZone}
                  onRemove={removeZone}
                  onSetActive={setActiveZone}
                />

                {/* Que el recargo por combinar zonas no aparezca recién en el
                    total: acá se ve en el momento en que se activa. */}
                {activeCombos.map((c) => {
                  const a = printZones.find((z) => z.key === c.zone_a_key)?.label ?? c.zone_a_key;
                  const b = printZones.find((z) => z.key === c.zone_b_key)?.label ?? c.zone_b_key;
                  return (
                    <p
                      key={c.id}
                      className="mt-3 rounded-lg border border-line bg-panel px-3 py-2 text-xs text-ink-soft"
                    >
                      Estampar <strong className="text-ink">{a}</strong> y{" "}
                      <strong className="text-ink">{b}</strong> juntos suma{" "}
                      <strong className="text-ink">
                        ${Number(c.extra_price).toLocaleString("es-AR")}
                      </strong>{" "}
                      al total.
                    </p>
                  );
                })}
              </div>

              {activeZone ? (
                <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
                  <div className="lg:sticky lg:top-24">
                    <p className="mb-3 text-sm font-medium">Vista previa — {activeZoneLabel}</p>
                    <PreviewStage
                      productId={product.id}
                      size={size}
                      color={color}
                      colorHex={selectedColor?.hex}
                      printZoneKey={activeZone}
                      defaultZoneKey={activeZone}
                      zoneLabel={activeZoneLabel}
                      image={prints[activeZone]?.image ?? null}
                      onDesignTransformChange={setActiveTransform}
                    />
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-medium">Imagen para {activeZoneLabel}</p>
                    <DesignPicker
                      designs={designs}
                      value={prints[activeZone]?.image ?? null}
                      onChange={setActiveImage}
                    />
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-line px-6 py-14 text-center text-sm text-ink-soft">
                  Elegí al menos una zona arriba para empezar a subir tu diseño.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">
                  {lines.length} prenda{lines.length !== 1 ? "s" : ""} en tu pedido
                  {cartUnits !== lines.length && (
                    <span className="text-ink-soft"> &middot; {cartUnits} unidades</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetCurrent();
                    setStep(0);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
                >
                  <Plus size={14} /> Agregar otra prenda
                </button>
              </div>

              {lines.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line px-6 py-14 text-center text-sm text-ink-soft">
                  Todavia no agregaste ninguna prenda.
                </p>
              ) : (
                <div className="space-y-3">
                  {lines.map((l) => {
                    const lProduct = products.find((p) => p.id === l.productId);
                    const lb = lineBreakdown(l);
                    return (
                      <div
                        key={l.id}
                        className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-paper p-4"
                      >
                        <div className="flex gap-2">
                          {Object.entries(l.prints).map(([key, entry]) => (
                            <div key={key} className="w-14">
                              <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-panel">
                                {entry.image && (
                                  <Image
                                    src={entry.image.url}
                                    alt={key}
                                    fill
                                    className="object-contain p-1"
                                  />
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-center text-[10px] text-ink-soft">
                                {printZones.find((z) => z.key === key)?.label ?? key}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{lProduct?.name}</p>
                          <p className="text-xs text-ink-soft">
                            Talle {l.size}
                            {l.color ? " \u00b7 " + l.color : ""} \u00b7 $
                            {lb.unitTotal.toLocaleString("es-AR")} c/u
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-1 rounded-full border border-line">
                              <button
                                type="button"
                                onClick={() => setLineQuantity(l.id, l.quantity - 1)}
                                disabled={l.quantity <= 1}
                                aria-label="Quitar una"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:text-ink disabled:opacity-30"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-6 text-center text-xs tabular-nums">
                                {l.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setLineQuantity(l.id, l.quantity + 1)}
                                aria-label="Agregar una"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:text-ink"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => editLine(l.id)}
                              className="text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => duplicateLine(l.id)}
                              title="Util para repetir la prenda en otro talle"
                              className="inline-flex items-center gap-1 text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
                            >
                              <Copy size={12} /> Duplicar
                            </button>
                            <button
                              type="button"
                              onClick={() => removeLine(l.id)}
                              className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-accent"
                            >
                              <Trash2 size={12} /> Quitar
                            </button>
                          </div>
                        </div>

                        <p className="font-display text-lg tabular-nums">
                          ${lb.total.toLocaleString("es-AR")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <>
              {/* Antes se confirmaba a ciegas: el paso era solo el formulario y
                  el cliente no volvia a ver que estaba comprando. */}
              <div className="mb-8 rounded-2xl border border-line bg-paper p-5">
                <p className="mb-4 text-sm font-medium">Tu pedido</p>

                <div className="space-y-2">
                  {lines.map((l) => {
                    const lb = lineBreakdown(l);
                    const zonas = Object.keys(l.prints)
                      .map((k) => printZones.find((z) => z.key === k)?.label ?? k)
                      .join(", ");
                    return (
                      <div key={l.id} className="flex justify-between gap-4 text-sm">
                        <span className="text-ink-soft">
                          {products.find((p) => p.id === l.productId)?.name} &middot; Talle {l.size}
                          {l.color ? " \u00b7 " + l.color : ""}
                          {l.quantity > 1 ? " \u00b7 x" + l.quantity : ""}{" "}
                          <span className="text-ink-soft/70">({zonas})</span>
                        </span>
                        <span className="tabular-nums">
                          ${lb.total.toLocaleString("es-AR")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex justify-between gap-4 border-t border-line pt-3">
                  <span className="font-medium">Total</span>
                  <span className="font-display text-lg tabular-nums">
                    ${cartTotal.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre">
                <input
                  className="input"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  className="input"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </Field>
              <Field label="Teléfono (opcional)">
                <input
                  className="input"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
              </Field>
              <Field label="Notas (opcional)" full>
                <textarea
                  className="input min-h-24"
                  value={contact.notes}
                  onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                />
              </Field>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer: total + nav */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
            >
              <ChevronLeft size={16} /> Atrás
            </button>
          ) : <span />}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
          {(step >= 3 ? lines.length > 0 : !!product) && (
            // El total solo se vuelve creible si se puede abrir y ver de donde
            // sale cada peso.
            <details className="group relative text-sm text-ink-soft">
              <summary className="flex cursor-pointer list-none items-center gap-1.5">
                {step >= 3 ? "Total: " : "Esta prenda: "}
                <strong className="text-ink">
                  ${(step >= 3 ? cartTotal : total).toLocaleString("es-AR")}
                </strong>
                <ChevronDown
                  size={14}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="absolute bottom-full right-0 z-20 mb-2 w-72 rounded-xl border border-line bg-panel p-4 shadow-lg">
                {step >= 3 ? (
                  <dl>
                    {lines.map((l) => (
                      <div key={l.id} className="flex justify-between gap-4 py-1 text-sm">
                        <dt className="text-ink-soft">
                          {products.find((p) => p.id === l.productId)?.name} T{l.size}
                          {l.quantity > 1 ? " x" + l.quantity : ""}
                        </dt>
                        <dd className="tabular-nums">
                          ${lineBreakdown(l).total.toLocaleString("es-AR")}
                        </dd>
                      </div>
                    ))}
                    <div className="mt-1 flex justify-between gap-4 border-t border-line pt-2">
                      <dt className="font-medium">Total</dt>
                      <dd className="font-display text-lg tabular-nums">
                        ${cartTotal.toLocaleString("es-AR")}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <PriceBreakdown breakdown={breakdown} />
                )}
              </div>
            </details>
          )}

          {step < 3 && lines.length > 0 && (
            <span className="text-xs text-ink-soft">
              {lines.length} prenda{lines.length !== 1 ? "s" : ""} ya en el pedido
            </span>
          )}

          {step === 2 && lines.length > 0 && (
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft underline underline-offset-2 hover:text-ink"
            >
              <ShoppingBag size={14} /> Ver mi pedido ({lines.length})
            </button>
          )}

          {step === 2 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={addCurrentToCart}
              className="inline-flex items-center gap-1 rounded-full bg-ink px-6 py-3 text-sm text-paper transition-colors hover:bg-accent disabled:opacity-30"
            >
              <Plus size={16} />
              {editingLineId ? "Guardar cambios" : "Agregar al pedido"}
            </button>
          ) : step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1 rounded-full bg-ink px-6 py-3 text-sm text-paper transition-colors hover:bg-accent disabled:opacity-30"
            >
              {step === 3 ? "Continuar" : "Siguiente"} <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext || status === "submitting"}
              onClick={submit}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-6 py-3 text-sm text-paper transition-colors hover:bg-ink disabled:opacity-30"
            >
              {status === "submitting" ? "Enviando..." : "Confirmar pedido"}
            </button>
          )}
        </div>
      </div>
      {blockedReason && (
        <p className="mt-3 text-right text-sm text-ink-soft">{blockedReason}</p>
      )}

      {status === "error" && (
        <p className="mt-3 text-right text-sm text-accent">
          Hubo un error al enviar el pedido. Probá de nuevo.
        </p>
      )}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={clsx("block text-sm", full && "sm:col-span-2")}>
      <span className="mb-1.5 block font-medium">{label}</span>
      {children}
    </label>
  );
}
