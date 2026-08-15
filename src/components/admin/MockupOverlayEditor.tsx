"use client";

import { useEffect, useRef, useState } from "react";

type Overlay = { x: number; y: number; w: number; h: number };

export function MockupOverlayEditor({
  imageUrl,
  overlay,
  onCommit,
}: {
  imageUrl: string;
  overlay: Overlay;
  onCommit: (overlay: Overlay) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState(overlay);
  const dragRef = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    startBox: Overlay;
  } | null>(null);

  useEffect(() => setBox(overlay), [overlay.x, overlay.y, overlay.w, overlay.h]);

  function clamp(v: number) {
    return Math.min(100, Math.max(0, v));
  }

  function onMove(e: PointerEvent) {
    const drag = dragRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;

    if (drag.mode === "move") {
      setBox({
        ...drag.startBox,
        x: clamp(Math.min(100 - drag.startBox.w, Math.max(0, drag.startBox.x + dxPct))),
        y: clamp(Math.min(100 - drag.startBox.h, Math.max(0, drag.startBox.y + dyPct))),
      });
    } else {
      setBox({
        ...drag.startBox,
        w: Math.min(100 - drag.startBox.x, Math.max(6, drag.startBox.w + dxPct)),
        h: Math.min(100 - drag.startBox.y, Math.max(6, drag.startBox.h + dyPct)),
      });
    }
  }

  function onUp() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    dragRef.current = null;
    setBox((current) => {
      onCommit(current);
      return current;
    });
  }

  function startDrag(mode: "move" | "resize") {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = { mode, startX: e.clientX, startY: e.clientY, startBox: box };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden rounded-xl border border-line"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="block h-auto w-full" draggable={false} />
        <div
          onPointerDown={startDrag("move")}
          className="absolute cursor-move touch-none border-2 border-accent bg-accent/20"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.w}%`,
            height: `${box.h}%`,
          }}
        >
          <div className="pointer-events-none flex h-full w-full items-center justify-center text-[10px] font-medium uppercase tracking-wide text-accent">
            Diseño
          </div>
          <div
            onPointerDown={startDrag("resize")}
            className="absolute -bottom-2 -right-2 h-5 w-5 cursor-se-resize touch-none rounded-full border-2 border-panel bg-accent"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Arrastrá el recuadro naranja para moverlo, y el círculo de la esquina para cambiar el tamaño.
      </p>
    </div>
  );
}
