import Link from "next/link";
import { Instagram, Facebook, Music2, Twitter, Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { EditableText } from "./edit/EditableText";
import { FooterNewsletter } from "./FooterNewsletter";

export async function Footer() {
  const settings = await getSiteSettings();

  const infoLinks = [
    { field: "footer_nav_inicio" as const, href: "/", label: settings.footer_nav_inicio },
    { field: "footer_nav_productos" as const, href: "/#productos", label: settings.footer_nav_productos },
    { field: "footer_nav_personalizadas" as const, href: "/pedido", label: settings.footer_nav_personalizadas },
    { field: "footer_nav_beneficios" as const, href: "/#beneficios", label: settings.footer_nav_beneficios },
    { field: "footer_nav_talles" as const, href: "/#talles", label: settings.footer_nav_talles },
    { field: "footer_nav_politica" as const, href: "/#politica", label: settings.footer_nav_politica },
    { field: "footer_nav_contacto" as const, href: "/#contacto", label: settings.footer_nav_contacto },
  ];

  const categoryLinks = [
    { field: "footer_cat_remeras" as const, href: "/#remeras", label: settings.footer_cat_remeras },
    { field: "footer_cat_buzos" as const, href: "/#buzos", label: settings.footer_cat_buzos },
    { field: "footer_cat_medias" as const, href: "/#medias", label: settings.footer_cat_medias },
    { field: "footer_cat_gorras" as const, href: "/#gorras", label: settings.footer_cat_gorras },
    { field: "footer_cat_totebag" as const, href: "/#totebag", label: settings.footer_cat_totebag },
    { field: "footer_cat_combos" as const, href: "/#combos", label: settings.footer_cat_combos },
    { field: "footer_cat_bermudas" as const, href: "/#bermudas", label: settings.footer_cat_bermudas },
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="font-display text-2xl font-black italic tracking-tight uppercase">
              {settings.logo_text}
              <span className="text-[var(--accent)]">™</span>
            </Link>

            <EditableText
              field="footer_description"
              value={settings.footer_description}
              as="p"
              multiline
              className="text-sm leading-relaxed text-white/60"
            />

            {/* Social icons */}
            <div className="flex items-center gap-4 pt-1">
              <Link
                href={settings.footer_instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href={settings.footer_facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </Link>
              <Link
                href={settings.footer_tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 transition-colors hover:text-white"
                aria-label="TikTok"
              >
                <Music2 size={18} />
              </Link>
              <Link
                href={settings.footer_twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 transition-colors hover:text-white"
                aria-label="Twitter / X"
              >
                <Twitter size={18} />
              </Link>
            </div>

            {/* Contact info */}
            <div className="flex flex-col gap-2 pt-2">
              <EditableText
                field="footer_phone"
                value={settings.footer_phone}
                as="p"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors"
              />
              {settings.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
                >
                  <Mail size={14} />
                  {settings.contact_email}
                </a>
              )}
              <EditableText
                field="footer_address"
                value={settings.footer_address}
                as="p"
                className="flex items-center gap-2 text-sm text-white/60"
              />
            </div>
          </div>

          {/* Col 2 — Información */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wide text-white">Información</h3>
            <nav className="flex flex-col gap-2.5">
              {infoLinks.map(({ field, href, label }) => (
                <Link
                  key={field}
                  href={href}
                  className="group flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                >
                  <EditableText field={field} value={label} as="span" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Categorías */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wide text-white">Categorías</h3>
            <nav className="flex flex-col gap-2.5">
              {categoryLinks.map(({ field, href, label }) => (
                <Link
                  key={field}
                  href={href}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  <EditableText field={field} value={label} as="span" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 4 — Newsletter */}
          <div className="flex flex-col gap-4">
            <EditableText
              field="footer_newsletter_title"
              value={settings.footer_newsletter_title}
              as="h3"
              className="text-sm font-semibold tracking-wide text-white"
            />
            <EditableText
              field="footer_newsletter_subtitle"
              value={settings.footer_newsletter_subtitle}
              as="p"
              multiline
              className="text-sm leading-relaxed text-white/60"
            />
            <FooterNewsletter />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {settings.logo_text} —{" "}
            <EditableText field="footer_copyright_suffix" value={settings.footer_copyright_suffix} as="span" />
          </p>
          <EditableText field="footer_tagline" value={settings.footer_tagline} as="p" />
        </div>
      </div>
    </footer>
  );
}
