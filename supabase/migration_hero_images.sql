-- Imágenes del carrusel del hero y títulos de las columnas del pie.
--
-- El hero mostraba tres archivos escritos en el código (/hero-1.png y
-- compañía): cambiar la foto principal del sitio obligaba a reemplazar
-- archivos y volver a publicar.
--
-- Peor: `hero_image_url` ya se podía editar desde el panel y el hero nunca la
-- usaba. Quien la cambiaba veía que se guardaba y no pasaba nada en el sitio.
-- Ahora esa imagen entra como respaldo si todavía no se cargó ninguna al
-- carrusel.
--
-- Se guarda como lista y no como columnas sueltas porque la cantidad de fotos
-- es una decisión de quien administra, no del esquema.

alter table site_settings
  add column if not exists hero_images jsonb not null default '[]'::jsonb;

-- Los enlaces de estas columnas ya eran editables; los títulos no.
alter table site_settings
  add column if not exists footer_info_title text not null default 'Información',
  add column if not exists footer_categories_title text not null default 'Categorías';
