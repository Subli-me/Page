"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import type { UploadedImage } from "./ImageUploader";

type Params = {
  productId: string;
  size: string | null;
  color: string | null;
  printZoneKey: string | null;
  zoneLabel: string | null;
  image: UploadedImage | null;
};

type State =
  | { kind: "empty" }
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "fallback" }
  | { kind: "error" };

export function PreviewStage({
  productId,
  size,
  color,
  printZoneKey,
  zoneLabel,
  image,
}: Params) {
  const [state, setState] = useState<State>({ kind: "empty" });
  const requestId = useRef(0);
  const imageUrl = image?.url ?? null;

  useEffect(() => {
    if (!printZoneKey || !imageUrl) {
      setState({ kind: "empty" });
      return;
    }
    if (!size) {
      setState({ kind: "fallback" });
      return;
    }

    const id = ++requestId.current;
    setState({ kind: "loading" });

    fetch("/api/mockup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size, color, printZoneKey, imageUrl }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (requestId.current !== id) return;
        if (data.available && data.status === "completed" && data.mockupUrl) {
          setState({ kind: "ready", url: data.mockupUrl });
        } else {
          setState({ kind: "fallback" });
        }
      })
      .catch(() => {
        if (requestId.current === id) setState({ kind: "error" });
      });
  }, [productId, size, color, printZoneKey, imageUrl]);

  const missing: string[] = [];
  if (!imageUrl) missing.push("una imagen");
  if (!printZoneKey) missing.push("dónde va el estampado");

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative aspect-4/5 bg-accent-soft/30">
        <AnimatePresence mode="wait">
          {state.kind === "ready" ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image src={state.url} alt="Vista previa realista de tu prenda" fill className="object-contain" priority />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-dark/85 px-3 py-1 text-xs text-paper">
                <Sparkles size={12} className="text-lime" /> Foto real
              </span>
            </motion.div>
          ) : state.kind === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-soft"
            >
              <Loader2 className="h-9 w-9 animate-spin text-accent" />
              <p className="text-sm">Generando tu prenda...</p>
              <p className="max-w-52 text-center text-xs text-ink-soft/70">
                Puede tardar unos segundos, estamos armando la foto real.
              </p>
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
                La foto realista de esta combinación todavía no está lista, pero tu diseño y la ubicación quedaron guardados.
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
                No pudimos generar la vista previa ahora, pero tu pedido se procesa igual.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center"
            >
              <ImagePlus size={28} strokeWidth={1.5} className="text-ink-soft/60" />
              <p className="text-sm text-ink-soft">
                {missing.length > 0
                  ? `Falta elegir ${missing.join(" y ")} para ver cómo queda`
                  : "Elegí tu diseño para ver cómo queda"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
