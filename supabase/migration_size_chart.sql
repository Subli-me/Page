-- Medidas reales por talle (ancho de pecho y largo, en cm), para la sección
-- pública de Talles y para la guía de talles del pedido. Nullable: un talle
-- sin medidas cargadas simplemente no aparece en la tabla pública.
alter table product_sizes add column if not exists chest_cm numeric(5,1);
alter table product_sizes add column if not exists length_cm numeric(5,1);

-- Textos de la sección "Talles" del home y su link de navegación.
alter table site_settings add column if not exists nav_talles_label text not null default 'Talles';
alter table site_settings add column if not exists talles_title text not null default 'Guía de talles';
alter table site_settings add column if not exists talles_subtitle text not null default 'Medí una prenda que ya tengas y compará con esta tabla — todas las medidas están en centímetros.';
