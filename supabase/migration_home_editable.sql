-- Textos de la portada que estaban fijos en el código.
--
-- La edición en vivo ya cubría el hero, los tres pasos y el pie, pero los
-- títulos de las secciones y los botones no: para cambiar "Catálogo" por
-- "Nuestras prendas" había que tocar el código y volver a publicar.
--
-- Los valores por defecto son exactamente los que estaban escritos, así que
-- correr esto no cambia nada de lo que se ve hoy.

alter table site_settings
  add column if not exists hero_secondary_cta_label text not null default 'Ver prendas',
  add column if not exists steps_title text not null default 'Cómo funciona',
  add column if not exists catalog_title text not null default 'Catálogo',
  add column if not exists designs_title text not null default 'Catálogo de diseños',
  add column if not exists designs_subtitle text not null default 'Elegí uno de nuestros diseños o subí el tuyo propio al hacer tu pedido.',
  add column if not exists designs_cta_label text not null default 'Hacer pedido',
  add column if not exists works_title text not null default 'Trabajos hechos',
  add column if not exists works_subtitle text not null default 'Prendas que ya entregamos. Así quedan de verdad, fuera de la pantalla.';

-- Etiquetas del catálogo de diseños y del botón de cada prenda.
alter table site_settings
  add column if not exists filter_color_label text not null default 'Filtrar por color',
  add column if not exists filter_category_label text not null default 'Filtrar por categoría',
  add column if not exists designs_more_label text not null default 'Ver más diseños',
  add column if not exists product_cta_label text not null default 'Elegir';
