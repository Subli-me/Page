-- Agrega los nuevos campos requeridos por el footer de 4 columnas
alter table site_settings add column if not exists footer_description text default 'Es un espacio donde las ideas se convierten en remeras. Diseñamos y estampamos prendas con impresión DTG, desde diseños originales hasta pedidos totalmente personalizados.';
alter table site_settings add column if not exists footer_phone text default '+54 9 11 1234-5678';
alter table site_settings add column if not exists footer_address text default 'Belgrano, Capital Federal';
alter table site_settings add column if not exists footer_instagram_url text default 'https://instagram.com/sublime';
alter table site_settings add column if not exists footer_facebook_url text default 'https://facebook.com/sublime';
alter table site_settings add column if not exists footer_tiktok_url text default 'https://tiktok.com/@sublime';
alter table site_settings add column if not exists footer_twitter_url text default 'https://twitter.com/sublime';
alter table site_settings add column if not exists footer_newsletter_title text default 'Newsletter';
alter table site_settings add column if not exists footer_newsletter_subtitle text default 'Recibí ofertas exclusivas y novedades directamente en tu email.';

alter table site_settings add column if not exists footer_nav_inicio text default 'Inicio';
alter table site_settings add column if not exists footer_nav_productos text default 'Productos';
alter table site_settings add column if not exists footer_nav_personalizadas text default 'Personalizadas';
alter table site_settings add column if not exists footer_nav_beneficios text default 'Beneficios';
alter table site_settings add column if not exists footer_nav_talles text default 'Talles';
alter table site_settings add column if not exists footer_nav_politica text default 'Política de cambio';
alter table site_settings add column if not exists footer_nav_contacto text default 'Contacto';

alter table site_settings add column if not exists footer_cat_remeras text default 'Remeras';
alter table site_settings add column if not exists footer_cat_buzos text default 'Buzos';
alter table site_settings add column if not exists footer_cat_medias text default 'Medias';
alter table site_settings add column if not exists footer_cat_gorras text default 'Gorras';
alter table site_settings add column if not exists footer_cat_totebag text default 'Tote Bag';
alter table site_settings add column if not exists footer_cat_combos text default 'Combos';
alter table site_settings add column if not exists footer_cat_bermudas text default 'Bermudas';
