"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ImageOff } from "lucide-react";
import type { PrintZone } from "@/lib/types";
import type { UploadedImage } from "./ImageUploader";

type View = "front" | "back";

const ZONE_VIEW: Record<string, View> = {
  front_chest: "front",
  back_full: "back",
  sleeve_left: "front",
  sleeve_right: "front",
};

const ZONE_RECTS: Record<string, { x: number; y: number; w: number; h: number }> = {
  front_chest: { x: 78, y: 58, w: 44, h: 48 },
  sleeve_left: { x: 34, y: 72, w: 22, h: 66 },
  sleeve_right: { x: 144, y: 72, w: 22, h: 66 },
  back_full: { x: 68, y: 55, w: 64, h: 130 },
};

const SHIRT_FRONT =
  "M78 14 L88 6 Q100 16 112 6 L122 14 L146 22 L172 48 L154 70 L140 58 L140 234 L60 234 L60 58 L46 70 L28 48 Z";
const SHIRT_BACK =
  "M78 12 L88 5 L100 12 L112 5 L122 12 L146 22 L172 48 L154 70 L140 58 L140 234 L60 234 L60 58 L46 70 L28 48 Z";

export function GarmentZonePicker({
  zones,
  value,
  onChange,
  image,
  colorHex,
}: {
  zones: PrintZone[];
  value: string | null;
  onChange: (key: string) => void;
  image?: UploadedImage | null;
  colorHex?: string | null;
}) {
  const [view, setView] = useState<View>("front");
  const clipId = useId();

  const availableZones = zones.filter((z) => ZONE_VIEW[z.key] === view || !ZONE_VIEW[z.key]);
  const hasBackZone = zones.some((z) => ZONE_VIEW[z.key] === "back");
  const fill = colorHex || "var(--panel)";
  const isDarkShirt = colorHex ? isDark(colorHex) : false;

  return (
    <div>
      {hasBackZone && (
        <div className="mb-4 inline-flex rounded-full border border-line p-1 text-sm">
          {(["front", "back"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={clsx(
                "rounded-full px-4 py-1.5 transition-colors",
                view === v ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              )}
            >
              {v === "front" ? "Frente" : "Espalda"}
            </button>
          ))}
        </div>
      )}

      <div className="relative mx-auto aspect-4/5 max-w-sm overflow-hidden rounded-2xl bg-linear-to-b from-accent-soft/40 to-transparent">
        <svg viewBox="0 0 200 250" className="h-full w-full drop-shadow-sm">
          <path
            d={view === "front" ? SHIRT_FRONT : SHIRT_BACK}
            fill={fill}
            stroke={isDarkShirt ? "rgba(255,255,255,0.15)" : "var(--line)"}
            strokeWidth="2"
          />
          {/* sombreado sutil para dar volumen a la prenda */}
          <path
            d={view === "front" ? SHIRT_FRONT : SHIRT_BACK}
            fill="url(#shirtShade)"
            opacity={0.5}
          />
          <defs>
            <linearGradient id="shirtShade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="black" stopOpacity="0.06" />
              <stop offset="45%" stopColor="black" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="0.1" />
            </linearGradient>
            {availableZones.map((z) => {
              const rect = ZONE_RECTS[z.key];
              if (!rect) return null;
              return (
                <clipPath key={z.key} id={`${clipId}-${z.key}`}>
                  <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={3} />
                </clipPath>
              );
            })}
          </defs>

          {availableZones.map((z) => {
            const rect = ZONE_RECTS[z.key];
            if (!rect) return null;
            const active = value === z.key;
            return (
              <g key={z.key}>
                {active && image ? (
                  <g clipPath={`url(#${clipId}-${z.key})`}>
                    <image
                      href={image.url}
                      x={rect.x}
                      y={rect.y}
                      width={rect.w}
                      height={rect.h}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </g>
                ) : null}
                <motion.rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.w}
                  height={rect.h}
                  rx={4}
                  onClick={() => onChange(z.key)}
                  className="cursor-pointer"
                  initial={false}
                  animate={{
                    fillOpacity: active ? (image ? 0 : 0.18) : 0.06,
                    strokeOpacity: active ? 1 : 0.35,
                  }}
                  whileHover={{ fillOpacity: active ? (image ? 0 : 0.22) : 0.14 }}
                  fill={isDarkShirt ? "white" : "var(--accent)"}
                  stroke={active ? "var(--accent)" : isDarkShirt ? "white" : "var(--ink)"}
                  strokeWidth={active ? 2 : 1.2}
                  strokeDasharray={active ? undefined : "3 3"}
                />
              </g>
            );
          })}
        </svg>

        {value && !image && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
            <ImageOff size={12} /> Subí una imagen para verla acá
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {availableZones.map((z) => (
          <button
            key={z.key}
            type="button"
            onClick={() => onChange(z.key)}
            className={clsx(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              value === z.key
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink hover:text-ink"
            )}
          >
            {z.label}
            {z.extra_price > 0 && (
              <span className="ml-1 opacity-70">+${z.extra_price.toLocaleString("es-AR")}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function isDark(hex: string) {
  const c = hex.replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}
