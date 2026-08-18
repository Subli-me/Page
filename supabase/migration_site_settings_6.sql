-- Faltaban estas 3 columnas del footer (usadas por el código pero nunca
-- creadas en la base — por eso no persistían al guardar desde el admin).
alter table site_settings add column if not exists footer_social_links jsonb not null default '[]'::jsonb;
alter table site_settings add column if not exists footer_info_links jsonb not null default '[]'::jsonb;
alter table site_settings add column if not exists footer_categories_links jsonb not null default '[]'::jsonb;
