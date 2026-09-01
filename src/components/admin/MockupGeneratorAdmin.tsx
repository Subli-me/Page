"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Copy,
  Check,
  Upload,
  RotateCcw,
  Sparkles,
  Grid3x3,
  Plus,
  Minus,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";
import type { DesignCatalogItem, PrintZone, Product, ProductColor, ProductMockup } from "@/lib/types";
import { GarmentPreview, fabricColor, garmentLayers } from "@/components/GarmentPreview";
import { DesignAdjuster, type DesignTransform } from "@/components/order/DesignAdjuster";

const ZOOM_STEPS = [1, 1.5, 2, 2.5];
const DESIGN_BASE_WIDTH = 0.55;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    img.src = src;
  });
}

export function MockupGeneratorAdmin({
  products,
  zones,
  mockups,
  colors,
  designs,
}: {
  products: Product[];
  zones: PrintZone[];
  mockups: ProductMockup[];
  colors: ProductColor[];
  designs: DesignCatalogItem[];
}) {
  // Prenda y zona
  const [productId, setProductId] = useState<string>(products[0]?.id ?? "");
  const [zoneKey, setZoneKey] = useState<string>(zones[0]?.key ?? "");

  // Color de la prenda
  const productColors = colors.filter((c) => c.product_id === productId);
  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(null);

  // Imagen / Diseño seleccionado
  const [imageSource, setImageSource] = useState<"upload" | "catalog">("upload");
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>("");
  const [selectedCatalogDesignId, setSelectedCatalogDesignId] = useState<string | null>(null);

  // Transformación del diseño (posición, escala, rotación)
  const [transform, setTransform] = useState<DesignTransform | null>(null);

  // Visor y exportación
  const [zoomIndex, setZoomIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<{ x: number; y: number; pan: { x: number; y: number } } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const zoom = ZOOM_STEPS[zoomIndex];

  // Mockup base actual para la prenda y zona seleccionadas
  const currentMockup = mockups.find(
    (m) => m.product_id === productId && m.print_zone_key === zoneKey
  ) ?? null;

  const currentProduct = products.find((p) => p.id === productId);
  const currentZone = zones.find((z) => z.key === zoneKey);

  // Determinar la URL del diseño activo
  const activeDesignUrl =
    imageSource === "upload"
      ? customImageUrl
      : designs.find((d) => d.id === selectedCatalogDesignId)?.image_url ?? null;

  // Manejo de cambio de prenda
  useEffect(() => {
    setSelectedColorHex(null);
  }, [productId]);

  // Manejo de zoom
  useEffect(() => {
    if (zoom === 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

  function clampPan(next: { x: number; y: number }) {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return next;

    const maxX = Math.max(0, (content.offsetWidth * zoom - stage.clientWidth) / 2);
    const maxY = Math.max(0, (content.offsetHeight * zoom - stage.clientHeight) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  function startPan(e: React.PointerEvent) {
    if (zoom === 1) return;
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    panStart.current = { x: e.clientX, y: e.clientY, pan };
    setPanning(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function movePan(e: React.PointerEvent) {
    const start = panStart.current;
    if (!start) return;
    setPan(
      clampPan({
        x: start.pan.x + (e.clientX - start.x),
        y: start.pan.y + (e.clientY - start.y),
      })
    );
  }

  function endPan(e: React.PointerEvent) {
    if (!panStart.current) return;
    panStart.current = null;
    setPanning(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  // Carga manual de archivo
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCustomImageUrl(url);
    setCustomImageName(file.name);
    setTransform(null); // Centrar nuevo diseño
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setCustomImageUrl(url);
    setCustomImageName(file.name);
    setTransform(null);
  }

  // Generar composición en canvas de alta resolución
  async function generateCompositeCanvas(): Promise<HTMLCanvasElement | null> {
    if (!currentMockup || !activeDesignUrl) return null;

    const [garment, design] = await Promise.all([
      loadImage(currentMockup.image_url),
      loadImage(activeDesignUrl),
    ]);

    const W = garment.naturalWidth;
    const H = garment.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fondo coloreado si aplica
    if (selectedColorHex) {
      ctx.fillStyle = fabricColor(selectedColorHex);
      ctx.fillRect(0, 0, W, H);
    }

    // Dibujar prenda
    const layers = selectedColorHex ? garmentLayers(selectedColorHex) : 1;
    for (let i = 0; i < layers; i++) {
      ctx.drawImage(garment, 0, 0, W, H);
    }

    // Zona de estampado
    const overlay = {
      x: currentMockup.overlay_x,
      y: currentMockup.overlay_y,
      w: currentMockup.overlay_w,
      h: currentMockup.overlay_h,
    };

    const zoneX = (overlay.x / 100) * W;
    const zoneY = (overlay.y / 100) * H;
    const zoneW = (overlay.w / 100) * W;
    const zoneH = (overlay.h / 100) * H;

    const t = transform ?? { tx: 0, ty: 0, scale: 1, rotation: 0 };
    const centerX = zoneX + zoneW / 2 + t.tx * zoneW;
    const centerY = zoneY + zoneH / 2 + t.ty * zoneH;

    const baseW = zoneW * DESIGN_BASE_WIDTH;
    const baseH = baseW * (design.naturalHeight / design.naturalWidth);

    ctx.save();
    ctx.beginPath();
    ctx.rect(zoneX, zoneY, zoneW, zoneH);
    ctx.clip();

    ctx.translate(centerX, centerY);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.scale(t.scale, t.scale);
    ctx.drawImage(design, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();

    return canvas;
  }

  // Descargar Mockup PNG
  async function handleDownload() {
    setIsExporting(true);
    try {
      const canvas = await generateCompositeCanvas();
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cleanProdName = (currentProduct?.name ?? "prenda").toLowerCase().replace(/\s+/g, "-");
      const cleanZoneName = (currentZone?.label ?? "zona").toLowerCase().replace(/\s+/g, "-");
      a.href = url;
      a.download = `mockup-${cleanProdName}-${cleanZoneName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar mockup:", err);
    } finally {
      setIsExporting(false);
    }
  }

  // Copiar al portapapeles
  async function handleCopy() {
    setIsExporting(true);
    try {
      const canvas = await generateCompositeCanvas();
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob || !navigator.clipboard?.write) return;

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar imagen:", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Panel lateral de controles */}
      <div className="space-y-6 lg:col-span-5">
        {/* 1. Selección de Prenda y Zona */}
        <div className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            1. Prenda y Zona
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Prenda</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="input w-full"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Zona</label>
              <select
                value={zoneKey}
                onChange={(e) => setZoneKey(e.target.value)}
                className="input w-full"
              >
                {zones.map((z) => (
                  <option key={z.key} value={z.key}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color de la prenda */}
          {productColors.length > 0 && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Color de prenda ({productColors.length} disponibles)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedColorHex(null)}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all",
                    selectedColorHex === null
                      ? "border-accent bg-accent/10 font-medium text-ink"
                      : "border-line bg-panel hover:border-ink-soft text-ink-soft"
                  )}
                >
                  Original
                </button>
                {productColors.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColorHex(col.hex)}
                    className={clsx(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all",
                      selectedColorHex === col.hex
                        ? "border-accent bg-accent/10 font-medium text-ink ring-2 ring-accent/30"
                        : "border-line bg-panel hover:border-ink-soft text-ink-soft"
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: col.hex }}
                    />
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!currentMockup && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium">Falta foto base de esta prenda y zona</p>
                <p className="mt-0.5 text-ink-soft">
                  Para poder previsualizarla acá, primero subí la foto en{" "}
                  <Link
                    href="/admin/mockups"
                    className="inline-flex items-center font-medium text-accent underline hover:opacity-80"
                  >
                    Mockups propios <ExternalLink size={11} className="ml-0.5" />
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Carga / Selección de Imagen */}
        <div className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
              2. Imagen del Diseño
            </h2>
            <div className="flex rounded-lg border border-line p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setImageSource("upload")}
                className={clsx(
                  "rounded-md px-2.5 py-1 transition-colors",
                  imageSource === "upload"
                    ? "bg-ink text-paper font-medium"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                Cargar manual
              </button>
              <button
                type="button"
                onClick={() => setImageSource("catalog")}
                className={clsx(
                  "rounded-md px-2.5 py-1 transition-colors",
                  imageSource === "catalog"
                    ? "bg-ink text-paper font-medium"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                Del catálogo ({designs.length})
              </button>
            </div>
          </div>

          {imageSource === "upload" ? (
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
                  customImageUrl
                    ? "border-accent/50 bg-accent/5 hover:border-accent"
                    : "border-line bg-paper/50 hover:border-ink-soft hover:bg-paper"
                )}
              >
                {customImageUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customImageUrl}
                      alt="Diseño cargado"
                      className="max-h-24 max-w-full rounded object-contain shadow-sm"
                    />
                    <p className="text-xs font-medium text-ink">
                      {customImageName || "Imagen seleccionada"}
                    </p>
                    <span className="text-[11px] text-accent underline">
                      Hacé clic para cambiar de imagen
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="text-ink-soft/60" />
                    <p className="mt-2 text-xs font-medium text-ink">
                      Hacé clic o arrastrá una imagen acá
                    </p>
                    <p className="mt-1 text-[11px] text-ink-soft">
                      PNG, JPG, SVG o WebP (con o sin transparencia)
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {designs.length === 0 ? (
                <p className="rounded-xl border border-line bg-paper/50 p-4 text-center text-xs text-ink-soft">
                  No hay diseños en el catálogo. Cargá una imagen manualmente arriba.
                </p>
              ) : (
                <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto pr-1">
                  {designs.map((d) => {
                    const isSelected = selectedCatalogDesignId === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedCatalogDesignId(d.id);
                          setTransform(null);
                        }}
                        className={clsx(
                          "group relative flex aspect-square items-center justify-center rounded-lg border p-1 transition-all overflow-hidden",
                          isSelected
                            ? "border-accent bg-accent/10 ring-2 ring-accent"
                            : "border-line bg-paper hover:border-ink-soft"
                        )}
                        title={d.title}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={d.image_url}
                          alt={d.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Acciones y Exportación */}
        <div className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            3. Exportar Mockup
          </h2>
          <p className="mt-1 text-xs text-ink-soft">
            Genera la imagen compuesta final con calidad completa para descargar o compartir.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={!currentMockup || !activeDesignUrl || isExporting}
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-all hover:bg-accent disabled:opacity-40"
            >
              <Download size={16} />
              {isExporting ? "Generando..." : "Descargar Mockup (PNG)"}
            </button>

            <button
              type="button"
              disabled={!currentMockup || !activeDesignUrl || isExporting}
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink-soft hover:bg-paper disabled:opacity-40"
              title="Copiar imagen al portapapeles"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visor interactivo central */}
      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
          {/* Barra superior de herramientas del visor */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-paper/60">
            <div className="flex items-center gap-2 text-xs text-ink">
              <span className="font-semibold">{currentProduct?.name ?? "Prenda"}</span>
              <span className="text-ink-soft">•</span>
              <span className="text-ink-soft">{currentZone?.label ?? "Zona"}</span>
              {selectedColorHex && (
                <>
                  <span className="text-ink-soft">•</span>
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-black/20"
                    style={{ backgroundColor: selectedColorHex }}
                  />
                </>
              )}
            </div>

            {/* Controles de visor */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTransform(null)}
                className="flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
                title="Centrar y reajustar tamaño del diseño"
              >
                <RotateCcw size={12} /> Centrar diseño
              </button>
              <div className="h-4 w-px bg-line" />
              <button
                type="button"
                onClick={() => setShowGrid((g) => !g)}
                className={clsx(
                  "rounded-lg p-1.5 text-xs transition-colors border",
                  showGrid
                    ? "border-accent bg-accent/10 text-accent font-medium"
                    : "border-line text-ink-soft hover:text-ink"
                )}
                title="Mostrar cuadrícula guía"
              >
                <Grid3x3 size={14} />
              </button>
            </div>
          </div>

          {/* Lienzo del Mockup */}
          <div
            ref={stageRef}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            className={clsx(
              "relative flex h-130 items-center justify-center overflow-hidden bg-accent-soft/20 sm:h-150",
              zoom > 1 && (panning ? "cursor-grabbing" : "cursor-grab")
            )}
            style={{ touchAction: zoom > 1 ? "none" : undefined }}
          >
            {currentMockup ? (
              <div
                ref={contentRef}
                className={clsx("relative", !panning && "transition-transform duration-200")}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              >
                {/* Prenda con tinte */}
                <GarmentPreview
                  imageUrl={currentMockup.image_url}
                  colorHex={selectedColorHex}
                  imageClassName="max-h-125 w-auto sm:max-h-145"
                />

                {/* Cuadrícula */}
                {showGrid && (
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                    {[33.33, 66.66].map((p) => (
                      <line
                        key={`v${p}`}
                        x1={`${p}%`}
                        y1="0"
                        x2={`${p}%`}
                        y2="100%"
                        stroke="rgba(0,0,0,0.25)"
                        strokeWidth={1}
                      />
                    ))}
                    {[33.33, 66.66].map((p) => (
                      <line
                        key={`h${p}`}
                        x1="0"
                        y1={`${p}%`}
                        x2="100%"
                        y2={`${p}%`}
                        stroke="rgba(0,0,0,0.25)"
                        strokeWidth={1}
                      />
                    ))}
                  </svg>
                )}

                {/* Zona y Diseño */}
                {activeDesignUrl ? (
                  <DesignAdjuster
                    key={`${productId}-${zoneKey}-${activeDesignUrl}`}
                    designUrl={activeDesignUrl}
                    overlay={{
                      x: currentMockup.overlay_x,
                      y: currentMockup.overlay_y,
                      w: currentMockup.overlay_w,
                      h: currentMockup.overlay_h,
                    }}
                    value={transform}
                    onChange={setTransform}
                  />
                ) : (
                  <div
                    className="absolute flex items-center justify-center border-2 border-dashed border-accent/70 bg-accent/10"
                    style={{
                      left: `${currentMockup.overlay_x}%`,
                      top: `${currentMockup.overlay_y}%`,
                      width: `${currentMockup.overlay_w}%`,
                      height: `${currentMockup.overlay_h}%`,
                    }}
                  >
                    <span className="rounded bg-paper/90 px-2 py-1 text-center text-xs font-medium text-ink shadow-sm">
                      Zona de estampado
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-ink-soft">
                <ImageIcon size={36} strokeWidth={1.5} className="text-ink-soft/40" />
                <p className="max-w-xs text-sm">
                  Esta prenda aún no tiene foto de mockup cargada para la zona seleccionada.
                </p>
                <Link
                  href="/admin/mockups"
                  className="rounded-lg bg-ink px-3 py-1.5 text-xs text-paper hover:bg-accent"
                >
                  Configurar en Mockups propios
                </Link>
              </div>
            )}

            {/* Badge indicador */}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-dark/85 px-3 py-1 text-xs text-paper shadow">
              <Sparkles size={12} className="text-lime" /> Vista previa en vivo
            </span>

            {/* Controles de zoom */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-dark/85 p-1 shadow">
              <button
                type="button"
                onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                disabled={zoomIndex === 0}
                className="rounded-full p-1.5 text-paper hover:bg-paper/10 disabled:opacity-30"
                title="Alejar"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-9 text-center text-xs text-paper">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
                disabled={zoomIndex === ZOOM_STEPS.length - 1}
                className="rounded-full p-1.5 text-paper hover:bg-paper/10 disabled:opacity-30"
                title="Acercar"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Pie informativo del visor */}
          <div className="border-t border-line bg-paper/40 px-4 py-2.5 text-xs text-ink-soft flex items-center justify-between">
            <span>
              {activeDesignUrl
                ? "💡 Arrastrá el diseño para moverlo, y el círculo naranja de la esquina para cambiar el tamaño o rotarlo."
                : "💡 Seleccioná o subí una imagen para verla estampada sobre la prenda."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
