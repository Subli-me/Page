-- Pedidos de ejemplo para que /admin no se vea vacío en la demo.
-- Reemplazar/borrar cuando empiecen a llegar pedidos reales.

insert into orders (
  product_id, size, color, print_zone_key, image_url, image_public_id,
  customer_name, customer_email, customer_phone, notes, status, total_price
)
select
  p.id, 'M', 'Negro', 'front_chest',
  'https://images.unsplash.com/photo-1585842630354-c6766ebf210d?w=800&q=80', 'mock-order-1',
  'Julieta Fernández', 'julieta.demo@example.com', '+54 9 11 5555-0101',
  'Si puede ser lo antes posible, gracias!', 'pendiente', 12000
from products p where p.slug = 'remera-oversize'
union all
select
  p.id, 'L', 'Blanco', 'back_full',
  'https://images.unsplash.com/photo-1577720086684-eb7be1e40721?w=800&q=80', 'mock-order-2',
  'Nicolás Gómez', 'nico.demo@example.com', null,
  null, 'confirmado', 23500
from products p where p.slug = 'buzo-canguro'
union all
select
  p.id, 'S', 'Negro', 'front_chest',
  'https://images.unsplash.com/photo-1753857791386-5a37ca2a9b11?w=800&q=80', 'mock-order-3',
  'Camila Ruiz', 'camila.demo@example.com', '+54 9 11 5555-0303',
  'Es para regalo, ¿lo pueden envolver?', 'impreso', 16000
from products p where p.slug = 'chomba-pique';
