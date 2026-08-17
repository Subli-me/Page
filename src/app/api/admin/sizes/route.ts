import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1),
  priceDelta: z.number().default(0),
});

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { productId, size, priceDelta } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service
    .from("product_sizes")
    .insert({ product_id: productId, size, price_delta: priceDelta })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ size: data });
}
