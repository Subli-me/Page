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
    <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, i) => (
        <Reveal key={p.id} delay={i * 0.08}>
          <Link href={`/pedido?producto=${p.slug}`} className="group block">
            <motion.div
              whileHover={{ rotate: i % 2 === 0 ? -1.5 : 1.5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-accent-soft"
            >
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Shirt size={56} strokeWidth={1} className="text-accent" />
                </div>
              )}
              <div className="absolute right-4 top-4 flex h-10 w-10 -translate-y-2 items-center justify-center rounded-full bg-dark text-lime opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight size={18} />
              </div>
              <span className="absolute left-4 top-4 rounded-full bg-dark/85 px-3 py-1 text-xs text-paper">
                DTF
              </span>
            </motion.div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl italic">{p.name}</h3>
                {p.description && (
                  <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
                )}
              </div>
              <span className="whitespace-nowrap font-medium">
                ${p.base_price.toLocaleString("es-AR")}
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
