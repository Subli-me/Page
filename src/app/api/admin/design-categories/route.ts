import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sort_order: z.number().int().default(0),
});

export async function GET() {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("design_categories")
    .select("*")
    .order("sort_order");
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCategorySchema.parse(body);

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("design_categories")
    .insert({
      name: parsed.name,
      description: parsed.description || null,
      sort_order: parsed.sort_order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
