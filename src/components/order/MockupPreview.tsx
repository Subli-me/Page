"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
    <div className="mt-6">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-medium">
        <Sparkles size={14} className="text-accent" /> Así se vería
      </p>
      <div className="relative mx-auto aspect-square max-w-xs overflow-hidden rounded-2xl border border-line bg-panel">
        {state.kind === "loading" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-soft">
            <Loader2 className="animate-spin text-accent" size={24} />
            <span className="text-xs">Generando vista previa...</span>
          </div>
        )}
        {state.kind === "ready" && (
          <Image src={state.url} alt="Vista previa de tu prenda" fill className="object-contain" />
        )}
        {state.kind === "error" && (
          <div className="flex h-full items-center justify-center px-6 text-center text-xs text-ink-soft">
            No pudimos generar la vista previa, pero tu pedido se procesa igual.
          </div>
        )}
      </div>
    </div>
  );
}
