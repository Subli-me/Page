import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { mensajeDeBorrado } from "@/lib/db-errors";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const allowed = ["label", "extra_price", "extra_cost"];
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  const service = createServiceClient();
  const { error } = await service.from("print_zones").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const service = createServiceClient();
  const { error } = await service.from("print_zones").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: mensajeDeBorrado(error, "esta zona") },
      { status: error.code === "23503" ? 409 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
