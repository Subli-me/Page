"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import clsx from "clsx";

export type UploadedImage = { url: string; publicId: string };

export function ImageUploader({
  value,
  onChange,
}: {
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Subí un archivo de imagen (JPG, PNG, etc).");
      return;
    }
    setIsUploading(true);
    try {
      const sigRes = await fetch("/api/upload-signature", { method: "POST" });
      const sig = await sigRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", sig.timestamp);
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      if (!res.ok) throw new Error("Falló la subida");
      const json = await res.json();
      onChange({ url: json.secure_url, publicId: json.public_id });
    } catch {
      setError("No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  if (value) {
    return (
      <div className="group relative overflow-hidden rounded-2xl border border-line">
        <div className="relative aspect-video sm:aspect-4/3">
          <Image src={value.url} alt="Tu diseño" fill className="object-contain bg-panel" />
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 text-paper opacity-0 transition-opacity hover:bg-ink group-hover:opacity-100"
        >
          <X size={16} />
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-x-0 bottom-0 bg-dark/70 py-2 text-center text-xs text-paper opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        >
          Cambiar imagen
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
          isDragging ? "border-accent bg-accent-soft/50" : "border-line hover:border-ink"
        )}
      >
        {isUploading ? (
          <Loader2 className="animate-spin text-accent" size={28} />
        ) : (
          <Upload className="text-ink-soft" size={28} strokeWidth={1.5} />
        )}
        <p className="text-sm text-ink-soft">
          {isUploading ? "Subiendo..." : "Arrastrá tu imagen o hacé click"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>
      {error && <p className="mt-3 text-center text-sm text-accent">{error}</p>}
    </div>
  );
}
