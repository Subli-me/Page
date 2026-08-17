import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const schema = z.object({
  label: z.string().min(1),
  extraPrice: z.number().default(0),
  extraCost: z.number().default(0),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { label, extraPrice, extraCost } = parsed.data;

  const service = createServiceClient();
  const key = `${slugify(label)}_${Date.now().toString(36)}`;

  const { data, error } = await service
    .from("print_zones")
    .insert({ key, label, extra_price: extraPrice, extra_cost: extraCost })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ zone: data });
}
