import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { ProductGrid } from "@/components/ProductGrid";
import { HeroImage } from "@/components/HeroImage";
import { getActiveProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";

import Image from "next/image";

export default async function Home() {
  const [products, settings] = await Promise.all([getActiveProducts(), getSiteSettings()]);

  const steps = [
    { n: "01", title: settings.step1_title, text: settings.step1_text },
    { n: "02", title: settings.step2_title, text: settings.step2_text },
    { n: "03", title: settings.step3_title, text: settings.step3_text },
  ];

  return (
    <>
      <Nav />

      <main className="flex-1">
        {/* Hero */}
        <section className="grain bg-dark text-paper">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-16 text-center sm:pt-24 sm:pb-24">
            {/* Badge */}
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-paper/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-lime">
              {settings.hero_badge}
            </p>

            {/* Logo de la empresa en la parte central como título */}
            <div className="mb-6 flex items-center justify-center">
              {settings.logo_url ? (
                <div className="relative h-20 w-64 sm:h-28 sm:w-80">
                  <Image
                    src={settings.logo_url}
                    alt={settings.logo_text || "Subli-me"}
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              ) : (
                <h1 className="font-display text-6xl tracking-tight sm:text-8xl md:text-9xl">
                  <span className="text-paper">Subli</span>
                  <span className="text-lime">-</span>
                  <span className="italic text-lime">me</span>
                </h1>
              )}
            </div>

            {/* Título secundario / eslogan */}
            <h2 className="max-w-2xl font-display text-2xl leading-tight tracking-tight text-paper/90 sm:text-4xl">
              {(!settings.hero_title_line1 || settings.hero_title_line1 === "Tu diseño,")
                ? "Bajo"
                : settings.hero_title_line1}{" "}
              <span className="italic text-lime">
                {(!settings.hero_title_line2 || settings.hero_title_line2 === "en tu prenda.")
                  ? "presión"
                  : settings.hero_title_line2}
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base text-paper/70 sm:text-lg">
              {settings.hero_subtitle}
            </p>

            {/* Botones de acción */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pedido"
                className="group inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 font-medium text-dark transition-transform hover:-translate-y-0.5"
              >
                {settings.hero_cta_label}
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <Link
                href="#catalogo"
                className="link-underline inline-flex items-center gap-2 px-4 py-4 text-paper/80 hover:text-paper"
              >
                Ver prendas
              </Link>
            </div>

            {/* Imagen destacada centrada */}
            {settings.hero_image_url && (
              <div className="mt-12 w-full max-w-md sm:max-w-lg">
                <HeroImage
                  src={settings.hero_image_url}
                  alt={settings.hero_title_line1}
                  logoUrl={settings.logo_url}
                  logoAlt={settings.logo_text}
                />
              </div>
            )}
          </div>
        </section>

        <Marquee text={settings.marquee_text} />

        {/* Cómo funciona */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <h2 className="mb-14 font-display text-4xl italic tracking-tight">
              Cómo funciona
            </h2>
          </Reveal>
          <div className="grid gap-12 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <span className="font-display text-6xl italic text-accent/30">{s.n}</span>
                <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Catálogo */}
        <section id="catalogo" className="border-t border-line/70 bg-panel">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <div className="mb-12 flex items-end justify-between">
                <h2 className="font-display text-4xl italic tracking-tight">Catálogo</h2>
                <span className="text-sm text-ink-soft">
                  {products.length} prenda{products.length !== 1 ? "s" : ""}
                </span>
              </div>
            </Reveal>

            <ProductGrid products={products} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
