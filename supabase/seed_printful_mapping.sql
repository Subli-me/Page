-- Mapeo de prueba a productos reales de Printful, para probar el Mockup
-- Generator. Ajustar/reemplazar cuando definan qué prendas reales usar.

-- Remera Oversize -> Unisex Staple T-Shirt, Bella+Canvas 3001
update products set printful_product_id = 71 where slug = 'remera-oversize';

-- Buzo Canguro -> Unisex Pullover Hoodie, Bella+Canvas 3719
update products set printful_product_id = 294 where slug = 'buzo-canguro';

-- Chomba Piqué -> Unisex Adidas Premium Polo, GQ3114
update products set printful_product_id = 655 where slug = 'chomba-pique';

-- Talles y colores seleccionables para la Remera Oversize (si no existen ya)
insert into product_sizes (product_id, size, price_delta, sort_order)
select id, s.size, 0, s.ord
from products, (values ('S',1),('M',2),('L',3),('XL',4)) as s(size, ord)
where products.slug = 'remera-oversize'
  and not exists (
    select 1 from product_sizes ps where ps.product_id = products.id and ps.size = s.size
  );

insert into product_colors (product_id, name, hex, sort_order)
select id, c.name, c.hex, c.ord
from products, (values ('Blanco','#ffffff',1),('Negro','#16150f',2)) as c(name, hex, ord)
where products.slug = 'remera-oversize'
  and not exists (
    select 1 from product_colors pc where pc.product_id = products.id and pc.name = c.name
  );

-- Variantes (talle + color) de la Remera Oversize, Blanco y Negro S-XL
insert into product_variants (product_id, size, color, printful_variant_id)
select id, 'S', 'Blanco', 4011 from products where slug = 'remera-oversize'
union all
select id, 'M', 'Blanco', 4012 from products where slug = 'remera-oversize'
union all
select id, 'L', 'Blanco', 4013 from products where slug = 'remera-oversize'
union all
select id, 'XL', 'Blanco', 4014 from products where slug = 'remera-oversize'
union all
select id, 'S', 'Negro', 4016 from products where slug = 'remera-oversize'
union all
select id, 'M', 'Negro', 4017 from products where slug = 'remera-oversize'
union all
select id, 'L', 'Negro', 4018 from products where slug = 'remera-oversize'
union all
select id, 'XL', 'Negro', 4019 from products where slug = 'remera-oversize'
on conflict (product_id, size, color) do update set printful_variant_id = excluded.printful_variant_id;
