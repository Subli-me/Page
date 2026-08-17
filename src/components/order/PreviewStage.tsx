"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import type { UploadedImage } from "./ImageUploader";
import { DesignAdjuster, type DesignTransform } from "./DesignAdjuster";

type Params = {
  productId: string;
  size: string | null;
  color: string | null;
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

export function PreviewStage({
  productId,
  size,
  color,
  printZoneKey,
  defaultZoneKey,
  zoneLabel,
  image,
  onDesignTransformChange,
}: Params) {
  const [state, setState] = useState<State>({ kind: "blank" });
  const requestId = useRef(0);
  const imageUrl = image?.url ?? null;
  // Mientras el cliente no eligió zona, mostramos igual la prenda usando
  // la primera zona disponible — así se ve el producto real desde el arranque.
  const effectiveZoneKey = printZoneKey ?? defaultZoneKey;

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
        <div className="relative">
          {state.baseImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={state.baseImageUrl} alt="Prenda" className="block h-auto w-full" />
          ) : (
            <div className="aspect-square w-full" style={{ backgroundColor: state.baseColor ?? "#f5f5f5" }} />
          )}
          {state.designUrl ? (
            <DesignAdjuster designUrl={state.designUrl} overlay={state.overlay} onChange={onDesignTransformChange} />
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
              ya trae su propia transparencia (recorte de la prenda + sombreado),
              por eso va con alpha normal — "multiply" tapaba todo en colores oscuros
              porque el color de fondo se mezclaba con el fondo del estudio, no solo
              con la prenda. */}
          {state.foregroundUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={state.foregroundUrl}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden
            />
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-dark/85 px-3 py-1 text-xs text-paper">
            <Sparkles size={12} className="text-lime" /> Foto real
          </span>
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
      <div className="relative aspect-4/5 bg-accent-soft/30">
        <AnimatePresence mode="wait">
          {state.kind === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-soft"
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
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-10"
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
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center"
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
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center"
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
