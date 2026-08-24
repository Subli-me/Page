-- Cuántos trabajos se ven a la vez en el carrusel.
--
-- Es el ancho de la vista, no la cantidad total: los demás siguen ahí y se
-- llega a ellos deslizando. En pantallas chicas se muestran menos aunque acá
-- diga más, porque tres tarjetas en un celular no se leen.

alter table site_settings
  add column if not exists works_per_view integer not null default 3;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_settings_works_per_view_rango'
  ) then
    alter table site_settings
      add constraint site_settings_works_per_view_rango
      check (works_per_view between 1 and 6);
  end if;
end $$;
