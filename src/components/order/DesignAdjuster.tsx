"use client";

import { useEffect, useRef, useState } from "react";
import { Move, RotateCw } from "lucide-react";

/**
 * Cómo quedó acomodado el diseño dentro de la zona de estampado.
 *
 * `tx`/`ty` van como fracción del ancho y alto de la zona, no en píxeles: la
 * vista previa se ve de distinto tamaño según la pantalla, y guardarlo en
 * píxeles haría que la posición solo signifique algo en el tamaño exacto en que
 * se arrastró. Normalizado, se puede reproducir en cualquier tamaño.
 */
export type DesignTransform = { tx: number; ty: number; scale: number; rotation: number };

const DEFAULT_TRANSFORM: DesignTransform = { tx: 0, ty: 0, scale: 1, rotation: 0 };

export function DesignAdjuster({
  designUrl,
  overlay,
  value,
  onChange,
}: {
  designUrl: string;
  overlay: { x: number; y: number; w: number; h: number };
  /** Cómo estaba acomodado. Sin esto, volver a una zona lo reseteaba. */
  value?: DesignTransform | null;
  onChange?: (t: DesignTransform) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<DesignTransform>(value ?? DEFAULT_TRANSFORM);

  // El estado vive en fracciones, pero el arrastre y el dibujado necesitan
  // píxeles, así que medimos la zona y nos mantenemos al tanto de sus cambios.
  // De paso, la posición aguanta que se redimensione la ventana.
  const [frame, setFrame] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const medir = () => {
      const rect = el.getBoundingClientRect();
      setFrame({ w: rect.width, h: rect.height });
    };
    medir();

    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    onChange?.(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const dragRef = useRef<{
    mode: "move" | "transform";
    startPointer: { x: number; y: number };
    startT: DesignTransform;
    center?: { x: number; y: number };
  } | null>(null);

  function onMove(e: PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.mode === "move") {
      setT({
        ...drag.startT,
        tx: drag.startT.tx + (e.clientX - drag.startPointer.x) / (frame.w || 1),
        ty: drag.startT.ty + (e.clientY - drag.startPointer.y) / (frame.h || 1),
      });
    } else if (drag.center) {
      const v0 = { x: drag.startPointer.x - drag.center.x, y: drag.startPointer.y - drag.center.y };
      const v1 = { x: e.clientX - drag.center.x, y: e.clientY - drag.center.y };
      const dist0 = Math.hypot(v0.x, v0.y) || 1;
      const dist1 = Math.hypot(v1.x, v1.y) || 1;
      const angle0 = Math.atan2(v0.y, v0.x);
      const angle1 = Math.atan2(v1.y, v1.x);
      // Tope de escala: más allá de esto el diseño empieza a exceder el área
      // real de impresión de la zona (el rectángulo "overlay" ya representa
      // las dimensiones físicas máximas que se usan para esta prenda).
      const scale = Math.min(2.2, Math.max(0.25, drag.startT.scale * (dist1 / dist0)));
      const rotation = drag.startT.rotation + ((angle1 - angle0) * 180) / Math.PI;
      setT({ ...drag.startT, scale, rotation });
    }
  }

  function onUp() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    dragRef.current = null;
  }

  function startMove(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { mode: "move", startPointer: { x: e.clientX, y: e.clientY }, startT: t };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function startTransform(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = {
      x: rect.left + rect.width / 2 + t.tx * rect.width,
      y: rect.top + rect.height / 2 + t.ty * rect.height,
    };
    dragRef.current = {
      mode: "transform",
      startPointer: { x: e.clientX, y: e.clientY },
      startT: t,
      center,
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      ref={frameRef}
      className="absolute overflow-hidden"
      style={{
        left: `${overlay.x}%`,
        top: `${overlay.y}%`,
        width: `${overlay.w}%`,
        height: `${overlay.h}%`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 border border-dashed border-paper/50" />
      <div
        className="absolute left-1/2 top-1/2 w-[55%] cursor-move touch-none select-none"
        style={{
          transform: `translate(-50%, -50%) translate(${t.tx * frame.w}px, ${t.ty * frame.h}px) rotate(${t.rotation}deg) scale(${t.scale})`,
        }}
        onPointerDown={startMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={designUrl} alt="Tu diseño" className="pointer-events-none block h-auto w-full" draggable={false} />
        <div
          onPointerDown={startTransform}
          className="absolute -bottom-2.5 -right-2.5 flex h-6 w-6 cursor-alias touch-none items-center justify-center rounded-full border-2 border-panel bg-accent text-paper shadow-sm"
        >
          <RotateCw size={11} />
        </div>
        <div className="pointer-events-none absolute -left-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-panel bg-ink/70 text-paper">
          <Move size={11} />
        </div>
      </div>
    </div>
  );
}
