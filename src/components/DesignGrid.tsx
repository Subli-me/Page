"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { DesignCatalogItem } from "@/lib/types";
import { Reveal } from "./Reveal";

export function DesignGrid({ designs }: { designs: DesignCatalogItem[] }) {
  if (designs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
      {designs.map((d, i) => (
        <Reveal key={d.id} delay={i * 0.04}>
          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="group relative overflow-hidden rounded-2xl border border-line bg-paper aspect-square cursor-default"
          >
            <Image
              src={d.image_url}
              alt={d.name}
              fill
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-dark/80 px-3 py-2 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
              <p className="truncate text-[11px] font-medium text-paper">{d.name}</p>
            </div>
          </motion.div>
        </Reveal>
      ))}
    </div>
  );
}
