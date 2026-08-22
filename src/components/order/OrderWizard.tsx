"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Check, ChevronLeft, ChevronRight, Shirt } from "lucide-react";
import type { DesignCatalogItem, PrintZone, Product, ProductColor, ProductSize } from "@/lib/types";
import { type UploadedImage } from "./ImageUploader";
import { DesignPicker } from "./DesignPicker";
import { PreviewStage } from "./PreviewStage";
import { type DesignTransform } from "./DesignAdjuster";
import { ZoneSelector } from "./ZoneSelector";
import { SizeGuideModal } from "./SizeGuideModal";
import { MediaDisplay } from "@/components/MediaDisplay";

const STEPS = ["Prenda", "Talle y color", "Diseño", "Tus datos"] as const;

type PrintEntry = { image: UploadedImage | null; transform: DesignTransform | null };

export function OrderWizard({
  products,
  sizes,
  colors,
  printZones,
  designs,
  confirmationTitle,
  confirmationMessage,
}: {
  products: Product[];
  sizes: ProductSize[];
  colors: ProductColor[];
  printZones: PrintZone[];
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

  const product = products.find((p) => p.id === productId) ?? null;
  const productSizes = sizes.filter((s) => s.product_id === productId);
  const productColors = colors.filter((c) => c.product_id === productId);
  const selectedColor = color ? productColors.find((c) => c.name === color) : null;
  const addedZoneKeys = Object.keys(prints);

  const total = useMemo(() => {
    if (!product) return 0;
    const sizeDelta = productSizes.find((s) => s.size === size)?.price_delta ?? 0;
    const extraTotal = addedZoneKeys.reduce((sum, key) => {
      const zone = printZones.find((z) => z.key === key);
      return sum + Number(zone?.extra_price ?? 0);
    }, 0);
    return Number(product.base_price) + Number(sizeDelta) + extraTotal;
  }, [product, productSizes, size, addedZoneKeys, printZones]);

  const allZonesHaveImage = addedZoneKeys.length > 0 && addedZoneKeys.every((k) => prints[k].image);

  const canNext = [
    !!productId,
    !!size && (productColors.length === 0 || !!color),
    allZonesHaveImage,
    contact.name.length > 1 && contact.email.includes("@"),
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

  async function submit() {
    if (!product || !allZonesHaveImage) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size,
          color,
          prints: addedZoneKeys.map((key) => ({
            printZoneKey: key,
            imageUrl: prints[key].image!.url,
            imagePublicId: prints[key].image!.publicId,
            designTransform: prints[key].transform,
          })),
          customerName: contact.name,
          customerEmail: contact.email,
          customerPhone: contact.phone || null,
          notes: contact.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-line bg-panel px-8 py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Check size={28} />
        </div>
        <h2 className="font-display text-3xl">{confirmationTitle}</h2>
        <p className="mt-3 text-ink-soft">
          {confirmationMessage} Te escribimos a <strong>{contact.email}</strong>.
        </p>
      </div>
    );
  }

  const activeZoneLabel = printZones.find((z) => z.key === activeZone)?.label ?? null;

  return (
    <div>
      {/* Stepper */}
      <div className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={clsx(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors",
                i < step
                  ? "bg-ink text-paper"
                  : i === step
                  ? "bg-accent text-paper"
                  : "bg-panel text-ink-soft border border-line"
              )}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={clsx("hidden text-sm sm:block", i === step ? "text-ink" : "text-ink-soft")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-line" />}
          </div>
        ))}
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
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer: total + nav */}
      <div className="mt-6 flex items-center justify-between">
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

        <div className="flex items-center gap-6">
          {product && (
            <span className="text-sm text-ink-soft">
              Total: <strong className="text-ink">${total.toLocaleString("es-AR")}</strong>
            </span>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1 rounded-full bg-ink px-6 py-3 text-sm text-paper transition-colors hover:bg-accent disabled:opacity-30"
            >
              Siguiente <ChevronRight size={16} />
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
