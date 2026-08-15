import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { ProductGrid } from "@/components/ProductGrid";
import { getActiveProducts } from "@/lib/products";

const STEPS = [
  {
    n: "01",
    title: "Elegí la prenda",
    text: "Remera, buzo o chomba. Talle y color a tu gusto.",
  },
  {
    n: "02",
    title: "Subí tu imagen",
    text: "Marcá en qué parte de la prenda querés el estampado.",
  },
  {
    n: "03",
    title: "Lo imprimimos",
    text: "Recibimos tu pedido y lo mandamos directo a producción.",
  },
];

export default async function Home() {
  const products = await getActiveProducts();

  return (
    <>
      <Nav />

      <main className="flex-1">
        {/* Hero */}
        <section className="grain bg-dark text-paper">
          <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-paper/20 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-lime">
              Estampado DTF a medida
            </p>
            <h1 className="max-w-4xl font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl">
              Tu diseño,
              <br />
              <span className="italic text-outline">en tu</span>{" "}
              <span className="italic text-lime">prenda.</span>
            </h1>
            <p className="mt-8 max-w-md text-lg text-paper/60">
              Subí tu imagen, elegí la prenda y dónde va el estampado. Nosotros
              nos encargamos de imprimirlo y hacerlo realidad.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/pedido"
                className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-4 font-medium text-dark transition-transform hover:-translate-y-0.5"
              >
                Crear mi diseño
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
        </section>

        <Marquee text="REMERAS · BUZOS · CHOMBAS · DTF" />

        {/* Cómo funciona */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <h2 className="mb-14 font-display text-4xl italic tracking-tight">
              Cómo funciona
            </h2>
          </Reveal>
          <div className="grid gap-12 sm:grid-cols-3">
            {STEPS.map((s, i) => (
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
