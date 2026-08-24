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
