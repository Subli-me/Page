-- Catálogo de diseños propios: imágenes que subís vos desde el admin para
-- que el cliente pueda elegir en vez de (o además de) subir la suya.

create table if not exists design_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  image_public_id text not null,
  category text, -- ej: 'deportes', 'humor', 'frases' — opcional, para agrupar
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table design_catalog enable row level security;
create policy "public read active designs" on design_catalog
  for select using (active = true);
