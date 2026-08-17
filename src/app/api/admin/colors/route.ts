import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1),
  hex: z.string().min(4),
});

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { productId, name, hex } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service
    .from("product_colors")
    .insert({ product_id: productId, name, hex })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ color: data });
}
