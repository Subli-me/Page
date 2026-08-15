"use client";

import { useState } from "react";
import clsx from "clsx";
import type { PrintZone } from "@/lib/types";

type View = "front" | "back";

const ZONE_VIEW: Record<string, View> = {
  front_chest: "front",
  back_full: "back",
  sleeve_left: "front",
  sleeve_right: "front",
};

export function GarmentZonePicker({
  zones,
  value,
  onChange,
}: {
  zones: PrintZone[];
  value: string | null;
  onChange: (key: string) => void;
}) {
  const [view, setView] = useState<View>("front");

  const availableZones = zones.filter((z) => ZONE_VIEW[z.key] === view || !ZONE_VIEW[z.key]);
  const hasBackZone = zones.some((z) => ZONE_VIEW[z.key] === "back");

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

      <div className="relative mx-auto aspect-[4/5] max-w-xs">
        <svg viewBox="0 0 200 250" className="h-full w-full">
          {view === "front" ? (
            <path
              d="M60 20 L85 10 Q100 20 115 10 L140 20 L170 45 L155 65 L140 55 L140 230 L60 230 L60 55 L45 65 L30 45 Z"
              fill="var(--panel)"
              stroke="var(--line)"
              strokeWidth="2"
            />
          ) : (
            <path
              d="M60 20 L85 12 L100 18 L115 12 L140 20 L170 45 L155 65 L140 55 L140 230 L60 230 L60 55 L45 65 L30 45 Z"
              fill="var(--panel)"
              stroke="var(--line)"
              strokeWidth="2"
            />
          )}

          {view === "front" && (
            <>
              <ZoneRect
                x={80} y={55} w={40} h={45}
                active={value === "front_chest"}
                available={zones.some((z) => z.key === "front_chest")}
                onClick={() => onChange("front_chest")}
              />
              <ZoneRect
                x={35} y={70} w={22} h={70}
                active={value === "sleeve_left"}
                available={zones.some((z) => z.key === "sleeve_left")}
                onClick={() => onChange("sleeve_left")}
              />
              <ZoneRect
                x={143} y={70} w={22} h={70}
                active={value === "sleeve_right"}
                available={zones.some((z) => z.key === "sleeve_right")}
                onClick={() => onChange("sleeve_right")}
              />
            </>
          )}

          {view === "back" && (
            <ZoneRect
              x={70} y={55} w={60} h={130}
              active={value === "back_full"}
              available={zones.some((z) => z.key === "back_full")}
              onClick={() => onChange("back_full")}
            />
          )}
        </svg>
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

function ZoneRect({
  x, y, w, h, active, available, onClick,
}: {
  x: number; y: number; w: number; h: number;
  active: boolean; available: boolean; onClick: () => void;
}) {
  if (!available) return null;
  return (
    <rect
      x={x} y={y} width={w} height={h} rx={4}
      className={clsx(
        "cursor-pointer transition-colors",
        active ? "fill-accent/30 stroke-accent" : "fill-accent-soft/40 stroke-line hover:fill-accent-soft"
      )}
      strokeWidth={2}
      onClick={onClick}
    />
  );
}
