"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function HeroImage({ src, alt }: { src: string; alt: string }) {
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
    </motion.div>
  );
}
