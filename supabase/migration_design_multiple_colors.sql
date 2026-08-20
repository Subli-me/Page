-- Tabla de relación many-to-many para colores de diseños
create table if not exists design_color_assignments (
  design_id uuid not null references design_catalog(id) on delete cascade,
  color text not null,
  sort_order int not null default 0,
  primary key (design_id, color)
);

alter table design_color_assignments enable row level security;

create policy "public read design color assignments" on design_color_assignments
  for select using (true);

-- Eliminar la columna vieja de color (opcional - comentar si quieres mantener compatibilidad)
-- alter table design_catalog drop column if exists color;
