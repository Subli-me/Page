"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

type Params = {
  productId: string;
  size: string | null;
  color: string | null;
  printZoneKey: string | null;
  imageUrl: string | null;
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "unavailable" }
  | { kind: "error" };

export function MockupPreview({ productId, size, color, printZoneKey, imageUrl }: Params) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const requestId = useRef(0);

  useEffect(() => {
    if (!size || !printZoneKey || !imageUrl) {
      setState({ kind: "idle" });
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
        if (requestId.current !== id) return; // una selección más nueva ya está en curso
        if (!data.available) return setState({ kind: "unavailable" });
        if (data.status === "completed" && data.mockupUrl) {
          setState({ kind: "ready", url: data.mockupUrl });
        } else {
          setState({ kind: "unavailable" });
        }
      })
      .catch(() => {
        if (requestId.current === id) setState({ kind: "error" });
      });
  }, [productId, size, color, printZoneKey, imageUrl]);

  if (state.kind === "idle" || state.kind === "unavailable") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl border border-line bg-panel p-4"
      >
        <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
          <Sparkles size={14} className="text-accent" /> Así se ve en la prenda real
        </p>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-accent-soft/40">
          {state.kind === "loading" && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-soft">
              <Loader2 className="animate-spin text-accent" size={24} />
              <span className="text-xs">Generando foto realista...</span>
            </div>
          )}
          {state.kind === "ready" && (
            <Image src={state.url} alt="Vista previa realista de tu prenda" fill className="object-contain" />
          )}
          {state.kind === "error" && (
            <div className="flex h-full items-center justify-center px-6 text-center text-xs text-ink-soft">
              No pudimos generar la vista previa, pero tu pedido se procesa igual.
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
