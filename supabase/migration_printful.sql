-- Integración con Printful Mockup Generator (mockups fotorrealistas gratis).
-- Ejecutar después de schema.sql.

-- ID del producto en el catálogo de Printful (ej: 71 = Unisex Staple T-Shirt Bella+Canvas 3001)
alter table products add column if not exists printful_product_id int;

-- Placement de Printful que corresponde a cada zona de estampado nuestra
-- (valores típicos: 'front', 'back', 'sleeve_left', 'sleeve_right', 'label_inside')
alter table print_zones add column if not exists printful_placement text;

update print_zones set printful_placement = 'front' where key = 'front_chest';
update print_zones set printful_placement = 'back' where key = 'back_full';
update print_zones set printful_placement = 'sleeve_left' where key = 'sleeve_left';
update print_zones set printful_placement = 'sleeve_right' where key = 'sleeve_right';

-- Mapeo talle+color -> variant_id de Printful (cada combinación es una variante distinta)
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  color text,
  printful_variant_id int not null,
  unique (product_id, size, color)
);

alter table product_variants enable row level security;
create policy "public read product variants" on product_variants
  for select using (true);
