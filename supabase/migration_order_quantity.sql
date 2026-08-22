-- Cantidad de prendas por pedido.
--
-- Hasta ahora un pedido era siempre una prenda: quien quería cinco para un
-- equipo tenía que rehacer todo el flujo cinco veces, y llegaban cinco pedidos
-- sueltos sin nada que los relacionara.
--
-- Los pedidos ya existentes eran de una unidad, así que el default 1 los deja
-- correctos sin necesidad de tocarlos.

alter table orders
  add column if not exists quantity integer not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_quantity_positivo'
  ) then
    alter table orders
      add constraint orders_quantity_positivo check (quantity > 0);
  end if;
end $$;
