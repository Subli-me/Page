"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SiteSettings } from "@/lib/types";
import { EditableText } from "./edit/EditableText";

const HERO_IMAGES = [
  "/hero-1.png",
  "/hero-2.jpg",
  "/hero-3.png",
];

interface HeroProps {
  settings: SiteSettings;
}

export function Hero({ settings }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-dark text-paper flex items-center justify-center">
      {/* Carrusel de imágenes de fondo */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${HERO_IMAGES[currentIndex]})` }}
          />
        </AnimatePresence>

        {/* Overlay oscuro para garantizar la legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/75 to-dark/40 sm:from-dark/95 sm:via-dark/80 sm:to-dark/50" />
      </div>

      {/* Contenido principal (Texto, Badge y Botones) */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 w-full">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-paper/20 bg-dark/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-lime backdrop-blur-sm">
          {settings.hero_badge}
        </p>
        
        <h1 className="max-w-3xl font-display text-5xl leading-[1.02] tracking-tight text-paper sm:text-7xl md:text-8xl drop-shadow-md">
          {settings.hero_title_line1}
          <br />
          <span className="italic text-accent">{settings.hero_title_line2}</span>
        </h1>
        
        <p className="mt-8 max-w-md text-base sm:text-lg text-paper/80 font-light drop-shadow">
          {settings.hero_subtitle}
        </p>
        
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/pedido"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 font-medium text-paper transition-all hover:bg-accent/90 hover:-translate-y-0.5 shadow-lg"
          >
            {settings.hero_cta_label}
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
          
          <Link
            href="#catalogo"
            className="link-underline inline-flex items-center gap-2 px-2 py-4 text-paper/90 hover:text-paper font-medium"
          >
            <EditableText
              field="hero_secondary_cta_label"
              value={settings.hero_secondary_cta_label}
            />
          </Link>
        </div>
      </div>

      {/* Botones de navegación del carrusel */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={handlePrev}
          aria-label="Imagen anterior"
          className="rounded-full border border-paper/20 bg-dark/60 p-3 text-paper backdrop-blur-md transition hover:bg-dark/90 hover:border-paper/40"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-1.5 px-2">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? "w-7 bg-lime" : "w-2.5 bg-paper/40 hover:bg-paper/70"
              }`}
              aria-label={`Ir a imagen ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          aria-label="Siguiente imagen"
          className="rounded-full border border-paper/20 bg-dark/60 p-3 text-paper backdrop-blur-md transition hover:bg-dark/90 hover:border-paper/40"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
