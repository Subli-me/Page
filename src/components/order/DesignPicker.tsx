"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Check } from "lucide-react";
import type { DesignCatalogItem } from "@/lib/types";
import { ImageUploader, type UploadedImage } from "./ImageUploader";

type Tab = "upload" | "catalog";

export function DesignPicker({
  designs,
  value,
  onChange,
}: {
  designs: DesignCatalogItem[];
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
}) {
  const [tab, setTab] = useState<Tab>("upload");

  if (designs.length === 0) {
    // Sin catálogo cargado, solo se puede subir imagen propia.
    return <ImageUploader value={value} onChange={onChange} />;
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-full border border-line p-1 text-sm">
        {([
          ["upload", "Subir mi imagen"],
          ["catalog", "Elegir del catálogo"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={clsx(
              "rounded-full px-4 py-1.5 transition-colors",
              tab === key ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <ImageUploader value={value} onChange={onChange} />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {designs.map((d) => {
            const selected = value?.publicId === d.image_public_id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onChange({ url: d.image_url, publicId: d.image_public_id })}
                className={clsx(
                  "relative aspect-square overflow-hidden rounded-xl border-2 bg-accent-soft transition-colors",
                  selected ? "border-accent" : "border-transparent hover:border-line"
                )}
              >
                <Image src={d.image_url} alt={d.name} fill className="object-contain p-2" />
                {selected && (
                  <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-paper">
                    <Check size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
