-- Agrega la imagen del hero (home).
alter table site_settings add column if not exists hero_image_url text
  default 'https://images.unsplash.com/photo-1780566035913-9233ca20dc29?w=1200&q=80';
