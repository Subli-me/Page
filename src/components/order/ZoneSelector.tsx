"use client";

import clsx from "clsx";
import { Check, Plus, X } from "lucide-react";
import type { PrintZone } from "@/lib/types";

export function ZoneSelector({
  zones,
  addedZones,
  activeZone,
  hasImage,
  extraFor,
  onAdd,
  onRemove,
  onSetActive,
}: {
  zones: PrintZone[];
  addedZones: string[];
  activeZone: string | null;
  hasImage: (key: string) => boolean;
  /**
   * Lo que suma esta zona en el estado actual del pedido: su propio adicional
   * más el recargo por combinación, si agregarla completa un par.
   */
  extraFor: (key: string) => number;
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
  onSetActive: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {zones.map((z) => {
        const added = addedZones.includes(z.key);
        const active = activeZone === z.key;
        const extra = extraFor(z.key);
        return (
          <button
            key={z.key}
            type="button"
            onClick={() => (added ? onSetActive(z.key) : onAdd(z.key))}
            className={clsx(
              "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
              active
                ? "border-ink bg-ink text-paper"
                : added
                ? "border-accent text-ink"
                : "border-line text-ink-soft hover:border-ink hover:text-ink"
            )}
          >
            {added ? (
              hasImage(z.key) ? (
                <Check size={13} className={active ? "text-lime" : "text-accent"} />
              ) : (
                <span className={clsx("h-1.5 w-1.5 rounded-full", active ? "bg-lime" : "bg-accent")} />
              )
            ) : (
              <Plus size={13} />
            )}
            {z.label}
            {extra > 0 && (
              <span className={clsx("text-xs", active ? "text-paper/70" : "text-ink-soft")}>
                +${extra.toLocaleString("es-AR")}
              </span>
            )}
            {added && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(z.key);
                }}
                className={clsx(
                  "-mr-1 ml-0.5 rounded-full p-0.5",
                  active ? "hover:bg-paper/20" : "hover:bg-accent-soft"
                )}
              >
                <X size={12} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
