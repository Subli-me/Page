import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  productId: z.string().uuid(),
  printZoneKey: z.string().min(1),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
});

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { productId, printZoneKey, imageUrl, imagePublicId } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service
    .from("product_mockups")
    .upsert(
      {
        product_id: productId,
        print_zone_key: printZoneKey,
        image_url: imageUrl,
        image_public_id: imagePublicId,
      },
      { onConflict: "product_id,print_zone_key" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ mockup: data });
}
