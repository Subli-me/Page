import { WorksAdmin } from "@/components/admin/WorksAdmin";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode } from "@/lib/demo-data";
import { getAllWorks } from "@/lib/works";
import { getSiteSettings } from "@/lib/settings";

export default async function AdminWorksPage() {
  const demo = isDemoMode();
  const [works, settings] = await Promise.all([getAllWorks(), getSiteSettings()]);

  return (
    <div>
      <h1 className="font-display text-3xl">Trabajos hechos</h1>
      {demo && (
        <div className="mt-4">
          <DemoBanner />
        </div>
      )}
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        Fotos de prendas terminadas para mostrar en la página de inicio. Es lo
        que más convence a alguien que todavía no te compró.
      </p>

      <div className="mt-8">
        <WorksAdmin
          initial={works}
          perView={settings.works_per_view ?? 3}
          autoplay={settings.works_autoplay ?? true}
          intervalSeconds={settings.works_interval_seconds ?? 5}
        />
      </div>
    </div>
  );
}
