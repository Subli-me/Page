import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { getVariantTemplate } from "@/lib/printful";

const schema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1).optional().nullable(),
  color: z.string().optional().nullable(),
  printZoneKey: z.string().min(1),
  // Sin imagen todavía se puede pedir la vista previa "en blanco" mientras
  // el cliente elige qué subir.
  imageUrl: z.string().url().optional().nullable(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { productId, size, color, printZoneKey, imageUrl } = parsed.data;

  const supabase = createServiceClient();

  // 1) ¿Hay un mockup propio cargado desde el admin para esta prenda/zona?
  // Si existe, tiene prioridad: es la foto real de la prenda que vendemos.
  const { data: ownMockup } = await supabase
    .from("product_mockups")
    .select("*")
    .eq("product_id", productId)
    .eq("print_zone_key", printZoneKey)
    .maybeSingle();

  if (ownMockup) {
    return NextResponse.json({
      available: true,
      source: "own",
      mockup: {
        baseImageUrl: ownMockup.image_url,
        foregroundUrl: null,
        overlay: {
          x: ownMockup.overlay_x,
          y: ownMockup.overlay_y,
          w: ownMockup.overlay_w,
          h: ownMockup.overlay_h,
        },
      },
    });
  }

  // 2) Plantilla real de Printful para esta prenda/talle/color/zona — el
  // mismo material que ellos usan en su propio editor. Funciona incluso
  // antes de subir el diseño (vista previa "en blanco" ya con el color
  // correcto).
  if (process.env.PRINTFUL_API_KEY && process.env.PRINTFUL_STORE_ID && size) {
    let variantQuery = supabase
      .from("product_variants")
      .select("printful_variant_id")
      .eq("product_id", productId)
      .eq("size", size);
    variantQuery = color ? variantQuery.eq("color", color) : variantQuery.is("color", null);

    const [{ data: product }, { data: zone }, { data: variant }] = await Promise.all([
      supabase.from("products").select("printful_product_id").eq("id", productId).single(),
      supabase.from("print_zones").select("printful_placement").eq("key", printZoneKey).single(),
      variantQuery.maybeSingle(),
    ]);

    if (product?.printful_product_id && zone?.printful_placement && variant?.printful_variant_id) {
      try {
        const template = await getVariantTemplate(
          product.printful_product_id,
          variant.printful_variant_id,
          zone.printful_placement
        );
        if (template) {
          return NextResponse.json({
            available: true,
            source: "printful-template",
            mockup: {
              baseImageUrl: template.background_url,
              baseColor: template.background_color,
              foregroundUrl: template.image_url,
              overlay: {
                x: (template.print_area_left / template.template_width) * 100,
                y: (template.print_area_top / template.template_height) * 100,
                w: (template.print_area_width / template.template_width) * 100,
                h: (template.print_area_height / template.template_height) * 100,
              },
            },
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  // 3) Nada disponible: si al menos hay imagen y zona, mostramos el diseño
  // con la zona en texto en vez de dejar todo vacío.
  return NextResponse.json({ available: false, canFallback: !!(imageUrl && printZoneKey) });
}
