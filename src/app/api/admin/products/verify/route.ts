import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export const maxDuration = 60;

async function check(url: string | null) {
  if (!url) return { ok: false, status: 0 };
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    return { ok: res.status === 200, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/**
 * Revisa que sigan existiendo la foto de cada prenda y la de cada mockup.
 *
 * Una fila puede quedar apuntando a un archivo borrado: la prenda sigue en el
 * catálogo pero se ve rota. Y como el navegador cachea, el que ya la vio
 * funcionando la sigue viendo bien — el problema solo aparece del lado de los
 * clientes nuevos, que es justo donde no lo notamos.
 */
export async function POST() {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const service = createServiceClient();
  const [{ data: products }, { data: mockups }] = await Promise.all([
    service.from("products").select("id,name,image_url").order("sort_order"),
    service.from("product_mockups").select("id,product_id,print_zone_key,image_url"),
  ]);

  const productResults = await Promise.all(
    (products ?? []).map(async (p) => ({ ...p, ...(await check(p.image_url)) }))
  );
  const mockupResults = await Promise.all(
    (mockups ?? []).map(async (m) => ({ ...m, ...(await check(m.image_url)) }))
  );

  const brokenProducts = productResults.filter((p) => !p.ok);
  const brokenMockups = mockupResults.filter((m) => !m.ok);

  return NextResponse.json({
    totalProducts: productResults.length,
    totalMockups: mockupResults.length,
    brokenProducts: brokenProducts.map((p) => ({
      id: p.id,
      name: p.name,
      url: p.image_url,
      status: p.status,
    })),
    brokenMockups: brokenMockups.map((m) => ({
      id: m.id,
      productId: m.product_id,
      zoneKey: m.print_zone_key,
      url: m.image_url,
      status: m.status,
    })),
  });
}
