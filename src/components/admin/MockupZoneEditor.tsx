"use client";

import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ProductMockup } from "@/lib/types";
import { ImageUploader } from "@/components/order/ImageUploader";

interface MockupZoneEditorProps {
  mockup: ProductMockup | null;
  imageUrl: string | null;
  onSave: (mockup: Omit<ProductMockup, "id" | "product_id">) => void;
  onClose: () => void;
}

type InteractionMode = "idle" | "draw" | "move" | "resize-tl" | "resize-tr" | "resize-bl" | "resize-br" | "resize-t" | "resize-b" | "resize-l" | "resize-r";

const HANDLE_SIZE = 8;

export function MockupZoneEditor({ mockup, imageUrl, onSave, onClose }: MockupZoneEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<InteractionMode>("idle");
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [zone, setZone] = useState({
    x: mockup?.overlay_x ?? 50,
    y: mockup?.overlay_y ?? 50,
    w: mockup?.overlay_w ?? 200,
    h: mockup?.overlay_h ?? 200,
  });
  const [previewSrc, setPreviewSrc] = useState(imageUrl);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

  // Redraw canvas
  useEffect(() => {
    if (!canvasRef.current || !previewSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      setCanvasSize({ w: img.width, h: img.height });
      ctx.drawImage(img, 0, 0);

      // Rectángulo semi-transparente fuera del área
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.clearRect(zone.x, zone.y, zone.w, zone.h);

      // Borde del rectángulo
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.setLineDash([]);

      // Handles en las esquinas
      const corners = [
        { x: zone.x, y: zone.y },
        { x: zone.x + zone.w, y: zone.y },
        { x: zone.x, y: zone.y + zone.h },
        { x: zone.x + zone.w, y: zone.y + zone.h },
      ];

      corners.forEach(({ x, y }) => {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(x - HANDLE_SIZE / 2, y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      });
    };
    img.src = previewSrc;
  }, [zone, previewSrc]);

  const getInteractionMode = (x: number, y: number): InteractionMode => {
    const margin = 15;
    const isNearLeft = Math.abs(x - zone.x) < margin;
    const isNearRight = Math.abs(x - (zone.x + zone.w)) < margin;
    const isNearTop = Math.abs(y - zone.y) < margin;
    const isNearBottom = Math.abs(y - (zone.y + zone.h)) < margin;
    const isInside = x > zone.x && x < zone.x + zone.w && y > zone.y && y < zone.y + zone.h;

    if (isNearLeft && isNearTop) return "resize-tl";
    if (isNearRight && isNearTop) return "resize-tr";
    if (isNearLeft && isNearBottom) return "resize-bl";
    if (isNearRight && isNearBottom) return "resize-br";
    if (isNearTop) return "resize-t";
    if (isNearBottom) return "resize-b";
    if (isNearLeft) return "resize-l";
    if (isNearRight) return "resize-r";
    if (isInside) return "move";
    return "draw";
  };

  const updateCanvasCursor = (x: number, y: number) => {
    if (!canvasRef.current) return;
    const m = getInteractionMode(x, y);
    const cursors: Record<InteractionMode, string> = {
      idle: "default",
      draw: "crosshair",
      move: "grab",
      "resize-tl": "nwse-resize",
      "resize-tr": "nesw-resize",
      "resize-bl": "nesw-resize",
      "resize-br": "nwse-resize",
      "resize-t": "ns-resize",
      "resize-b": "ns-resize",
      "resize-l": "ew-resize",
      "resize-r": "ew-resize",
    };
    canvasRef.current.style.cursor = cursors[m];
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartX(x);
    setStartY(y);
    const m = getInteractionMode(x, y);
    setMode(m);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateCanvasCursor(x, y);

    if (mode === "idle") return;

    const dx = x - startX;
    const dy = y - startY;

    const minW = 30;
    const minH = 30;

    if (mode === "draw") {
      const newX = Math.min(startX, x);
      const newY = Math.min(startY, y);
      const newW = Math.max(minW, Math.abs(x - startX));
      const newH = Math.max(minH, Math.abs(y - startY));
      setZone({ x: newX, y: newY, w: newW, h: newH });
    } else if (mode === "move") {
      const newX = Math.max(0, Math.min(zone.x + dx, canvasSize.w - zone.w));
      const newY = Math.max(0, Math.min(zone.y + dy, canvasSize.h - zone.h));
      setZone({ ...zone, x: newX, y: newY });
      setStartX(x);
      setStartY(y);
    } else if (mode === "resize-tl") {
      const newX = Math.min(zone.x + dx, zone.x + zone.w - minW);
      const newY = Math.min(zone.y + dy, zone.y + zone.h - minH);
      const newW = Math.max(minW, zone.w - dx);
      const newH = Math.max(minH, zone.h - dy);
      setZone({ x: newX, y: newY, w: newW, h: newH });
      setStartX(x);
      setStartY(y);
    } else if (mode === "resize-tr") {
      const newY = Math.min(zone.y + dy, zone.y + zone.h - minH);
      const newW = Math.max(minW, zone.w + dx);
      const newH = Math.max(minH, zone.h - dy);
      setZone({ ...zone, y: newY, w: newW, h: newH });
      setStartX(x);
      setStartY(y);
    } else if (mode === "resize-bl") {
      const newX = Math.min(zone.x + dx, zone.x + zone.w - minW);
      const newW = Math.max(minW, zone.w - dx);
      const newH = Math.max(minH, zone.h + dy);
      setZone({ x: newX, y: zone.y, w: newW, h: newH });
      setStartX(x);
      setStartY(y);
    } else if (mode === "resize-br") {
      const newW = Math.max(minW, zone.w + dx);
      const newH = Math.max(minH, zone.h + dy);
      setZone({ ...zone, w: newW, h: newH });
      setStartX(x);
      setStartY(y);
    } else if (mode === "resize-t") {
      const newY = Math.min(zone.y + dy, zone.y + zone.h - minH);
      const newH = Math.max(minH, zone.h - dy);
      setZone({ ...zone, y: newY, h: newH });
      setStartY(y);
    } else if (mode === "resize-b") {
      const newH = Math.max(minH, zone.h + dy);
      setZone({ ...zone, h: newH });
      setStartY(y);
    } else if (mode === "resize-l") {
      const newX = Math.min(zone.x + dx, zone.x + zone.w - minW);
      const newW = Math.max(minW, zone.w - dx);
      setZone({ ...zone, x: newX, w: newW });
      setStartX(x);
    } else if (mode === "resize-r") {
      const newW = Math.max(minW, zone.w + dx);
      setZone({ ...zone, w: newW });
      setStartX(x);
    }
  };

  const handleMouseUp = () => {
    setMode("idle");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/70 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Editor de Zona de Estampado</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink/10">
            <X size={20} />
          </button>
        </div>

        <p className="mb-6 text-sm text-ink-soft">
          1. Sube la imagen • 2. Dibuja, mueve o redimensiona el rectángulo • 3. Guarda
        </p>

        {/* Subida de imagen */}
        {!previewSrc && (
          <div className="mb-6 rounded-lg border border-line bg-paper p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
              Imagen del Mockup
            </p>
            <ImageUploader
              value={null}
              onChange={(img) => img && setPreviewSrc(img.url)}
              label="Arrastrá o elegí imagen"
            />
          </div>
        )}

        {previewSrc && (
          <>
            {/* Canvas interactivo */}
            <div className="mb-6 rounded-lg border border-line bg-paper overflow-auto" ref={containerRef}>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="block max-w-full"
                style={{ display: "block" }}
              />
            </div>

            {/* Instrucciones y valores */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 rounded-lg border border-line bg-paper p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-3">
                  Interacciones
                </p>
                <ul className="space-y-1 text-xs text-ink-soft">
                  <li>• <span className="text-lime">Clic + arrastra</span> en vacío: dibujar</li>
                  <li>• <span className="text-lime">Clic + arrastra</span> dentro: mover</li>
                  <li>• <span className="text-lime">Clic + arrastra</span> en bordes: redimensionar</li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft mb-3">
                  Coordenadas (píxeles)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-ink-soft">X:</span> <span className="font-mono">{Math.round(zone.x)}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft">Y:</span> <span className="font-mono">{Math.round(zone.y)}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft">Ancho:</span> <span className="font-mono">{Math.round(zone.w)}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft">Alto:</span> <span className="font-mono">{Math.round(zone.h)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onSave({
                    print_zone_key: mockup?.print_zone_key ?? "",
                    image_url: previewSrc ?? "",
                    image_public_id: mockup?.image_public_id ?? "",
                    overlay_x: Math.round(zone.x),
                    overlay_y: Math.round(zone.y),
                    overlay_w: Math.round(zone.w),
                    overlay_h: Math.round(zone.h),
                  });
                  onClose();
                }}
                className="flex-1 rounded-full bg-lime px-4 py-2.5 text-sm font-medium text-dark hover:bg-lime/90"
              >
                Guardar
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-line px-4 py-2.5 text-sm font-medium hover:bg-panel"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
