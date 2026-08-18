"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SizeChartSection } from "./SizeChartSection";
import type { Product, ProductSize } from "@/lib/types";

export function SizeGuideModal({
  triggerLabel,
  title,
  subtitle,
  products,
  sizes,
}: {
  triggerLabel: string;
  title: string;
  subtitle: string;
  products: Product[];
  sizes: ProductSize[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-dark/70 p-4 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="grain max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-panel p-8 text-ink"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">Guía de talles</p>
                <h2 className="font-display text-3xl italic">{title}</h2>
                <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-full p-1.5 text-ink-soft hover:bg-ink/10 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <SizeChartSection products={products} sizes={sizes} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="link-underline hidden text-paper/70 transition-colors hover:text-paper sm:inline"
      >
        {triggerLabel}
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  );
}
