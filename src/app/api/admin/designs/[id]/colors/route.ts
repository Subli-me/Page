import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const assignColorsSchema = z.object({
  color_ids: z.array(z.string()),
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
  const { color_ids } = assignColorsSchema.parse(body);

  const supabase = await createServiceClient();

  // Eliminar asignaciones existentes
  await supabase
    .from("design_color_assignments")
    .delete()
    .eq("design_id", id);

  // Insertar nuevas asignaciones
  if (color_ids.length > 0) {
    const { error } = await supabase
      .from("design_color_assignments")
      .insert(
        color_ids.map((color, idx) => ({
          design_id: id,
          color: color,
          sort_order: idx,
        }))
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
