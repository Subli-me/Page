"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Grid3x3, ImagePlus, Loader2, Minus, Plus, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { UploadedImage } from "./ImageUploader";
import { DesignAdjuster, type DesignTransform } from "./DesignAdjuster";

type Params = {
  productId: string;
  size: string | null;
  color: string | null;
  colorHex?: string | null;
  printZoneKey: string | null;
  defaultZoneKey: string | null;
  zoneLabel: string | null;
  image: UploadedImage | null;
  onDesignTransformChange?: (t: DesignTransform | null) => void;
};

type Overlay = { x: number; y: number; w: number; h: number };

type State =
  | { kind: "loading" }
  | {
      kind: "composite";
      baseImageUrl: string | null;
      baseColor: string | null;
      foregroundUrl: string | null;
      overlay: Overlay;
      designUrl: string | null;
    }
  | { kind: "fallback" }
  | { kind: "blank" }
  | { kind: "error" };

const ZOOM_STEPS = [1, 1.5, 2, 2.5];

export function PreviewStage({
  productId,
  size,
  color,
  colorHex,
  printZoneKey,
  defaultZoneKey,
  zoneLabel,
  image,
  onDesignTransformChange,
}: Params) {
  const [state, setState] = useState<State>({ kind: "blank" });
  const [zoomIndex, setZoomIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const requestId = useRef(0);
  const imageUrl = image?.url ?? null;
  const zoom = ZOOM_STEPS[zoomIndex];
  // Mientras el cliente no eligió zona, mostramos igual la prenda usando
  // la primera zona disponible — así se ve el producto real desde el arranque.
  const effectiveZoneKey = printZoneKey ?? defaultZoneKey;

  useEffect(() => {
    setZoomIndex(0);
  }, [effectiveZoneKey]);

  useEffect(() => {
    if (!effectiveZoneKey) {
      setState({ kind: "blank" });
      return;
    }

    const id = ++requestId.current;
    setState({ kind: "loading" });

    fetch("/api/mockup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        size,
        color,
        printZoneKey: effectiveZoneKey,
        imageUrl,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (requestId.current !== id) return;
        if (data.available && data.mockup) {
          setState({
            kind: "composite",
            baseImageUrl: data.mockup.baseImageUrl ?? null,
            baseColor: data.mockup.baseColor ?? null,
            foregroundUrl: data.mockup.foregroundUrl ?? null,
            overlay: data.mockup.overlay,
            designUrl: imageUrl,
          });
        } else if (data.canFallback && imageUrl && printZoneKey && zoneLabel) {
          setState({ kind: "fallback" });
        } else {
          setState({ kind: "blank" });
        }
      })
      .catch(() => {
        if (requestId.current === id) setState({ kind: "error" });
      });
  }, [productId, size, color, effectiveZoneKey, imageUrl, printZoneKey, zoneLabel]);

  useEffect(() => {
    if (state.kind !== "composite" || !state.designUrl) onDesignTransformChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind, state.kind === "composite" ? state.designUrl : null]);

  if (state.kind === "composite") {
    const zoneChosen = !!printZoneKey;
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="relative flex h-110 items-center justify-center overflow-hidden bg-accent-soft/20 sm:h-140">
          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {state.baseImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={state.baseImageUrl}
                alt="Prenda"
                className="block max-h-105 w-auto sm:max-h-135"
                draggable={false}
              />
            ) : (
              <div
                className="h-105 w-105 sm:h-135 sm:w-135"
                style={{ backgroundColor: state.baseColor ?? "#f5f5f5" }}
              />
            )}

            {showGrid && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                {[33.33, 66.66].map((p) => (
                  <line key={`v${p}`} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
                ))}
                {[33.33, 66.66].map((p) => (
                  <line key={`h${p}`} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
                ))}
              </svg>
            )}

            {state.designUrl ? (
              <DesignAdjuster
                designUrl={state.designUrl}
                overlay={state.overlay}
                onChange={onDesignTransformChange}
              />
            ) : (
              <div
                className="absolute flex items-center justify-center border border-dashed border-ink-soft/40 bg-ink/5"
                style={{
                  left: `${state.overlay.x}%`,
                  top: `${state.overlay.y}%`,
                  width: `${state.overlay.w}%`,
                  height: `${state.overlay.h}%`,
                }}
              >
                {zoneChosen && (
                  <span className="px-2 text-center text-[11px] text-ink-soft/70">Tu diseño va acá</span>
                )}
              </div>
            )}

            {/* Sombras/pliegues de la tela por encima del diseño. El PNG de Printful
                ya trae su propia transparencia (recorte de la prenda + sombreado). */}
            {state.foregroundUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={state.foregroundUrl}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden
              />
            )}
          </div>

          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-dark/85 px-3 py-1 text-xs text-paper">
            <Sparkles size={12} className="text-lime" /> Foto real
          </span>

          {/* Controles de zoom y grilla */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-dark/85 p-1">
            <button
              type="button"
              onClick={() => setShowGrid((g) => !g)}
              className={clsx(
                "rounded-full p-1.5 transition-colors",
                showGrid ? "bg-lime text-dark" : "text-paper hover:bg-paper/10"
              )}
              title="Mostrar cuadrícula"
            >
              <Grid3x3 size={14} />
            </button>
            <div className="mx-0.5 h-4 w-px bg-paper/20" />
            <button
              type="button"
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              disabled={zoomIndex === 0}
              className="rounded-full p-1.5 text-paper hover:bg-paper/10 disabled:opacity-30"
              title="Alejar"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-9 text-center text-xs text-paper">{Math.round(zoom * 100)}%</span>
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
        <p className="border-t border-line px-4 py-2.5 text-xs text-ink-soft">
          {state.designUrl
            ? "Arrastrá tu diseño para moverlo, y el círculo de la esquina para agrandarlo o rotarlo."
            : "Subí tu imagen para verla puesta acá."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative flex h-110 items-center justify-center bg-accent-soft/30 sm:h-140">
        <AnimatePresence mode="wait">
          {state.kind === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 text-ink-soft"
            >
              <Loader2 className="h-9 w-9 animate-spin text-accent" />
              <p className="text-sm">Cargando...</p>
            </motion.div>
          ) : state.kind === "fallback" && image && zoneLabel ? (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 p-10"
            >
              <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
                <Image src={image.url} alt="Tu diseño" fill className="object-contain p-2" />
              </div>
              <p className="text-center text-sm text-ink-soft">
                Estampado en <strong className="text-ink">{zoneLabel}</strong>
              </p>
              <p className="max-w-56 text-center text-xs text-ink-soft/70">
                Todavía no cargamos una foto de esta prenda, pero tu diseño y la ubicación quedaron guardados.
              </p>
            </motion.div>
          ) : state.kind === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 px-8 text-center"
            >
              <p className="text-sm text-ink-soft">
                No pudimos cargar la vista previa ahora, pero tu pedido se procesa igual.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="blank"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 px-8 text-center"
            >
              <ImagePlus size={28} strokeWidth={1.5} className="text-ink-soft/60" />
              <p className="text-sm text-ink-soft">Todavía no hay foto cargada de esta prenda</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
