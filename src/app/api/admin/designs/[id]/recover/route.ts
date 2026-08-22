import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";
import { SITE_URL } from "@/lib/site-url";

export const maxDuration = 60;

// Anchos y calidades que Next pudo haber generado. Solo existen los tamaños
// que alguna vez se pidieron, por eso probamos varios.
const WIDTHS = [3840, 1920, 1200, 828, 640, 384];
const QUALITIES = [75, 100, 90, 80];

/**
 * Intenta rescatar la imagen de un diseño cuyo archivo ya no está en Cloudinary.
 *
 * La única copia que puede quedar es la que generó el optimizador de imágenes de
 * Next: al servirse desde `/_next/image` queda cacheada aunque el origen muera.
 * Es un rescate de emergencia, no un respaldo: si esa caché ya se venció, no hay
 * nada que recuperar y hay que volver a subir el archivo a mano.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const service = createServiceClient();

  const { data: design, error } = await service
    .from("design_catalog")
    .select("id,name,image_url")
    .eq("id", id)
    .single();

  if (error || !design) {
    return NextResponse.json({ error: "Diseño no encontrado" }, { status: 404 });
  }

  // Si el archivo sigue vivo no hay nada que hacer.
  try {
    const head = await fetch(design.image_url, { method: "GET", cache: "no-store" });
    if (head.status === 200) {
      return NextResponse.json({ recovered: false, reason: "La imagen ya está disponible." });
    }
  } catch {
    // seguimos con el rescate
  }

  let buffer: Buffer | null = null;
  let source = "";
  outer: for (const q of QUALITIES) {
    for (const w of WIDTHS) {
      const proxy = `${SITE_URL}/_next/image?url=${encodeURIComponent(design.image_url)}&w=${w}&q=${q}`;
      try {
        const res = await fetch(proxy, {
          headers: { Accept: "image/webp,image/*" },
          cache: "no-store",
        });
        if (res.status === 200) {
          buffer = Buffer.from(await res.arrayBuffer());
          source = `${w}px q${q}`;
          break outer;
        }
      } catch {
        // probamos el siguiente tamaño
      }
    }
  }

  if (!buffer) {
    return NextResponse.json({
      recovered: false,
      reason: "No quedó ninguna copia en caché. Hay que subir el archivo de nuevo a mano.",
    });
  }

  const dataUri = `data:image/webp;base64,${buffer.toString("base64")}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, { folder: "sublime-pedidos" });

  const { error: updateError } = await service
    .from("design_catalog")
    .update({ image_url: uploaded.secure_url, image_public_id: uploaded.public_id })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    recovered: true,
    source,
    width: uploaded.width,
    height: uploaded.height,
    imageUrl: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
  });
}
