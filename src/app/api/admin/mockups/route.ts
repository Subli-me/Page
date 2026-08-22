import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  productId: z.string().uuid(),
  print_zone_key: z.string().min(1),
  image_url: z.string().url(),
  image_public_id: z.string(),
  overlay_x: z.number().int().min(0),
  overlay_y: z.number().int().min(0),
  overlay_w: z.number().int().min(1),
  overlay_h: z.number().int().min(1),
});

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { productId, print_zone_key, image_url, image_public_id, overlay_x, overlay_y, overlay_w, overlay_h } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service
    .from("product_mockups")
    .upsert(
      {
        product_id: productId,
        print_zone_key,
        image_url,
        image_public_id,
        overlay_x,
        overlay_y,
        overlay_w,
        overlay_h,
      },
      { onConflict: "product_id,print_zone_key" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mockup: data });
}
