"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import type { PrintZone } from "@/lib/types";

export function ZoneSelector({
  zones,
  value,
  onChange,
}: {
  zones: PrintZone[];
  value: string | null;
  onChange: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {zones.map((z) => {
        const active = value === z.key;
        return (
          <button
            key={z.key}
            type="button"
            onClick={() => onChange(z.key)}
            className={clsx(
              "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-colors",
              active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
            )}
          >
            <span>
              {z.label}
              {z.extra_price > 0 && (
                <span className={clsx("ml-1.5 text-xs", active ? "text-paper/70" : "text-ink-soft")}>
                  +${z.extra_price.toLocaleString("es-AR")}
                </span>
              )}
            </span>
            {active && <Check size={15} className="shrink-0 text-lime" />}
          </button>
        );
      })}
    </div>
  );
}
