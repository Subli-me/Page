import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sort_order: z.number(),
    })
  ),
});

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const service = createServiceClient();
  for (const item of parsed.data.items) {
    await service
      .from("products")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id);
  }

  return NextResponse.json({ ok: true });
}
