import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { getActiveProducts, getAllProductSizes } from "@/lib/products";
import { ProcessModal } from "./ProcessModal";
import { SizeGuideModal } from "./SizeGuideModal";
import { EditableText } from "./edit/EditableText";

import Image from "next/image";

export async function Nav() {
  const [settings, products] = await Promise.all([getSiteSettings(), getActiveProducts()]);
  const sizes = await getAllProductSizes(products.map((p) => p.id));

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-dark/90 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/" className="group block transition-transform duration-200 hover:scale-105">
            <Image
              src="/sublime-title.png"
              alt="Subli Me"
              width={694}
              height={246}
              className="h-8 sm:h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="flex items-center gap-8 text-sm">
            <Link
              href="/#catalogo"
              className="link-underline hidden text-paper/70 transition-colors hover:text-paper sm:inline"
            >
              <EditableText field="nav_catalog_label" value={settings.nav_catalog_label} as="span" />
            </Link>
            <SizeGuideModal
              triggerLabel={settings.nav_talles_label}
              title={settings.talles_title}
              subtitle={settings.talles_subtitle}
              products={products}
              sizes={sizes}
            />
            <ProcessModal
              triggerLabel={settings.nav_process_label}
              title={settings.process_title}
              subtitle={settings.process_subtitle}
              steps={[
                { title: settings.process_step1_title, text: settings.process_step1_text },
                { title: settings.process_step2_title, text: settings.process_step2_text },
                { title: settings.process_step3_title, text: settings.process_step3_text },
                { title: settings.process_step4_title, text: settings.process_step4_text },
              ]}
              careTitle={settings.care_title}
              careText={settings.care_text}
            />
          </nav>
        </div>

        <Link
          href="/pedido"
          className="group inline-flex items-center gap-1.5 rounded-full bg-lime px-5 py-2.5 font-medium text-dark transition-transform hover:-translate-y-0.5"
        >
          {settings.hero_cta_label}
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </header>
  );
}
