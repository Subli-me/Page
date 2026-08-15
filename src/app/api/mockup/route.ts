import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { createAndWaitMockup } from "@/lib/printful";

const schema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1),
  color: z.string().optional().nullable(),
  printZoneKey: z.string().min(1),
  imageUrl: z.string().url(),
});

export async function POST(req: Request) {
  if (!process.env.PRINTFUL_API_KEY) {
    return NextResponse.json({ available: false }, { status: 200 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { productId, size, color, printZoneKey, imageUrl } = parsed.data;

  const supabase = createServiceClient();

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

  if (!product?.printful_product_id || !zone?.printful_placement || !variant?.printful_variant_id) {
    // Todavía no se configuró el mapeo a Printful para esta prenda/talle/color.
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
      return NextResponse.json({ available: true, status: "completed", mockupUrl: result.mockupUrl });
    }
    return NextResponse.json({ available: true, status: result.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ available: false });
  }
}
