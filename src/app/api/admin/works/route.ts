import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
  caption: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  quote: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const service = createServiceClient();

  // Al final de la lista, que es donde se espera que aparezca lo recién subido.
  const { data: ultimo } = await service
    .from("work_showcase")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await service
    .from("work_showcase")
    .insert({
      image_url: parsed.data.imageUrl,
      image_public_id: parsed.data.imagePublicId,
      caption: parsed.data.caption || null,
      customer_name: parsed.data.customerName || null,
      quote: parsed.data.quote || null,
      sort_order: (ultimo?.sort_order ?? 0) + 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ work: data });
}
