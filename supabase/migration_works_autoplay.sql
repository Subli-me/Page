-- Avance automático del carrusel de trabajos.
--
-- Se puede apagar: un carrusel que se mueve solo no siempre conviene, y quien
-- administra el sitio es quien sabe si sus fotos se leen mejor quietas.
--
-- El intervalo va en segundos porque es lo que se piensa al configurarlo;
-- convertirlo es tarea del código, no de quien lo carga.

alter table site_settings
  add column if not exists works_autoplay boolean not null default true;

alter table site_settings
  add column if not exists works_interval_seconds integer not null default 5;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_settings_works_interval_rango'
  ) then
    alter table site_settings
      add constraint site_settings_works_interval_rango
      -- Menos de 2 segundos no da tiempo a leer; más de 30 deja de ser carrusel.
      check (works_interval_seconds between 2 and 30);
  end if;
end $$;
