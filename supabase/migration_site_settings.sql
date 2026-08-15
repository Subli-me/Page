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

  -- SEO
  seo_title text not null default 'Sublime — Estampado DTF a medida',
  seo_description text not null default 'Remeras, buzos y chombas estampadas con tu diseño. Subí tu imagen, elegí el estampado y lo mandamos a imprimir.',

  -- Navegación
  nav_catalog_label text not null default 'Catálogo',
  nav_process_label text not null default 'Cómo estampamos',

  -- Página /como-estampamos
  process_title text not null default 'Cómo estampamos',
  process_subtitle text not null default 'Del archivo a la prenda terminada, así es el proceso DTF que usamos en cada pedido.',
  process_step1_title text not null default 'Preparamos el archivo',
  process_step1_text text not null default 'Ajustamos tu imagen a la resolución y el tamaño que pediste para que el estampado salga nítido.',
  process_step2_title text not null default 'Imprimimos en film DTF',
  process_step2_text text not null default 'El diseño se imprime en una película especial con tintas resistentes al lavado.',
  process_step3_title text not null default 'Aplicamos con calor',
  process_step3_text text not null default 'Con una prensa térmica, transferimos el diseño a la prenda a alta temperatura y presión.',
  process_step4_title text not null default 'Control y envío',
  process_step4_text text not null default 'Revisamos cada prenda antes de mandarla, para que llegue perfecta.',
  care_title text not null default 'Cuidados de la prenda estampada',
  care_text text not null default 'Lavá del revés con agua fría, no uses lavandina y evitá planchar directo sobre el estampado. Así te dura mucho más.',

  -- Página /pedido
  pedido_badge text not null default 'Pedido personalizado',
  pedido_title text not null default 'Armemos tu prenda',
  pedido_subtitle text not null default 'En unos pasos elegís la prenda, subís tu imagen y nos llega listo para producción.',

  -- Pantalla de confirmación
  confirmation_title text not null default '¡Pedido recibido!',
  confirmation_message text not null default 'Te vamos a contactar para confirmar los detalles y coordinar el pago.',

  -- Footer
  footer_copyright_suffix text not null default 'DTF Studio',

  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

alter table site_settings enable row level security;
create policy "public read site settings" on site_settings
  for select using (true);
