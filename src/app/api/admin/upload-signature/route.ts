import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

/**
 * Firma para las subidas del panel: catálogo de diseños, fotos de prendas,
 * mockups e imágenes del sitio.
 *
 * Va separada de la del cliente a propósito. La del pedido tiene que quedar
 * abierta para que cualquiera pueda subir su diseño, así que conviene que no
 * sirva también para escribir en la carpeta donde vive el catálogo.
 */
export async function POST() {
  if (!(await isAuthorizedAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "sublime-pedidos";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
