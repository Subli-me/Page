"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { EditableText } from "./EditableText";
import { EditableColor } from "./EditableColor";
import { ImageUploader, type UploadedImage } from "@/components/order/ImageUploader";

export function SiteSettingsAdmin({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial);

  async function save<K extends keyof SiteSettings>(field: K, value: SiteSettings[K]) {
    setSettings((prev) => ({ ...prev, [field]: value }));
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  const logoImage: UploadedImage | null = settings.logo_url
    ? { url: settings.logo_url, publicId: "" }
    : null;

  return (
    <div className="space-y-12">
      <Section title="Marca">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Nombre / logo en texto" value={settings.logo_text} onSave={(v) => save("logo_text", v)} />
          <EditableText label="Emoji del favicon" value={settings.favicon_emoji ?? ""} onSave={(v) => save("favicon_emoji", v)} />
        </div>
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium">
            Logo en imagen (opcional — si lo subís, reemplaza al texto en la barra de navegación)
          </p>
          <ImageUploader
            value={logoImage}
            onChange={(img) => save("logo_url", img?.url ?? null)}
          />
        </div>
      </Section>

      <Section title="Colores de marca">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableColor label="Color de acento" value={settings.color_accent} onSave={(v) => save("color_accent", v)} />
          <EditableColor label="Color lima (CTA / hero)" value={settings.color_lime} onSave={(v) => save("color_lime", v)} />
        </div>
      </Section>

      <Section title="Hero (portada)">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Badge superior" value={settings.hero_badge} onSave={(v) => save("hero_badge", v)} />
          <EditableText label="Texto del botón" value={settings.hero_cta_label} onSave={(v) => save("hero_cta_label", v)} />
          <EditableText label="Título — línea 1" value={settings.hero_title_line1} onSave={(v) => save("hero_title_line1", v)} />
          <EditableText label="Título — línea 2 (itálica, color lima)" value={settings.hero_title_line2} onSave={(v) => save("hero_title_line2", v)} />
        </div>
        <div className="mt-6">
          <EditableText label="Subtítulo" value={settings.hero_subtitle} onSave={(v) => save("hero_subtitle", v)} multiline />
        </div>
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium">Imagen del hero</p>
          <ImageUploader
            value={settings.hero_image_url ? { url: settings.hero_image_url, publicId: "" } : null}
            onChange={(img) => save("hero_image_url", img?.url ?? null)}
          />
        </div>
      </Section>

      <Section title="Navegación">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Etiqueta del link a catálogo" value={settings.nav_catalog_label} onSave={(v) => save("nav_catalog_label", v)} />
          <EditableText label="Etiqueta del link a '¿Cómo estampamos?'" value={settings.nav_process_label} onSave={(v) => save("nav_process_label", v)} />
        </div>
      </Section>

      <Section title="Cinta animada (marquee)">
        <EditableText label="Texto" value={settings.marquee_text} onSave={(v) => save("marquee_text", v)} />
      </Section>

      <Section title="Cómo funciona (3 pasos)">
        <div className="space-y-6">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="grid gap-4 sm:grid-cols-2">
              <EditableText
                label={`Paso ${n} — título`}
                value={settings[`step${n}_title`]}
                onSave={(v) => save(`step${n}_title`, v)}
              />
              <EditableText
                label={`Paso ${n} — texto`}
                value={settings[`step${n}_text`]}
                onSave={(v) => save(`step${n}_text`, v)}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Página de pedido (/pedido)">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Badge superior" value={settings.pedido_badge} onSave={(v) => save("pedido_badge", v)} />
          <EditableText label="Título" value={settings.pedido_title} onSave={(v) => save("pedido_title", v)} />
        </div>
        <div className="mt-6">
          <EditableText label="Subtítulo" value={settings.pedido_subtitle} onSave={(v) => save("pedido_subtitle", v)} multiline />
        </div>
      </Section>

      <Section title="Pantalla de confirmación (al terminar un pedido)">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Título" value={settings.confirmation_title} onSave={(v) => save("confirmation_title", v)} />
          <EditableText label="Mensaje" value={settings.confirmation_message} onSave={(v) => save("confirmation_message", v)} />
        </div>
      </Section>

      <Section title="Footer">
        <h3 className="mb-3 text-sm font-semibold text-white/80">Textos Principales</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Título — línea 1" value={settings.footer_headline_line1} onSave={(v) => save("footer_headline_line1", v)} />
          <EditableText label="Título — línea 2 (color lima)" value={settings.footer_headline_line2} onSave={(v) => save("footer_headline_line2", v)} />
          <EditableText label="Tagline" value={settings.footer_tagline} onSave={(v) => save("footer_tagline", v)} />
          <EditableText label="Sufijo del copyright (© año — ___)" value={settings.footer_copyright_suffix} onSave={(v) => save("footer_copyright_suffix", v)} />
        </div>
        <div className="mt-4">
          <EditableText label="Descripción del Footer (Columna 1)" value={settings.footer_description} onSave={(v) => save("footer_description", v)} multiline />
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold text-white/80">Información de Contacto del Footer</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Teléfono de Contacto" value={settings.footer_phone} onSave={(v) => save("footer_phone", v)} />
          <EditableText label="Dirección / Ubicación" value={settings.footer_address} onSave={(v) => save("footer_address", v)} />
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold text-white/80">Enlaces a Redes Sociales</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Instagram URL" value={settings.footer_instagram_url} onSave={(v) => save("footer_instagram_url", v)} />
          <EditableText label="Facebook URL" value={settings.footer_facebook_url} onSave={(v) => save("footer_facebook_url", v)} />
          <EditableText label="TikTok URL" value={settings.footer_tiktok_url} onSave={(v) => save("footer_tiktok_url", v)} />
          <EditableText label="Twitter / X URL" value={settings.footer_twitter_url} onSave={(v) => save("footer_twitter_url", v)} />
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold text-white/80">Newsletter</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Título de Newsletter" value={settings.footer_newsletter_title} onSave={(v) => save("footer_newsletter_title", v)} />
          <EditableText label="Subtítulo de Newsletter" value={settings.footer_newsletter_subtitle} onSave={(v) => save("footer_newsletter_subtitle", v)} multiline />
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold text-white/80">Enlaces de la Columna "Información"</h3>
        <div className="space-y-3">
          {(settings.footer_info_links ?? []).map((item, idx) => (
            <div key={idx} className="flex gap-4 items-end bg-black/10 p-3 rounded-lg border border-white/5">
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const newList = [...(settings.footer_info_links ?? [])];
                    newList[idx] = { ...item, label: e.target.value };
                    setSettings((prev) => ({ ...prev, footer_info_links: newList }));
                  }}
                  onBlur={() => save("footer_info_links", settings.footer_info_links)}
                  className="input"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1">Enlace / Ruta (ej: /pedido o /#talles)</label>
                <input
                  type="text"
                  value={item.href}
                  onChange={(e) => {
                    const newList = [...(settings.footer_info_links ?? [])];
                    newList[idx] = { ...item, href: e.target.value };
                    setSettings((prev) => ({ ...prev, footer_info_links: newList }));
                  }}
                  onBlur={() => save("footer_info_links", settings.footer_info_links)}
                  className="input"
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  const newList = (settings.footer_info_links ?? []).filter((_, i) => i !== idx);
                  setSettings((prev) => ({ ...prev, footer_info_links: newList }));
                  await save("footer_info_links", newList);
                }}
                className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 px-3.5 py-2.5 rounded text-sm transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={async () => {
              const newList = [...(settings.footer_info_links ?? []), { label: "Nuevo Link", href: "/" }];
              setSettings((prev) => ({ ...prev, footer_info_links: newList }));
              await save("footer_info_links", newList);
            }}
            className="bg-[var(--accent)] hover:opacity-90 px-4 py-2 rounded text-sm text-white font-medium cursor-pointer"
          >
            + Agregar Link de Información
          </button>
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold text-white/80">Enlaces de la Columna "Categorías"</h3>
        <div className="space-y-3">
          {(settings.footer_categories_links ?? []).map((item, idx) => (
            <div key={idx} className="flex gap-4 items-end bg-black/10 p-3 rounded-lg border border-white/5">
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const newList = [...(settings.footer_categories_links ?? [])];
                    newList[idx] = { ...item, label: e.target.value };
                    setSettings((prev) => ({ ...prev, footer_categories_links: newList }));
                  }}
                  onBlur={() => save("footer_categories_links", settings.footer_categories_links)}
                  className="input"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1">Enlace / Ruta</label>
                <input
                  type="text"
                  value={item.href}
                  onChange={(e) => {
                    const newList = [...(settings.footer_categories_links ?? [])];
                    newList[idx] = { ...item, href: e.target.value };
                    setSettings((prev) => ({ ...prev, footer_categories_links: newList }));
                  }}
                  onBlur={() => save("footer_categories_links", settings.footer_categories_links)}
                  className="input"
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  const newList = (settings.footer_categories_links ?? []).filter((_, i) => i !== idx);
                  setSettings((prev) => ({ ...prev, footer_categories_links: newList }));
                  await save("footer_categories_links", newList);
                }}
                className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 px-3.5 py-2.5 rounded text-sm transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={async () => {
              const newList = [...(settings.footer_categories_links ?? []), { label: "Nueva Categoría", href: "/" }];
              setSettings((prev) => ({ ...prev, footer_categories_links: newList }));
              await save("footer_categories_links", newList);
            }}
            className="bg-[var(--accent)] hover:opacity-90 px-4 py-2 rounded text-sm text-white font-medium cursor-pointer"
          >
            + Agregar Categoría
          </button>
        </div>
      </Section>

      <Section title="Página '¿Cómo estampamos?'">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Título" value={settings.process_title} onSave={(v) => save("process_title", v)} />
          <EditableText label="Subtítulo" value={settings.process_subtitle} onSave={(v) => save("process_subtitle", v)} />
        </div>
        <div className="mt-6 space-y-6">
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n} className="grid gap-4 sm:grid-cols-2">
              <EditableText
                label={`Paso ${n} — título`}
                value={settings[`process_step${n}_title`]}
                onSave={(v) => save(`process_step${n}_title`, v)}
              />
              <EditableText
                label={`Paso ${n} — texto`}
                value={settings[`process_step${n}_text`]}
                onSave={(v) => save(`process_step${n}_text`, v)}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <EditableText label="Título de cuidados" value={settings.care_title} onSave={(v) => save("care_title", v)} />
          <EditableText label="Texto de cuidados" value={settings.care_text} onSave={(v) => save("care_text", v)} multiline />
        </div>
      </Section>

      <Section title="SEO (pestaña del navegador / buscadores)">
        <div className="grid gap-6">
          <EditableText label="Título (title tag)" value={settings.seo_title} onSave={(v) => save("seo_title", v)} />
          <EditableText label="Descripción" value={settings.seo_description} onSave={(v) => save("seo_description", v)} multiline />
        </div>
      </Section>

      <Section title="Contacto (uso interno)">
        <div className="grid gap-6 sm:grid-cols-3">
          <EditableText label="Email" value={settings.contact_email ?? ""} onSave={(v) => save("contact_email", v)} />
          <EditableText label="Teléfono" value={settings.contact_phone ?? ""} onSave={(v) => save("contact_phone", v)} />
          <EditableText label="Instagram" value={settings.contact_instagram ?? ""} onSave={(v) => save("contact_instagram", v)} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-xl italic">{title}</h2>
      <div className="rounded-2xl border border-line bg-panel p-6">{children}</div>
    </section>
  );
}
