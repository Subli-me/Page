import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { getActiveProducts, getAllProductSizes } from "@/lib/products";
import { ProcessModal } from "./ProcessModal";
import { SizeGuideModal } from "./SizeGuideModal";
import { EditableText } from "./edit/EditableText";
import { CartButton } from "./CartButton";
import { MobileMenu } from "./MobileMenu";

import Image from "next/image";

// En el celular los enlaces ocupan una fila entera cada uno, con altura de dedo.
const enlaceCelular =
  "rounded-lg px-3 py-3 text-left text-base text-paper/80 transition-colors hover:bg-paper/10 hover:text-paper";

export async function Nav() {
  const [settings, products] = await Promise.all([getSiteSettings(), getActiveProducts()]);
  const sizes = await getAllProductSizes(products.map((p) => p.id));

  const talles = {
    triggerLabel: settings.nav_talles_label,
    title: settings.talles_title,
    subtitle: settings.talles_subtitle,
    products,
    sizes,
  };

  const proceso = {
    triggerLabel: settings.nav_process_label,
    title: settings.process_title,
    subtitle: settings.process_subtitle,
    steps: [
      { title: settings.process_step1_title, text: settings.process_step1_text },
      { title: settings.process_step2_title, text: settings.process_step2_text },
      { title: settings.process_step3_title, text: settings.process_step3_text },
      { title: settings.process_step4_title, text: settings.process_step4_text },
    ],
    careTitle: settings.care_title,
    careText: settings.care_text,
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-dark/90 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
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

          <nav className="hidden items-center gap-8 text-sm sm:flex">
            <Link href="/#catalogo" className="link-underline text-paper/70 transition-colors hover:text-paper">
              <EditableText field="nav_catalog_label" value={settings.nav_catalog_label} as="span" />
            </Link>
            <SizeGuideModal {...talles} />
            <ProcessModal {...proceso} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <CartButton />

          {/* En el celular el botón principal vive dentro del desplegable: en
              320px de ancho no entra junto al logo, al carrito y al menú. */}
          <Link
            href="/pedido"
            className="group hidden items-center gap-1.5 rounded-full bg-lime px-5 py-2.5 font-medium text-dark transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            {settings.hero_cta_label}
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>

          <MobileMenu>
            <Link
              href="/pedido"
              className="mb-2 flex items-center justify-center gap-1.5 rounded-full bg-lime px-5 py-3 font-medium text-dark"
            >
              {settings.hero_cta_label}
              <ArrowUpRight size={16} />
            </Link>

            <Link href="/#catalogo" className={enlaceCelular}>
              {settings.nav_catalog_label}
            </Link>
            <SizeGuideModal {...talles} triggerClassName={enlaceCelular} />
            <ProcessModal {...proceso} triggerClassName={enlaceCelular} />
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
