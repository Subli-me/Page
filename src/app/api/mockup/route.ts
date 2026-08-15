import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { createAndWaitMockup, getCatalogProductImage } from "@/lib/printful";

const schema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1).optional().nullable(),
  color: z.string().optional().nullable(),
  printZoneKey: z.string().min(1),
  // Sin imagen todavía se puede pedir la foto de la prenda para mostrarla
  // "en blanco" mientras el cliente elige qué subir.
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
      status: "completed",
      source: "own",
      mockup: {
        baseImageUrl: ownMockup.image_url,
        overlay: {
          x: ownMockup.overlay_x,
          y: ownMockup.overlay_y,
          w: ownMockup.overlay_w,
          h: ownMockup.overlay_h,
        },
      },
    });
  }

  if (!process.env.PRINTFUL_API_KEY) {
    return NextResponse.json({ available: false });
  }

  const { data: product } = await supabase
    .from("products")
    .select("printful_product_id")
    .eq("id", productId)
    .single();

  // 2) Sin imagen todavía: mostramos la foto de stock del catálogo de Printful
  // (sin ningún diseño aplicado), para no dejar la vista previa vacía.
  if (!imageUrl || !size) {
    if (product?.printful_product_id) {
      const blankImageUrl = await getCatalogProductImage(product.printful_product_id);
      if (blankImageUrl) {
        return NextResponse.json({ available: true, source: "printful-blank", blankImageUrl });
      }
    }
    return NextResponse.json({ available: false });
  }

  // 3) Con imagen + talle: generamos el mockup real con el diseño puesto,
  // si la prenda/talle/color está mapeada a una variante de Printful.
  let variantQuery = supabase
    .from("product_variants")
    .select("printful_variant_id")
    .eq("product_id", productId)
    .eq("size", size);
  variantQuery = color ? variantQuery.eq("color", color) : variantQuery.is("color", null);

  const [{ data: zone }, { data: variant }] = await Promise.all([
    supabase.from("print_zones").select("printful_placement").eq("key", printZoneKey).single(),
    variantQuery.maybeSingle(),
  ]);

  if (!product?.printful_product_id || !zone?.printful_placement || !variant?.printful_variant_id) {
    return NextResponse.json({ available: false });
  }

  try {
    const result = await createAndWaitMockup({
      printfulProductId: product.printful_product_id,
      variantIds: [variant.printful_variant_id],
      placement: zone.printful_placement,
      imageUrl,
    });

    if (result.status === "completed") {
      return NextResponse.json({
        available: true,
        status: "completed",
        source: "printful",
        mockupUrl: result.mockupUrl,
      });
    }
    return NextResponse.json({ available: true, status: result.status, source: "printful" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ available: false });
  }
}
