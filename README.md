# Sublime — DTF Studio

Sitio para un emprendimiento de estampado DTF (remeras, buzos, chombas).
Home con catálogo, flujo de pedido personalizado (subida de imagen, talle,
color, ubicación del estampado) y panel de administración para gestionar
precios/costos y ver los pedidos entrantes listos para producción.

## Stack

- **Next.js 15 (App Router) + TypeScript + Tailwind v4** — hosting en Vercel (free).
- **Supabase** — base de datos Postgres + autenticación del admin (free tier).
- **Cloudinary** — almacenamiento de imágenes de los pedidos, con upload firmado
  directo desde el navegador (free tier: 25GB crédito/mes, ideal para mucho volumen).
- **Resend** — email de notificación cada vez que llega un pedido nuevo (free tier: 100/día).

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com) → New Project (free tier).
2. Abrí el **SQL Editor** y ejecutá, en orden:
   - [`supabase/schema.sql`](supabase/schema.sql) — productos, talles, colores, zonas de estampado y pedidos.
   - [`supabase/migration_site_settings.sql`](supabase/migration_site_settings.sql) — configuración editable del sitio (logo, textos, colores).
   - [`supabase/migration_printful.sql`](supabase/migration_printful.sql) — opcional, para la vista previa fotorrealista.
   - [`supabase/migration_design_catalog.sql`](supabase/migration_design_catalog.sql) — catálogo de diseños propios.

   Si ya habías ejecutado `migration_site_settings.sql` antes de esta versión,
   corré también [`supabase/migration_site_settings_2.sql`](supabase/migration_site_settings_2.sql)
   [`supabase/migration_site_settings_3.sql`](supabase/migration_site_settings_3.sql) y
   [`supabase/migration_site_settings_4.sql`](supabase/migration_site_settings_4.sql)
   para sumar las columnas que se agregaron después (en un Supabase nuevo no
   hace falta, ya están todas en el `migration_site_settings.sql` actualizado).
3. En **Authentication → Users**, creá manualmente tu usuario admin (email + contraseña).
   Es el único que va a poder loguearse en `/admin`.
4. Copiá `Project URL`, `anon public key` y `service_role key` desde
   **Project Settings → API**.

### 3. Crear cuenta en Cloudinary

1. Andá a [cloudinary.com](https://cloudinary.com) → crear cuenta free.
2. En el Dashboard copiá `Cloud name`, `API Key` y `API Secret`.

### 4. (Opcional) Crear cuenta en Resend

1. Andá a [resend.com](https://resend.com) → crear cuenta free.
2. Generá una API key. Para producción vas a querer verificar tu propio dominio
   como remitente; para probar rápido podés usar `onboarding@resend.dev` como `RESEND_FROM_EMAIL`.

### 4.1. (Opcional pero recomendado) Vista previa realista con Printful

El paso "Diseño" del pedido muestra automáticamente cómo queda la imagen puesta
sobre la prenda real, usando el Mockup Generator de Printful (gratis, no hace
falta vender a través de ellos — se usa solo para generar la imagen de preview).

1. Creá una cuenta gratis en [printful.com](https://www.printful.com).
2. **Settings → API** → generá un Private Token → es tu `PRINTFUL_API_KEY`.
3. Para cada prenda tuya, buscá en su catálogo (`/mockup-generator` en su sitio,
   o el endpoint `GET /products` de su API) el producto blank más parecido al
   que vos imprimís (ej: remera Bella+Canvas 3001) y anotá su `product_id`.
4. Para cada combinación de talle/color que ofrezcas, anotá el `variant_id`
   correspondiente (cada talle+color es una variante distinta en Printful).
5. Ejecutá [`supabase/migration_printful.sql`](supabase/migration_printful.sql)
   en el SQL Editor de Supabase.
6. Cargá esos IDs en las tablas `products.printful_product_id` y
   `product_variants` (product_id, size, color, printful_variant_id) desde el
   Table Editor de Supabase.

Si no configurás esto, el pedido funciona igual — simplemente no se muestra
la vista previa fotorrealista (se usa el selector de zona esquemático).

### 5. Variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores:

```bash
cp .env.example .env.local
```

### 6. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para el sitio público y
[http://localhost:3000/admin](http://localhost:3000/admin) para el panel
(te va a pedir el usuario que creaste en Supabase Auth).

## Deploy en Vercel

1. Subí el repo a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importá el repo.
3. Cargá las mismas variables de entorno del `.env.local` en
   **Project Settings → Environment Variables**.
4. Deploy. Cada push a `main` re-despliega automáticamente.

## Estructura

```
src/app/                  → páginas (home, /pedido, /admin)
src/app/api/               → rutas API (firma de upload, crear pedido, admin)
src/components/order/     → wizard de pedido personalizado
src/components/admin/     → tablas editables de precios y listado de pedidos
src/lib/                  → clientes de Supabase y Cloudinary, tipos
supabase/schema.sql       → schema completo de la base de datos
```

## Qué se edita desde /admin

- **`/admin`** — pedidos entrantes, imagen lista para producción, cambio de estado.
- **`/admin/productos`** — alta y baja de prendas, precio/costo, talles y
  colores por prenda, y alta/edición/baja de zonas de estampado. Ya no hace
  falta tocar Supabase para nada de esto.
- **`/admin/sitio`** — logo (texto o imagen), colores de marca, navegación,
  textos del hero, la cinta animada, los 3 pasos de "cómo funciona", los
  textos de la página de pedido, el mensaje de confirmación, el footer y el
  los 4 pasos y cuidados de la página "¿Cómo estampamos?", y el SEO
  (título/descripción de la pestaña del navegador). Todo el sitio público
  lee estos valores en vivo, sin necesidad de tocar código ni redeployar.
- **`/admin/disenos`** — catálogo de diseños propios (subís imágenes vos). En
  `/pedido`, el cliente puede elegir entre subir su propia imagen o elegir uno
  de estos diseños ya cargados.
