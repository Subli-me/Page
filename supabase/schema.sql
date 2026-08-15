-- Sublime DTF Studio — schema base
-- Ejecutar en el SQL editor de Supabase (proyecto nuevo, free tier)

create extension if not exists "pgcrypto";

-- Prendas disponibles (remera, buzo, chomba) con precio y costo
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric(10,2) not null default 0,
  base_cost numeric(10,2) not null default 0,
  image_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Talles disponibles por producto (S, M, L, XL...) con ajuste de precio opcional
create table if not exists product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  price_delta numeric(10,2) not null default 0,
  sort_order int not null default 0
);

-- Colores disponibles por producto
create table if not exists product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  hex text not null,
  sort_order int not null default 0
);

-- Zonas de estampado posibles (pecho, espalda, manga...) con costo extra de DTF
create table if not exists print_zones (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- 'front_chest', 'back_full', 'sleeve_left', etc.
  label text not null,
  extra_price numeric(10,2) not null default 0,
  extra_cost numeric(10,2) not null default 0,
  sort_order int not null default 0
);

-- Pedidos personalizados enviados por clientes
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  size text not null,
  color text,
  print_zone_key text not null references print_zones(key),
  image_url text not null,          -- imagen del cliente en Cloudinary (resolución original)
  image_public_id text not null,    -- public_id de Cloudinary, para poder re-descargar/transformar
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  notes text,
  status text not null default 'pendiente', -- pendiente | confirmado | impreso | entregado | cancelado
  total_price numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);

-- RLS: solo el backend (service role) escribe/lee todo. El cliente público solo
-- puede insertar pedidos y leer productos activos.
alter table products enable row level security;
alter table product_sizes enable row level security;
alter table product_colors enable row level security;
alter table print_zones enable row level security;
alter table orders enable row level security;

create policy "public read active products" on products
  for select using (active = true);

create policy "public read product sizes" on product_sizes
  for select using (true);

create policy "public read product colors" on product_colors
  for select using (true);

create policy "public read print zones" on print_zones
  for select using (true);

-- Los pedidos se insertan solo vía API route con service role key (no policy de insert público).
-- No se agrega policy de select para orders: solo accesibles con service role (panel admin).

-- Datos iniciales de zonas de estampado
insert into print_zones (key, label, extra_price, extra_cost, sort_order) values
  ('front_chest', 'Pecho', 0, 0, 1),
  ('back_full', 'Espalda completa', 1500, 400, 2),
  ('sleeve_left', 'Manga izquierda', 800, 200, 3),
  ('sleeve_right', 'Manga derecha', 800, 200, 4)
on conflict (key) do nothing;

-- Producto de ejemplo (image_url = placeholder de stock libre, reemplazar por fotos propias)
insert into products (name, slug, description, base_price, base_cost, image_url, active, sort_order) values
  ('Remera Oversize', 'remera-oversize', 'Remera de algodón 24/1 corte oversize.', 12000, 5000, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', true, 1),
  ('Buzo Canguro', 'buzo-canguro', 'Buzo frisado con bolsillo canguro.', 22000, 9500, 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80', true, 2),
  ('Chomba Piqué', 'chomba-pique', 'Chomba de piqué con cuello y puño.', 16000, 7000, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80', true, 3)
on conflict (slug) do update set image_url = excluded.image_url;
