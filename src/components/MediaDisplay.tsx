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
}

export function MediaDisplay({ src, alt = "", fill = true, className = "object-cover", fallbackIcon }: MediaDisplayProps) {
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
        className={className}
        style={fill ? { position: "absolute", height: "100%", width: "100%", inset: 0 } : undefined}
      />
    );
  }

  return <Image src={src} alt={alt} fill={fill} className={className} />;
}
