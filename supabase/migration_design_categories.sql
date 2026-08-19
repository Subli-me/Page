-- Agregar campo de color a design_catalog
alter table design_catalog add column if not exists color text;

-- Tabla de categorías temáticas (música, anime, series, etc.)
create table if not exists design_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Relación many-to-many: un diseño puede tener múltiples categorías
create table if not exists design_category_assignments (
  design_id uuid not null references design_catalog(id) on delete cascade,
  category_id uuid not null references design_categories(id) on delete cascade,
  sort_order int not null default 0,
  primary key (design_id, category_id)
);

alter table design_categories enable row level security;
alter table design_category_assignments enable row level security;

create policy "public read design categories" on design_categories
  for select using (true);

create policy "public read design assignments" on design_category_assignments
  for select using (true);
