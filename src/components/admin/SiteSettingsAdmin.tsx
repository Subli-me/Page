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

      <Section title="Footer">
        <div className="grid gap-6 sm:grid-cols-2">
          <EditableText label="Título — línea 1" value={settings.footer_headline_line1} onSave={(v) => save("footer_headline_line1", v)} />
          <EditableText label="Título — línea 2 (color lima)" value={settings.footer_headline_line2} onSave={(v) => save("footer_headline_line2", v)} />
        </div>
        <div className="mt-6">
          <EditableText label="Tagline" value={settings.footer_tagline} onSave={(v) => save("footer_tagline", v)} />
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
