import { NextResponse } from "next/server";
import sharp from "sharp";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export const maxDuration = 60;

/** Ancho mínimo para que el estampado salga nítido. Ver lib/image-check.ts. */
const MIN_ANCHO = 1200;

/** Debajo de esto la imagen es un rectángulo opaco y se estampa el recuadro. */
const MIN_TRANSPARENCIA = 0.02;

type Revision = {
  id: string;
  name: string;
  url: string | null;
  ok: boolean;
  status: number;
  width?: number;
  height?: number;
  transparencia?: number;
  problemas: ("resolucion" | "fondo")[];
};

/**
 * Mira los píxeles y no el formato: un archivo puede tener canal alfa y ser
 * igual un rectángulo opaco, que es justo el caso que termina imprimiendo un
 * recuadro sobre la prenda.
 */
async function analizar(buf: Buffer) {
  const meta = await sharp(buf).metadata();

  // Alcanza con una version chica: buscamos una proporcion, no precision.
  const { data, info } = await sharp(buf)
    .resize(120, null, { withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let transparentes = 0;
  const total = info.width * info.height;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] < 250) transparentes++;
  }

  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    transparencia: total ? transparentes / total : 0,
  };
}

async function revisar(d: { id: string; name: string; image_url: string | null }): Promise<Revision> {
  const base = { id: d.id, name: d.name, url: d.image_url, problemas: [] as Revision["problemas"] };

  if (!d.image_url) return { ...base, ok: false, status: 0 };

  try {
    const res = await fetch(d.image_url, { cache: "no-store" });
    if (res.status !== 200) return { ...base, ok: false, status: res.status };

    const buf = Buffer.from(await res.arrayBuffer());
    const { width, height, transparencia } = await analizar(buf);

    const problemas: Revision["problemas"] = [];
    if (width && width < MIN_ANCHO) problemas.push("resolucion");
    if (transparencia < MIN_TRANSPARENCIA) problemas.push("fondo");

    return { ...base, ok: true, status: 200, width, height, transparencia, problemas };
  } catch {
    return { ...base, ok: false, status: 0 };
  }
}

/**
 * Revisa que el archivo de cada diseño siga existiendo en Cloudinary y, de
 * paso, si va a dar problemas al imprimirse. Se aprovecha la misma descarga
 * para las dos cosas.
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

  // De a tandas, para no tener 48 imagenes completas en memoria a la vez.
  const revisiones: Revision[] = [];
  const lote = 8;
  for (let i = 0; i < (designs ?? []).length; i += lote) {
    revisiones.push(...(await Promise.all((designs ?? []).slice(i, i + lote).map(revisar))));
  }

  const broken = revisiones.filter((r) => !r.ok);
  const quality = revisiones.filter((r) => r.ok && r.problemas.length > 0);

  return NextResponse.json({
    total: revisiones.length,
    okCount: revisiones.length - broken.length,
    broken: broken.map((b) => ({ id: b.id, name: b.name, url: b.url, status: b.status })),
    quality: quality.map((q) => ({
      id: q.id,
      name: q.name,
      width: q.width,
      height: q.height,
      problemas: q.problemas,
    })),
  });
}
