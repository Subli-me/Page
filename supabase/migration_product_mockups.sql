-- Mockups propios: foto real de la prenda + la zona (en %) donde se
-- superpone el diseño del cliente. Sirve de respaldo cuando Printful no
-- tiene mapeada esa prenda/variante, o directamente en vez de Printful.

create table if not exists product_mockups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  print_zone_key text not null references print_zones(key) on delete cascade,
  image_url text not null,
  image_public_id text not null,
  -- posición del overlay como % del ancho/alto de la foto (0-100)
  overlay_x numeric(5,2) not null default 30,
  overlay_y numeric(5,2) not null default 30,
  overlay_w numeric(5,2) not null default 40,
  overlay_h numeric(5,2) not null default 40,
  created_at timestamptz not null default now(),
  unique (product_id, print_zone_key)
);

alter table product_mockups enable row level security;
create policy "public read product mockups" on product_mockups
  for select using (true);
