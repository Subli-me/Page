"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function HeroImage({
  src,
  alt,
  logoUrl,
  logoAlt,
}: {
  src: string;
  alt: string;
  logoUrl?: string | null;
  logoAlt?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24, rotate: 3 }}
      animate={{ opacity: 1, x: 0, rotate: 2 }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-paper/10 shadow-2xl shadow-black/40 sm:max-w-none"
    >
      <Image src={src} alt={alt} fill priority className="object-cover" sizes="(min-width: 640px) 40vw, 90vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-lime px-3 py-1 text-xs font-medium text-dark">
        Hecho con DTF
      </span>

      {logoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: -8 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-4 right-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-paper/80 bg-paper p-2 shadow-xl sm:h-28 sm:w-28"
        >
          <Image
            src={logoUrl}
            alt={logoAlt ?? "Logo"}
            width={200}
            height={200}
            className="h-full w-full rounded-full object-contain"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
