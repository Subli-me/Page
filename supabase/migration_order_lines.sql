-- Carrito: varias prendas en un mismo pedido.
--
-- Hasta ahora un pedido era una sola prenda, así que un cumpleaños con talles
-- surtidos, o alguien que quería una remera y un buzo, tenía que rehacer el
-- flujo entero y llegaban pedidos sueltos sin nada que los relacionara.
--
-- El modelo pasa a tener tres niveles:
--   orders       → el pedido y los datos del cliente
--   order_lines  → cada prenda pedida, con su talle, color y cantidad
--   order_items  → los estampados de esa prenda (pecho, espalda, mangas)
--
-- La migración es aditiva: las columnas viejas de `orders` (product_id, size,
-- color, quantity) quedan donde están para no romper nada que todavía las lea,
-- pero los pedidos nuevos ya no las usan.

create table if not exists order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  size text not null,
  color text,
  quantity integer not null default 1,
  -- Guardamos el precio con el que se cerró: si mañana sube la lista, el
  -- pedido viejo tiene que seguir diciendo lo que costó ese día.
  unit_price numeric(10,2) not null default 0,
  line_total numeric(10,2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint order_lines_quantity_positivo check (quantity > 0)
);

create index if not exists order_lines_order_id_idx on order_lines(order_id);

-- Cada estampado pasa a colgar de una prenda, no del pedido entero.
alter table order_items
  add column if not exists order_line_id uuid references order_lines(id) on delete cascade;

create index if not exists order_items_order_line_id_idx on order_items(order_line_id);

-- Los pedidos que ya existen se convierten en un pedido de un solo renglón,
-- para que se vean igual que los nuevos en el panel.
do $$
declare
  o record;
  nueva_linea uuid;
begin
  for o in
    select ord.id, ord.product_id, ord.size, ord.color, ord.total_price,
           coalesce(ord.quantity, 1) as quantity
    from orders ord
    where not exists (select 1 from order_lines l where l.order_id = ord.id)
  loop
    insert into order_lines (order_id, product_id, size, color, quantity, unit_price, line_total)
    values (
      o.id,
      o.product_id,
      coalesce(o.size, '-'),
      o.color,
      o.quantity,
      coalesce(o.total_price, 0) / greatest(o.quantity, 1),
      coalesce(o.total_price, 0)
    )
    returning id into nueva_linea;

    update order_items
      set order_line_id = nueva_linea
      where order_id = o.id and order_line_id is null;
  end loop;
end $$;

alter table order_lines enable row level security;
