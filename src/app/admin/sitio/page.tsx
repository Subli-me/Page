import { getSiteSettings } from "@/lib/settings";
import { SiteSettingsAdmin } from "@/components/admin/SiteSettingsAdmin";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode } from "@/lib/demo-data";

export default async function AdminSitePage() {
  const settings = await getSiteSettings();
  const demo = isDemoMode();

  return (
    <div>
      <h1 className="font-display text-3xl">Sitio</h1>
      {demo && <div className="mt-4"><DemoBanner /></div>}
      <p className="mt-1 text-sm text-ink-soft">
        Editá el logo, los textos y los colores de todo el sitio. Los cambios se guardan solos.
      </p>

      <div className="mt-8">
        <SiteSettingsAdmin initial={settings} />
      </div>
    </div>
  );
}
