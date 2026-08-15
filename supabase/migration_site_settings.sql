-- Configuración global del sitio, editable desde /admin/sitio.
-- Es una tabla de una sola fila (singleton) para simplificar el editor.

create table if not exists site_settings (
  id int primary key default 1,
  -- Marca
  logo_text text not null default 'Sublime',
  logo_url text, -- si se sube un isotipo/imagen, reemplaza al texto
  favicon_emoji text default '👕',

  -- Colores (hex). Se inyectan como CSS variables en todo el sitio.
  color_accent text not null default '#c85a3a',
  color_lime text not null default '#d8f24a',

  -- Hero (home)
  hero_badge text not null default 'Estampado DTF a medida',
  hero_title_line1 text not null default 'Tu diseño,',
  hero_title_line2 text not null default 'en tu prenda.',
  hero_subtitle text not null default 'Subí tu imagen, elegí la prenda y dónde va el estampado. Nosotros nos encargamos de imprimirlo y hacerlo realidad.',
  hero_cta_label text not null default 'Crear mi diseño',

  -- Marquee
  marquee_text text not null default 'REMERAS · BUZOS · CHOMBAS · DTF',

  -- Cómo funciona (3 pasos)
  step1_title text not null default 'Elegí la prenda',
  step1_text text not null default 'Remera, buzo o chomba. Talle y color a tu gusto.',
  step2_title text not null default 'Subí tu imagen',
  step2_text text not null default 'Marcá en qué parte de la prenda querés el estampado.',
  step3_title text not null default 'Lo imprimimos',
  step3_text text not null default 'Recibimos tu pedido y lo mandamos directo a producción.',

  -- Footer
  footer_headline_line1 text not null default 'Hagamos algo',
  footer_headline_line2 text not null default 'estampado.',
  footer_tagline text not null default 'Remeras · Buzos · Chombas, prenda por prenda.',

  -- Contacto (referencia interna, opcional mostrar en el sitio)
  contact_email text,
  contact_phone text,
  contact_instagram text,

  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

alter table site_settings enable row level security;
create policy "public read site settings" on site_settings
  for select using (true);
