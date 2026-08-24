"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { ImageUploader, type UploadedImage } from "@/components/order/ImageUploader";

/**
 * Fotos del carrusel del hero.
 *
 * Antes eran tres archivos escritos en el código: cambiar la foto principal del
 * sitio obligaba a reemplazarlos y volver a publicar. Si no hay ninguna
 * cargada, el hero sigue mostrando esas, así que la sección nunca queda vacía.
 */
export function HeroImagesAdmin({
  initial,
  onSave,
}: {
  initial: { url: string }[];
  onSave: (imagenes: { url: string }[]) => void;
}) {
  const [imagenes, setImagenes] = useState(initial);
  const [subiendo, setSubiendo] = useState(false);

  function aplicar(siguientes: { url: string }[]) {
    setImagenes(siguientes);
    onSave(siguientes);
  }

  function agregar(img: UploadedImage | null) {
    if (!img) return;
    setSubiendo(true);
    aplicar([...imagenes, { url: img.url }]);
    setSubiendo(false);
  }

  function mover(i: number, dir: -1 | 1) {
    const destino = i + dir;
    if (destino < 0 || destino >= imagenes.length) return;
    const siguientes = [...imagenes];
    const [movida] = siguientes.splice(i, 1);
    siguientes.splice(destino, 0, movida);
    aplicar(siguientes);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-ink-soft">
        Se van pasando solas en la portada. Si no cargás ninguna, se muestran
        las que trae el sitio.
      </p>

      {imagenes.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {imagenes.map((img, i) => (
            <div key={img.url + i} className="w-32">
              <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-accent-soft">
                <Image src={img.url} alt={`Foto ${i + 1}`} fill sizes="128px" className="object-cover" />
                <span className="absolute left-1 top-1 rounded-full bg-dark/70 px-1.5 text-[10px] text-paper">
                  {i + 1}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    aria-label="Mover antes"
                    className="rounded p-1 text-ink-soft hover:text-accent disabled:opacity-20"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === imagenes.length - 1}
                    aria-label="Mover después"
                    className="rounded p-1 text-ink-soft hover:text-accent disabled:opacity-20"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => aplicar(imagenes.filter((_, x) => x !== i))}
                  aria-label="Quitar"
                  className="rounded p-1 text-ink-soft hover:text-accent"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-sm">
        <ImageUploader
          value={null}
          onChange={agregar}
          accept="image/*"
          signatureEndpoint="/api/admin/upload-signature"
          label={subiendo ? "Subiendo..." : "Agregar una foto al carrusel"}
        />
      </div>
    </div>
  );
}
