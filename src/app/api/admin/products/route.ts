import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  name: z.string().min(1),
  basePrice: z.number().default(0),
  baseCost: z.number().default(0),
  imageUrl: z.string().url().optional().nullable(),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { name, basePrice, baseCost, imageUrl } = parsed.data;

  const service = createServiceClient();
  const slug = `${slugify(name)}-${Date.now().toString(36)}`;

  const { data, error } = await service
    .from("products")
    .insert({
      name,
      slug,
      base_price: basePrice,
      base_cost: baseCost,
      image_url: imageUrl ?? null,
      active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
