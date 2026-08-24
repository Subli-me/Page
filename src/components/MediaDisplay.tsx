"use client";

import Image from "next/image";

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v", ".avi"];
  const lower = url.toLowerCase();
  if (videoExtensions.some((ext) => lower.includes(ext))) return true;
  if (lower.includes("/video/upload/")) return true;
  return false;
}

interface MediaDisplayProps {
  src: string | null | undefined;
  alt?: string;
  fill?: boolean;
  className?: string;
  fallbackIcon?: React.ReactNode;
  /**
   * Estorbar el copiado casual: sin menú contextual ni arrastre, y sin la
   * opción de descarga en el reproductor.
   *
   * Solo en las vistas públicas. En el panel molesta: ahí uno sí quiere poder
   * abrir el archivo en otra pestaña.
   */
  protect?: boolean;
}

export function MediaDisplay({ src, alt = "", fill = true, className = "object-cover", fallbackIcon, protect }: MediaDisplayProps) {
  if (!src) {
    return fallbackIcon ? <>{fallbackIcon}</> : null;
  }

  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        // El reproductor no muestra controles, pero el menú del navegador
        // ofrece "Guardar video como" igual.
        controlsList={protect ? "nodownload" : undefined}
        disablePictureInPicture={protect}
        onContextMenu={protect ? (e) => e.preventDefault() : undefined}
        className={className}
        style={fill ? { position: "absolute", height: "100%", width: "100%", inset: 0 } : undefined}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      draggable={protect ? false : undefined}
      onContextMenu={protect ? (e) => e.preventDefault() : undefined}
      className={protect ? `${className} select-none [-webkit-touch-callout:none]` : className}
    />
  );
}
