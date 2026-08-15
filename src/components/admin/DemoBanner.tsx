export function DemoBanner() {
  return (
    <div className="mb-8 rounded-xl border border-accent/30 bg-accent-soft/50 px-4 py-3 text-sm text-ink">
      Todavía no conectaste un Supabase real — esta pantalla no tiene datos.
      Cargá <code className="rounded bg-panel px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
      <code className="rounded bg-panel px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> y{" "}
      <code className="rounded bg-panel px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> en las
      variables de entorno del proyecto.
    </div>
  );
}
