import Link from "next/link";
import { Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { EditableText } from "./edit/EditableText";
import { FooterNewsletter } from "./FooterNewsletter";

export async function Footer() {
  const settings = await getSiteSettings();

  const infoLinks = settings.footer_info_links ?? [];
  const categoryLinks = settings.footer_categories_links ?? [];

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
            <div className="flex items-center gap-4 pt-1 flex-wrap">
              {(settings.footer_social_links ?? []).map((social, idx) => {
                const isInstagram = social.platform.toLowerCase() === "instagram";
                const isFacebook = social.platform.toLowerCase() === "facebook";
                const isTikTok = social.platform.toLowerCase() === "tiktok";
                const isTwitter = social.platform.toLowerCase() === "twitter" || social.platform.toLowerCase() === "x";
                const isYouTube = social.platform.toLowerCase() === "youtube";
                const isWhatsApp = social.platform.toLowerCase() === "whatsapp";

                return (
                  <Link
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/50 transition-colors hover:text-white"
                    aria-label={social.label || social.platform}
                  >
                    {isInstagram && (
                      <svg className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                    )}
                    {isFacebook && (
                      <svg className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    )}
                    {isTikTok && (
                      <svg className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                      </svg>
                    )}
                    {isTwitter && (
                      <svg className="h-5 w-5 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    )}
                    {isYouTube && (
                      <svg className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                      </svg>
                    )}
                    {isWhatsApp && (
                      <svg className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    )}
                    {!isInstagram && !isFacebook && !isTikTok && !isTwitter && !isYouTube && !isWhatsApp && (
                      <span className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors uppercase tracking-wider">{social.label || social.platform}</span>
                    )}
                  </Link>
                );
              })}
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
              {infoLinks.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="group flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Categorías */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wide text-white">Categorías</h3>
            <nav className="flex flex-col gap-2.5">
              {categoryLinks.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  <span>{item.label}</span>
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
