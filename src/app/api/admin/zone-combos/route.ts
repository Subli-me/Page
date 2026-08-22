import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { sortedZonePair } from "@/lib/pricing";

const schema = z.object({
  zoneA: z.string().min(1),
  zoneB: z.string().min(1),
  extraPrice: z.number().min(0),
});

export async function POST(req: Request) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { zoneA, zoneB, extraPrice } = parsed.data;
  if (zoneA === zoneB) {
    return NextResponse.json({ error: "Elegí dos zonas distintas" }, { status: 400 });
  }

  // Guardamos el par ordenado para que no entre dos veces la misma regla dada
  // vuelta.
  const [a, b] = sortedZonePair(zoneA, zoneB);

  const service = createServiceClient();
  const { data, error } = await service
    .from("print_zone_combos")
    .insert({ zone_a_key: a, zone_b_key: b, extra_price: extraPrice })
    .select()
    .single();

  if (error) {
    const duplicated = error.code === "23505";
    return NextResponse.json(
      { error: duplicated ? "Ya existe una regla para esas dos zonas" : error.message },
      { status: duplicated ? 409 : 500 }
    );
  }

  return NextResponse.json({ combo: data });
}
