import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const allowed = ["name", "hex", "sort_order"];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  if (typeof update.hex === "string" && !/^#[0-9a-f]{6}$/i.test(update.hex)) {
    return NextResponse.json({ error: "Color inválido" }, { status: 400 });
  }

  const service = createServiceClient();

  // El stock guarda el color por nombre, así que renombrarlo dejaría esas filas
  // huérfanas y la combinación pasaría a "sin control" sin que nadie lo note.
  const { data: anterior } = await service
    .from("product_colors")
    .select("product_id,name")
    .eq("id", id)
    .maybeSingle();

  const { error } = await service.from("product_colors").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (anterior && typeof update.name === "string" && update.name !== anterior.name) {
    await service
      .from("product_stock")
      .update({ color: update.name })
      .eq("product_id", anterior.product_id)
      .eq("color", anterior.name);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const service = createServiceClient();
  const { error } = await service.from("product_colors").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
