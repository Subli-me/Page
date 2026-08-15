"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Step = { title: string; text: string };

export function ProcessModal({
  triggerLabel,
  title,
  subtitle,
  steps,
  careTitle,
  careText,
}: {
  triggerLabel: string;
  title: string;
  subtitle: string;
  steps: Step[];
  careTitle: string;
  careText: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Bloquea el scroll del body mientras el modal está abierto.
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
            className="grain max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-dark p-8 text-paper"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-lime">El proceso</p>
                <h2 className="font-display text-3xl italic">{title}</h2>
                <p className="mt-2 text-sm text-paper/60">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-full p-1.5 text-paper/60 hover:bg-paper/10 hover:text-paper"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
                  className="flex gap-4"
                >
                  <span className="font-display text-3xl italic text-paper/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="mt-1 text-sm text-paper/60">{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-paper/10 p-5">
              <h3 className="font-display text-lg italic">{careTitle}</h3>
              <p className="mt-2 text-sm text-paper/60">{careText}</p>
            </div>
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
