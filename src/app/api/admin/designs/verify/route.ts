import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export const maxDuration = 60;

/**
 * Revisa que el archivo de cada diseño siga existiendo en Cloudinary. La fila en
 * la base puede quedar apuntando a un archivo borrado: ahí el catálogo muestra
 * el nombre pero la imagen aparece rota.
 */
export async function POST() {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: designs, error } = await service
    .from("design_catalog")
    .select("id,name,image_url")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const checks = await Promise.all(
    (designs ?? []).map(async (d) => {
      if (!d.image_url) return { ...d, ok: false, status: 0 };
      try {
        const res = await fetch(d.image_url, { method: "GET", cache: "no-store" });
        return { ...d, ok: res.status === 200, status: res.status };
      } catch {
        return { ...d, ok: false, status: 0 };
      }
    })
  );

  const broken = checks.filter((c) => !c.ok);
  return NextResponse.json({
    total: checks.length,
    okCount: checks.length - broken.length,
    broken: broken.map((b) => ({ id: b.id, name: b.name, url: b.image_url, status: b.status })),
  });
}
