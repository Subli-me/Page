import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1),
  color: z.string().nullable().optional(),
  /** Nulo significa dejar de controlar el stock de esa combinación. */
  quantity: z.number().int().min(0).nullable(),
});

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { productId, size, color, quantity } = parsed.data;
  const service = createServiceClient();

  // Sin cantidad se borra la fila y la combinación vuelve a "sin control".
  if (quantity === null) {
    let q = service.from("product_stock").delete().eq("product_id", productId).eq("size", size);
    q = color ? q.eq("color", color) : q.is("color", null);
    const { error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, removed: true });
  }

  let existing = service
    .from("product_stock")
    .select("id")
    .eq("product_id", productId)
    .eq("size", size);
  existing = color ? existing.eq("color", color) : existing.is("color", null);
  const { data: fila } = await existing.maybeSingle();

  const { data, error } = fila
    ? await service
        .from("product_stock")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("id", fila.id)
        .select()
        .single()
    : await service
        .from("product_stock")
        .insert({ product_id: productId, size, color: color ?? null, quantity })
        .select()
        .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stock: data });
}
