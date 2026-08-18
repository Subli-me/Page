"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shirt, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { Reveal } from "./Reveal";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="text-ink-soft">
        Todavía no hay prendas cargadas. Agregalas desde el panel admin.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-5">
      {products.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.05}>
          <Link href={`/pedido?producto=${p.slug}`} className="group block">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-accent-soft"
            >
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-108"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Shirt size={44} strokeWidth={1} className="text-accent" />
                </div>
              )}
              <div className="absolute right-3 top-3 flex h-8 w-8 -translate-y-2 items-center justify-center rounded-full bg-dark text-lime opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight size={15} />
              </div>
              <span className="absolute left-3 top-3 rounded-full bg-dark/85 px-2.5 py-0.5 text-[11px] font-medium text-paper">
                DTF
              </span>
            </motion.div>
            <div className="mt-3">
              <h3 className="font-display text-base sm:text-lg italic text-ink group-hover:text-accent transition-colors line-clamp-1">
                {p.name}
              </h3>
              {p.description && (
                <p className="mt-0.5 text-xs text-ink-soft line-clamp-1">{p.description}</p>
              )}
              <div className="mt-1 flex items-center justify-between">
                <span className="font-medium text-sm sm:text-base">
                  ${p.base_price.toLocaleString("es-AR")}
                </span>
                <span className="text-[11px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Elegir →
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
