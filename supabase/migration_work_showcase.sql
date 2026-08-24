-- Trabajos hechos: la prueba de que lo que se promete existe.
--
-- Una sola tabla para las dos cosas, porque en la práctica van juntas: la foto
-- de la prenda terminada y, si el cliente dijo algo, su testimonio. Separarlas
-- obligaría a cargar dos veces lo mismo y a decidir de antemano si una foto
-- "es" un testimonio.
--
-- Por eso la foto es obligatoria y el testimonio no: una galería de trabajos
-- reales ya convence sola; el comentario suma cuando existe.

create table if not exists work_showcase (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_public_id text not null,
  -- Qué es lo que se ve: "Remeras para el equipo de fútbol", por ejemplo.
  caption text,
  customer_name text,
  quote text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists work_showcase_orden_idx on work_showcase(sort_order);

alter table work_showcase enable row level security;

-- Lectura pública: se muestra en la página de inicio, sin sesión.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'work_showcase'
      and policyname = 'public read work showcase'
  ) then
    create policy "public read work showcase" on work_showcase
      for select using (active);
  end if;
end $$;
