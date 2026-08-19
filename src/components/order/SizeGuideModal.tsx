"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Ruler, X } from "lucide-react";
import { getSizeGuide } from "@/lib/size-guides";
import type { ProductSize } from "@/lib/types";

export function SizeGuideModal({
  productSlug,
  productName,
  sizes,
}: {
  productSlug: string;
  productName?: string;
  sizes?: ProductSize[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fallbackGuide = getSizeGuide(productSlug);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const hasDynamicSizes = sizes && sizes.length > 0;
  const title = productName ?? fallbackGuide.label;

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-dark/60 p-6"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl italic">Guía de talles — {title}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-ink-soft hover:bg-accent-soft hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink-soft">
                  <th className="pb-2 font-medium">Talle</th>
                  <th className="pb-2 font-medium">Pecho (cm)</th>
                  <th className="pb-2 font-medium">Largo (cm)</th>
                </tr>
              </thead>
              <tbody>
                {hasDynamicSizes
                  ? sizes.map((s) => (
                      <tr key={s.id} className="border-b border-line/60 last:border-0">
                        <td className="py-2 font-medium">{s.size}</td>
                        <td className="py-2 text-ink-soft">{s.chest_cm ?? "—"}</td>
                        <td className="py-2 text-ink-soft">{s.length_cm ?? "—"}</td>
                      </tr>
                    ))
                  : fallbackGuide.rows.map((r) => (
                      <tr key={r.size} className="border-b border-line/60 last:border-0">
                        <td className="py-2 font-medium">{r.size}</td>
                        <td className="py-2 text-ink-soft">{r.chestCm}</td>
                        <td className="py-2 text-ink-soft">{r.lengthCm}</td>
                      </tr>
                    ))}
              </tbody>
            </table>

            <p className="mt-4 text-xs text-ink-soft">
              Pecho: medido de axila a axila. Largo: de hombro a bajo. Si estás
              entre dos talles, te recomendamos el más grande.
            </p>
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
        className="inline-flex items-center gap-1.5 text-xs text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-accent"
      >
        <Ruler size={13} /> Guía de talles
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  );
}
