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
      {/*
        La ficha que leen los buscadores. Va dentro de una etiqueta `script`, y
        ahí el navegador corta al ver `</script>` aunque esté en medio de un
        texto. Un nombre de prenda con esa secuencia adentro cerraría la etiqueta
        antes de tiempo y lo que siguiera se ejecutaría como código.

        Cambiando cada `<` por su forma escapada, el contenido sigue siendo el
        mismo texto —JSON las entiende igual— pero ya no queda ningún `<` que
        pueda cerrar nada.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Nav />

      <main className="flex-1">
        {/* Hero */}
        <Hero settings={settings} />

        <Marquee text={settings.marquee_text} />

        {/* Cómo funciona */}
        <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <Reveal>
            <EditableText
              field="steps_title"
              value={settings.steps_title}
              as="h2"
              className="mb-8 block font-display text-3xl sm:text-4xl italic tracking-tight"
            />
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
                <EditableText
                  field="catalog_title"
                  value={settings.catalog_title}
                  as="h2"
                  className="font-display text-4xl italic tracking-tight"
                />
                <span className="text-sm text-ink-soft">
                  {products.length} prenda{products.length !== 1 ? "s" : ""}
                </span>
              </div>
            </Reveal>

            <ProductGrid products={products} ctaLabel={settings.product_cta_label} />
          </div>
        </section>

        <WorkShowcase
          works={works}
          perView={settings.works_per_view}
          autoplay={settings.works_autoplay ?? true}
          intervalSeconds={settings.works_interval_seconds ?? 5}
          title={settings.works_title}
          subtitle={settings.works_subtitle}
        />

        {/* Catálogo de diseños */}
        {designs.length > 0 && (
          <section id="disenos" className="border-t border-line/70">
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
              <Reveal>
                <div className="mb-10 flex items-end justify-between">
                  <div>
                    <EditableText
                      field="designs_title"
                      value={settings.designs_title}
                      as="h2"
                      className="font-display text-4xl italic tracking-tight"
                    />
                    <EditableText
                      field="designs_subtitle"
                      value={settings.designs_subtitle}
                      as="p"
                      multiline
                      className="mt-2 block text-sm text-ink-soft"
                    />
                  </div>
                  <Link
                    href="/pedido"
                    className="hidden sm:inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm hover:border-ink hover:bg-panel transition-colors"
                  >
                    {settings.designs_cta_label} <ArrowUpRight size={15} />
                  </Link>
                </div>
              </Reveal>

              <DesignGrid
                designs={designs}
                maxItems={5}
                colorLabel={settings.filter_color_label}
                categoryLabel={settings.filter_category_label}
                moreLabel={settings.designs_more_label}
              />

              <div className="mt-10 flex sm:hidden justify-center">
                <Link
                  href="/pedido"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm hover:border-ink hover:bg-panel transition-colors"
                >
                  {settings.designs_cta_label} <ArrowUpRight size={15} />
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
