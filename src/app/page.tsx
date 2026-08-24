import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { ProductGrid } from "@/components/ProductGrid";
import { DesignGrid } from "@/components/DesignGrid";
import { WorkShowcase } from "@/components/WorkShowcase";
import { HeroImage } from "@/components/HeroImage";
import { getActiveProducts } from "@/lib/products";
import { getActiveDesigns } from "@/lib/designs";
import { getActiveWorks } from "@/lib/works";
import { getSiteSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site-url";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { EditableText } from "@/components/edit/EditableText";
import { EditableImage } from "@/components/edit/EditableImage";
import { EditableColor } from "@/components/edit/EditableColor";
import { EditModeBanner } from "@/components/edit/EditModeBanner";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const [products, designs, works, settings, canEdit, sp] = await Promise.all([
    getActiveProducts(),
    getActiveDesigns(),
    getActiveWorks(),
    getSiteSettings(),
    isAuthorizedAdmin(),
    searchParams,
  ]);
  const editing = canEdit && sp.edit === "1";
  const wantsEditButNotAllowed = sp.edit === "1" && !canEdit;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: settings.logo_text,
    description: settings.seo_description,
    url: SITE_URL,
    image: settings.hero_image_url ?? undefined,
    ...(settings.contact_email ? { email: settings.contact_email } : {}),
    ...(settings.contact_phone ? { telephone: settings.contact_phone } : {}),
    address: { "@type": "PostalAddress", addressCountry: "AR" },
    makesOffer: products.map((p) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: p.name, description: p.description ?? undefined },
      price: p.base_price,
      priceCurrency: "ARS",
    })),
  };

  const steps = [
    { n: "01", titleField: "step1_title", textField: "step1_text", title: settings.step1_title, text: settings.step1_text },
    { n: "02", titleField: "step2_title", textField: "step2_text", title: settings.step2_title, text: settings.step2_text },
    { n: "03", titleField: "step3_title", textField: "step3_text", title: settings.step3_title, text: settings.step3_text },
  ] as const;

  return (
    <EditModeProvider editing={editing}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <main className="flex-1">
        {/* Hero */}
        <Hero settings={settings} />

        <Marquee text={settings.marquee_text} />

        {/* Cómo funciona */}
        <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <Reveal>
            <h2 className="mb-8 font-display text-3xl sm:text-4xl italic tracking-tight">
              Cómo funciona
            </h2>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-3 lg:gap-12">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <span className="font-display text-5xl sm:text-6xl italic text-accent/30">{s.n}</span>
                <EditableText field={s.titleField} value={s.title} as="h3" className="mt-3 block font-display text-xl sm:text-2xl" />
                <EditableText field={s.textField} value={s.text} as="p" multiline className="mt-1.5 block text-sm text-ink-soft leading-relaxed" />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Catálogo */}
        <section id="catalogo" className="border-t border-line/70 bg-panel">
          <div className="mx-auto max-w-7xl px-6 py-24">
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

        <WorkShowcase
          works={works}
          perView={settings.works_per_view}
          autoplay={settings.works_autoplay ?? true}
          intervalSeconds={settings.works_interval_seconds ?? 5}
        />

        {/* Catálogo de diseños */}
        {designs.length > 0 && (
          <section id="disenos" className="border-t border-line/70">
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
              <Reveal>
                <div className="mb-10 flex items-end justify-between">
                  <div>
                    <h2 className="font-display text-4xl italic tracking-tight">
                      Catálogo de diseños
                    </h2>
                    <p className="mt-2 text-sm text-ink-soft">
                      Elegí uno de nuestros diseños o subí el tuyo propio al hacer tu pedido.
                    </p>
                  </div>
                  <Link
                    href="/pedido"
                    className="hidden sm:inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm hover:border-ink hover:bg-panel transition-colors"
                  >
                    Hacer pedido <ArrowUpRight size={15} />
                  </Link>
                </div>
              </Reveal>

              <DesignGrid designs={designs} maxItems={5} />

              <div className="mt-10 flex sm:hidden justify-center">
                <Link
                  href="/pedido"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm hover:border-ink hover:bg-panel transition-colors"
                >
                  Hacer pedido <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      {editing && <EditModeBanner />}
      {wantsEditButNotAllowed && (
        <div className="fixed inset-x-0 bottom-4 z-100 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full bg-accent px-5 py-3 text-sm text-paper shadow-xl">
            Necesitás iniciar sesión como admin para editar esta página.
            <Link href="/admin/login" className="rounded-full bg-paper/20 px-3 py-1.5 text-xs hover:bg-paper/30">
              Iniciar sesión
            </Link>
          </div>
        </div>
      )}
    </EditModeProvider>
  );
}
