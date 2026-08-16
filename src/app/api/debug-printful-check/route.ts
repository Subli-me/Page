import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getVariantTemplate } from "@/lib/printful";

// Endpoint temporal de diagnóstico — se borra después de resolver el problema.
export async function GET() {
  const hasKey = !!process.env.PRINTFUL_API_KEY;
  const hasStore = !!process.env.PRINTFUL_STORE_ID;
  const storeIdValue = process.env.PRINTFUL_STORE_ID ?? null;

  const supabase = createServiceClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, printful_product_id")
    .eq("slug", "remera-oversize")
    .single();

  const { data: zone, error: zoneError } = await supabase
    .from("print_zones")
    .select("printful_placement")
    .eq("key", "front_chest")
    .single();

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("printful_variant_id")
    .eq("product_id", product?.id ?? "")
    .single();

  let templateResult: unknown = null;
  let templateError: string | null = null;
  if (hasKey && hasStore && product?.printful_product_id && zone?.printful_placement) {
    try {
      templateResult = await getVariantTemplate(
        product.printful_product_id,
        4011, // variant conocida: remera S Blanco
        zone.printful_placement
      );
    } catch (e) {
      templateError = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json({
    hasKey,
    hasStore,
    storeIdValue,
    product,
    productError: productError?.message ?? null,
    zone,
    zoneError: zoneError?.message ?? null,
    variantSample: variant,
    variantError: variantError?.message ?? null,
    templateResult,
    templateError,
  });
}
