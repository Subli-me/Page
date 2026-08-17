import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
  category: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { name, imageUrl, imagePublicId, category } = parsed.data;

  const service = createServiceClient();
  const { data, error } = await service
    .from("design_catalog")
    .insert({
      name,
      image_url: imageUrl,
      image_public_id: imagePublicId,
      category: category ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ design: data });
}
