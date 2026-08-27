-- Agregar la columna dinámica JSONB para los enlaces de redes sociales del footer
alter table site_settings add column if not exists footer_social_links jsonb default '[
  {"platform": "instagram", "url": "https://instagram.com/sublime", "label": "Instagram"},
  {"platform": "facebook", "url": "https://facebook.com/sublime", "label": "Facebook"},
  {"platform": "tiktok", "url": "https://tiktok.com/@sublime", "label": "TikTok"},
  {"platform": "twitter", "url": "https://twitter.com/sublime", "label": "Twitter"}
]';
