-- Recargos por combinación de zonas.
--
-- Hay combinaciones que cuestan más que la suma de sus partes: estampar pecho
-- y espalda en la misma prenda implica dos pasadas de prensa, no una. El precio
-- por zona no alcanza para expresar eso, porque el adicional depende de con qué
-- otra zona se combine.
--
-- Cada fila es un par de zonas y lo que se suma al total cuando el pedido
-- incluye las dos. El par se guarda ordenado (zone_a_key < zone_b_key) para que
-- "pecho + espalda" y "espalda + pecho" no puedan cargarse dos veces.

create table if not exists print_zone_combos (
  id uuid primary key default gen_random_uuid(),
  zone_a_key text not null references print_zones(key) on delete cascade,
  zone_b_key text not null references print_zones(key) on delete cascade,
  extra_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  constraint print_zone_combos_ordered check (zone_a_key < zone_b_key),
  unique (zone_a_key, zone_b_key)
);

alter table print_zone_combos enable row level security;

-- Lectura pública: el armado del pedido necesita calcular el total antes de
-- que exista una sesión.
drop policy if exists "public read zone combos" on print_zone_combos;
create policy "public read zone combos" on print_zone_combos
  for select using (true);
