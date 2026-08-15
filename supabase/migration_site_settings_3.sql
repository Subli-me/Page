-- Agrega los textos de la página /como-estampamos.
-- Ejecutar después de migration_site_settings.sql (y _2 si corresponde).

alter table site_settings add column if not exists nav_process_label text not null default 'Cómo estampamos';

alter table site_settings add column if not exists process_title text not null default 'Cómo estampamos';
alter table site_settings add column if not exists process_subtitle text not null default 'Del archivo a la prenda terminada, así es el proceso DTF que usamos en cada pedido.';

alter table site_settings add column if not exists process_step1_title text not null default 'Preparamos el archivo';
alter table site_settings add column if not exists process_step1_text text not null default 'Ajustamos tu imagen a la resolución y el tamaño que pediste para que el estampado salga nítido.';

alter table site_settings add column if not exists process_step2_title text not null default 'Imprimimos en film DTF';
alter table site_settings add column if not exists process_step2_text text not null default 'El diseño se imprime en una película especial con tintas resistentes al lavado.';

alter table site_settings add column if not exists process_step3_title text not null default 'Aplicamos con calor';
alter table site_settings add column if not exists process_step3_text text not null default 'Con una prensa térmica, transferimos el diseño a la prenda a alta temperatura y presión.';

alter table site_settings add column if not exists process_step4_title text not null default 'Control y envío';
alter table site_settings add column if not exists process_step4_text text not null default 'Revisamos cada prenda antes de mandarla, para que llegue perfecta.';

alter table site_settings add column if not exists care_title text not null default 'Cuidados de la prenda estampada';
alter table site_settings add column if not exists care_text text not null default 'Lavá del revés con agua fría, no uses lavandina y evitá planchar directo sobre el estampado. Así te dura mucho más.';
