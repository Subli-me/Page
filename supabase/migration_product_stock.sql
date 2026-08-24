-- Stock de prendas en blanco.
--
-- El stock real es por combinación: no alcanza con "quedan 5 remeras", porque
-- lo que se acaba es la negra talle L. Por eso la fila es producto + talle +
-- color.
--
-- Que no exista fila significa "sin control": la combinación se puede pedir
-- libremente. Así el control se activa solo donde hace falta, sin obligar a
-- cargar una grilla completa antes de poder vender.

create table if not exists product_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  -- Nulo cuando la prenda no maneja colores.
  color text,
  quantity integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint product_stock_no_negativo check (quantity >= 0)
);

-- Una sola fila por combinación. Los nulos no chocan entre sí en un índice
-- común, así que el color vacío se normaliza para que tampoco se duplique.
create unique index if not exists product_stock_combinacion_idx
  on product_stock (product_id, size, coalesce(color, ''));

create index if not exists product_stock_product_idx on product_stock(product_id);

-- Descuento atómico.
--
-- Leer el stock, decidir en la aplicación y después escribir el nuevo valor
-- deja una ventana: dos pedidos simultáneos leen 5, los dos creen que alcanza y
-- los dos escriben 3. Se vendieron 4 unidades de 5 y quedaron 3.
--
-- Acá la resta y la comprobación pasan en la misma sentencia, que la base
-- resuelve de a una por fila.
--
-- Devuelve cuántas quedan, `null` si esa combinación no lleva control, y -1 si
-- no alcanzaba.
create or replace function descontar_stock(
  p_product uuid,
  p_size text,
  p_color text,
  p_cantidad int
)
returns int
language plpgsql
as $$
declare
  restante int;
begin
  if not exists (
    select 1 from product_stock
     where product_id = p_product
       and size = p_size
       and coalesce(color, '') = coalesce(p_color, '')
  ) then
    return null; -- sin control: se pide libremente
  end if;

  update product_stock
     set quantity = quantity - p_cantidad,
         updated_at = now()
   where product_id = p_product
     and size = p_size
     and coalesce(color, '') = coalesce(p_color, '')
     and quantity >= p_cantidad
  returning quantity into restante;

  if not found then
    return -1; -- no alcanzaba
  end if;

  return restante;
end;
$$;

alter table product_stock enable row level security;

-- Lectura pública: el armado del pedido necesita saber qué puede ofrecer antes
-- de que exista una sesión.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_stock'
      and policyname = 'public read product stock'
  ) then
    create policy "public read product stock" on product_stock
      for select using (true);
  end if;
end $$;
