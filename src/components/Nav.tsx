import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { ProcessModal } from "./ProcessModal";

export async function Nav() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center font-display text-2xl italic tracking-tight text-paper">
          {settings.logo_url ? (
            <Image src={settings.logo_url} alt={settings.logo_text} width={120} height={32} className="h-8 w-auto object-contain" />
          ) : (
            settings.logo_text
          )}
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link
            href="/#catalogo"
            className="link-underline hidden text-paper/70 transition-colors hover:text-paper sm:inline"
          >
            {settings.nav_catalog_label}
          </Link>
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
        </nav>
      </div>
    </header>
  );
}
