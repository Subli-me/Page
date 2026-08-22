"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { ProductMockup } from "@/lib/types";
import { ImageUploader } from "@/components/order/ImageUploader";

interface MockupZoneEditorProps {
  mockup: ProductMockup | null;
  imageUrl: string | null;
  onSave: (mockup: Omit<ProductMockup, "id" | "product_id">) => void;
  onClose: () => void;
}

export function MockupZoneEditor({ mockup, imageUrl, onSave, onClose }: MockupZoneEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [zone, setZone] = useState({
    x: mockup?.overlay_x ?? 0,
    y: mockup?.overlay_y ?? 0,
    w: mockup?.overlay_w ?? 100,
    h: mockup?.overlay_h ?? 100,
  });
  const [previewSrc, setPreviewSrc] = useState(imageUrl);

  // Redraw canvas when zone changes
  useEffect(() => {
    if (!canvasRef.current || !previewSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Dibujar rectángulo de zona de estampado
      ctx.strokeStyle = "#22c55e"; // lime color
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.setLineDash([]);

      // Dibujar círculos en las esquinas para redimensionar
      const corners = [
        [zone.x, zone.y],
        [zone.x + zone.w, zone.y],
        [zone.x, zone.y + zone.h],
        [zone.x + zone.w, zone.y + zone.h],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    img.src = previewSrc;
  }, [zone, previewSrc]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = Math.min(startX, x);
    const newY = Math.min(startY, y);
    const newW = Math.abs(x - startX);
    const newH = Math.abs(y - startY);

    setZone({ x: newX, y: newY, w: newW, h: newH });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Editor de Zona de Estampado</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink/10">
            <X size={20} />
          </button>
        </div>

        <p className="mb-6 text-sm text-ink-soft">
          Primero, subí la imagen del mockup. Luego, haz clic y arrastra sobre la imagen para definir dónde se estampará el diseño.
        </p>

        {/* Subida de imagen */}
        <div className="mb-6 rounded-lg border border-line bg-paper p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Imagen del Mockup
          </p>
          <ImageUploader
            value={previewSrc ? { url: previewSrc, publicId: "" } : null}
            onChange={(img) => img && setPreviewSrc(img.url)}
            label="Arrastrá o elegí imagen"
          />
        </div>

        {previewSrc && (
          <div ref={containerRef} className="mb-6 overflow-auto rounded-lg border border-line bg-paper">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full cursor-crosshair"
              style={{ display: "block" }}
            />
          </div>
        )}

        {/* Zona de estampado valores */}
        <div className="mb-6 rounded-lg border border-line bg-paper p-4">
          <h3 className="mb-3 text-sm font-medium">Zona de Estampado (píxeles)</h3>
          <div className="grid grid-cols-4 gap-3">
            <label>
              <span className="block text-xs text-ink-soft mb-1">X</span>
              <input
                type="number"
                value={zone.x}
                onChange={(e) => setZone({ ...zone, x: Number(e.target.value) })}
                className="input w-full"
              />
            </label>
            <label>
              <span className="block text-xs text-ink-soft mb-1">Y</span>
              <input
                type="number"
                value={zone.y}
                onChange={(e) => setZone({ ...zone, y: Number(e.target.value) })}
                className="input w-full"
              />
            </label>
            <label>
              <span className="block text-xs text-ink-soft mb-1">Ancho</span>
              <input
                type="number"
                value={zone.w}
                onChange={(e) => setZone({ ...zone, w: Number(e.target.value) })}
                className="input w-full"
              />
            </label>
            <label>
              <span className="block text-xs text-ink-soft mb-1">Alto</span>
              <input
                type="number"
                value={zone.h}
                onChange={(e) => setZone({ ...zone, h: Number(e.target.value) })}
                className="input w-full"
              />
            </label>
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
                overlay_x: zone.x,
                overlay_y: zone.y,
                overlay_w: zone.w,
                overlay_h: zone.h,
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
      </div>
    </div>
  );
}
