-- Amplía site_settings con SEO, textos de /pedido, navegación y confirmación.
-- Ejecutar después de migration_site_settings.sql.

alter table site_settings add column if not exists seo_title text
  not null default 'Sublime — Estampado DTF a medida';
alter table site_settings add column if not exists seo_description text
  not null default 'Remeras, buzos y chombas estampadas con tu diseño. Subí tu imagen, elegí el estampado y lo mandamos a imprimir.';

alter table site_settings add column if not exists nav_catalog_label text not null default 'Catálogo';

alter table site_settings add column if not exists pedido_badge text not null default 'Pedido personalizado';
alter table site_settings add column if not exists pedido_title text not null default 'Armemos tu prenda';
alter table site_settings add column if not exists pedido_subtitle text not null default 'En unos pasos elegís la prenda, subís tu imagen y nos llega listo para producción.';

alter table site_settings add column if not exists confirmation_title text not null default '¡Pedido recibido!';
alter table site_settings add column if not exists confirmation_message text not null default 'Te vamos a contactar para confirmar los detalles y coordinar el pago.';

alter table site_settings add column if not exists footer_copyright_suffix text not null default 'DTF Studio';
