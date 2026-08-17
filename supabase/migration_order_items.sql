-- Permite varios estampados por pedido (ej: pecho + espalda + manga).
-- orders sigue siendo la cabecera (cliente, talle/color, total, estado);
-- cada zona estampada del pedido pasa a vivir en order_items.

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  print_zone_key text not null references print_zones(key),
  image_url text not null,
  image_public_id text not null,
  design_transform jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items(order_id);

-- Las columnas viejas (orders.print_zone_key, image_url, image_public_id,
-- design_transform) quedan para no romper pedidos ya guardados, pero los
-- pedidos nuevos usan order_items. Se pueden dejar de usar más adelante.
alter table orders alter column print_zone_key drop not null;
alter table orders alter column image_url drop not null;
alter table orders alter column image_public_id drop not null;
