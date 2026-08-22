import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DesignGrid } from "@/components/DesignGrid";
import { Reveal } from "@/components/Reveal";
import { getActiveDesigns } from "@/lib/designs";

export const metadata = {
  title: "Catálogo de diseños — Subli Me",
  description: "Explore nuestro completo catálogo de diseños para personalizar tus prendas",
};

export default async function DesignsPage() {
  const designs = await getActiveDesigns();

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="border-b border-line/70">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
            <Reveal>
              <Link
                href="/"
                className="mb-6 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors"
              >
                <ArrowLeft size={16} /> Volver
              </Link>
            </Reveal>

            <Reveal>
              <div>
                <h1 className="font-display text-4xl sm:text-5xl italic tracking-tight">
                  Catálogo de diseños
                </h1>
                <p className="mt-4 text-sm text-ink-soft max-w-2xl">
                  Elegí uno de nuestros diseños o subí el tuyo propio al hacer tu pedido. Filtrá por color o categoría para encontrar exactamente lo que buscás.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
          {designs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-ink-soft">No hay diseños disponibles en este momento.</p>
            </div>
          ) : (
            <DesignGrid designs={designs} />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
