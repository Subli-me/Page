-- Completa los talles/colores/variantes de Printful para Buzo Canguro y
-- Chomba Piqué (la Remera Oversize ya se cargó en seed_printful_mapping.sql).

-- Talles
insert into product_sizes (product_id, size, price_delta, sort_order)
select id, s.size, 0, s.ord
from products, (values ('S',1),('M',2),('L',3),('XL',4)) as s(size, ord)
where products.slug in ('buzo-canguro', 'chomba-pique')
  and not exists (
    select 1 from product_sizes ps where ps.product_id = products.id and ps.size = s.size
  );

-- Colores
insert into product_colors (product_id, name, hex, sort_order)
select id, c.name, c.hex, c.ord
from products, (values ('Blanco','#ffffff',1),('Negro','#16150f',2)) as c(name, hex, ord)
where products.slug in ('buzo-canguro', 'chomba-pique')
  and not exists (
    select 1 from product_colors pc where pc.product_id = products.id and pc.name = c.name
  );

-- Variantes de Printful: Buzo Canguro (Bella+Canvas 3719)
insert into product_variants (product_id, size, color, printful_variant_id)
select id, v.size, v.color, v.vid from products,
  (values ('S','Blanco',9221), ('M','Blanco',9222), ('L','Blanco',9223), ('XL','Blanco',9224),
          ('S','Negro',9227), ('M','Negro',9228), ('L','Negro',9229), ('XL','Negro',9230)
  ) as v(size, color, vid)
where products.slug = 'buzo-canguro'
on conflict (product_id, size, color) do update set printful_variant_id = excluded.printful_variant_id;

-- Variantes de Printful: Chomba Piqué (Adidas Premium Polo GQ3114)
insert into product_variants (product_id, size, color, printful_variant_id)
select id, v.size, v.color, v.vid from products,
  (values ('S','Blanco',16406), ('M','Blanco',16407), ('L','Blanco',16408), ('XL','Blanco',16409),
          ('S','Negro',16401), ('M','Negro',16402), ('L','Negro',16403), ('XL','Negro',16404)
  ) as v(size, color, vid)
where products.slug = 'chomba-pique'
on conflict (product_id, size, color) do update set printful_variant_id = excluded.printful_variant_id;
