import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const assignCategoriesSchema = z.object({
  category_ids: z.array(z.string().uuid()),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { category_ids } = assignCategoriesSchema.parse(body);

  const supabase = await createServiceClient();

  // Eliminar asignaciones existentes
  await supabase
    .from("design_category_assignments")
    .delete()
    .eq("design_id", id);

  // Insertar nuevas asignaciones
  if (category_ids.length > 0) {
    const { error } = await supabase
      .from("design_category_assignments")
      .insert(
        category_ids.map((cat_id, idx) => ({
          design_id: id,
          category_id: cat_id,
          sort_order: idx,
        }))
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
