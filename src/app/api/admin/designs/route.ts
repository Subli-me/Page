import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const itemSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
});

const schema = z.union([
  itemSchema,
  z.object({
    items: z.array(itemSchema).min(1),
  }),
]);

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const service = createServiceClient();

  if ("items" in parsed.data) {
    const rows = parsed.data.items.map((it) => ({
      name: it.name,
      image_url: it.imageUrl,
      image_public_id: it.imagePublicId,
    }));
    const { data, error } = await service
      .from("design_catalog")
      .insert(rows)
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const designsWithDetails = data?.map((d) => ({
      ...d,
      color_ids: [],
      category_ids: [],
    })) || [];
    return NextResponse.json({ designs: designsWithDetails });
  } else {
    const { name, imageUrl, imagePublicId } = parsed.data;
    const { data, error } = await service
      .from("design_catalog")
      .insert({
        name,
        image_url: imageUrl,
        image_public_id: imagePublicId,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({
      design: {
        ...data,
        color_ids: [],
        category_ids: [],
      },
    });
  }
}
