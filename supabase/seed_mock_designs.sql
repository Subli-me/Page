-- Diseños de muestra para el catálogo (/admin/disenos), solo para
-- probar el flujo de selección en /pedido. Reemplazar por diseños
-- propios reales cuando estén listos.

insert into design_catalog (name, image_url, image_public_id, category, active, sort_order) values
  ('Badge Amanecer', 'https://images.unsplash.com/photo-1585842630354-c6766ebf210d?w=800&q=80', 'mock-badge-amanecer', 'geométrico', true, 1),
  ('Trigo Vintage', 'https://images.unsplash.com/photo-1577720086684-eb7be1e40721?w=800&q=80', 'mock-trigo-vintage', 'ilustración', true, 2),
  ('Diamante Abstracto', 'https://images.unsplash.com/photo-1753857791386-5a37ca2a9b11?w=800&q=80', 'mock-diamante-abstracto', 'geométrico', true, 3),
  ('Desde el Corazón', 'https://images.unsplash.com/photo-1606886360181-1757b13b4487?w=800&q=80', 'mock-desde-corazon', 'frases', true, 4)
on conflict do nothing;
