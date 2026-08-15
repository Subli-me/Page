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
          <div className="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-16 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:pt-28 sm:pb-24">
            <div>
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-paper/20 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-lime">
                {settings.hero_badge}
              </p>
              <h1 className="font-display text-6xl leading-[0.95] tracking-tight sm:text-7xl">
                {settings.hero_title_line1}
                <br />
                <span className="italic text-lime">{settings.hero_title_line2}</span>
              </h1>
              <p className="mt-8 max-w-md text-lg text-paper/60">{settings.hero_subtitle}</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/pedido"
                  className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-4 font-medium text-dark transition-transform hover:-translate-y-0.5"
                >
                  {settings.hero_cta_label}
                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
                <Link
                  href="#catalogo"
                  className="link-underline inline-flex items-center gap-2 px-2 py-4 text-paper/80"
                >
                  Ver prendas
                </Link>
              </div>
            </div>

            {settings.hero_image_url && (
              <HeroImage src={settings.hero_image_url} alt={settings.hero_title_line1} />
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
