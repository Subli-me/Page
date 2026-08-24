"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, Loader2, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { MediaDisplay, isVideoUrl } from "../MediaDisplay";
import { checkDesignImage, type ImageWarning } from "@/lib/image-check";

export type UploadedImage = { url: string; publicId: string };

export function ImageUploader({
  value,
  onChange,
  accept = "image/*,video/*",
  label = "Arrastrá tu imagen o video, o hacé click",
  signatureEndpoint = "/api/upload-signature",
  checkWarnings = false,
}: {
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
  accept?: string;
  label?: string;
  /**
   * De dónde sacar la firma. Por defecto la pública, que es la del pedido.
   * El panel usa la de admin, que pide sesión y escribe en otra carpeta.
   */
  signatureEndpoint?: string;
  /**
   * Revisar resolución y fondo del archivo. Se usa en el pedido, donde el
   * archivo termina impreso; no en el panel, donde se suben fotos y mockups.
   */
  checkWarnings?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ImageWarning[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setWarnings([]);

    // Avisamos lo que puede salir mal en la prenda, pero no frenamos: hay
    // disenos que a proposito llevan fondo o son chicos.
    if (checkWarnings) checkDesignImage(file).then(setWarnings);
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Subí un archivo válido de imagen o video (JPG, PNG, MP4, WEBM, etc).");
      return;
    }
    setIsUploading(true);
    try {
      const sigRes = await fetch(signatureEndpoint, { method: "POST" });
      const sig = await sigRes.json();
      if (!sigRes.ok) throw new Error(sig.error ?? "No se pudo subir");

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", sig.timestamp);
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);
      // Va firmado, así que tiene que viajar tal cual vino.
      if (sig.allowed_formats) form.append("allowed_formats", sig.allowed_formats);

      const resourceType = isVideo ? "video" : "auto";

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
        { method: "POST", body: form }
      );
      if (!res.ok) throw new Error("Falló la subida");
      const json = await res.json();
      onChange({ url: json.secure_url, publicId: json.public_id });
    } catch (e) {
      setError(e instanceof Error && e.message !== "No se pudo subir"
        ? e.message
        : "No se pudo subir el archivo. Probá de nuevo.");
    } finally {
      setIsUploading(false);
    }
  }, [onChange, signatureEndpoint, checkWarnings]);

  const avisos = warnings.length > 0 && (
    <div className="mt-3 space-y-2">
      {warnings.map((w) => (
        <div
          key={w.kind}
          className="flex gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5"
        >
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="text-xs font-medium text-ink">{w.title}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{w.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (value) {
    return (
      <div>
      <div className="group relative overflow-hidden rounded-2xl border border-line">
        <div className="relative aspect-video sm:aspect-4/3">
          <MediaDisplay src={value.url} alt="Portada de la prenda" className="object-contain bg-panel" />
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
          Cambiar archivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>
      {avisos}
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
          {isUploading ? "Subiendo..." : label}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>
      {error && <p className="mt-3 text-center text-sm text-accent">{error}</p>}
      {avisos}
    </div>
  );
}

