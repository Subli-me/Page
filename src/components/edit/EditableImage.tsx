"use client";

import { useRef, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { useEditMode } from "@/contexts/EditModeContext";
import type { SiteSettings } from "@/lib/types";

export function EditableImage({
  field,
  children,
  className,
}: {
  field: keyof SiteSettings;
  children: React.ReactNode;
  className?: string;
}) {
  const editing = useEditMode();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!editing) return <div className={className}>{children}</div>;

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const sigRes = await fetch("/api/admin/upload-signature", { method: "POST" });
      const sig = await sigRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", sig.timestamp);
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();

      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: json.secure_url }),
      });
      // La forma más simple de reflejar la imagen nueva sin manejar estado
      // duplicado: recargar. El resto de los cambios de texto no se pierden
      // porque cada uno ya se guardó solo al perder el foco.
      window.location.reload();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`group relative ${className ?? ""}`}>
      {children}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 flex items-center justify-center bg-dark/0 opacity-0 transition-all group-hover:bg-dark/50 group-hover:opacity-100"
      >
        <span className="flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Pencil size={13} />}
          {uploading ? "Subiendo..." : "Cambiar imagen"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
