-- Guarda cómo el cliente ajustó su diseño (posición/escala/rotación) dentro
-- de la zona de estampado, cuando usó el editor interactivo del mockup propio.
alter table orders add column if not exists design_transform jsonb;
