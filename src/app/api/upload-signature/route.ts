import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Firma para que el cliente suba su diseño directo a Cloudinary.
 *
 * Tiene que quedar abierta: quien arma un pedido no tiene sesión, y hacer pasar
 * el archivo por el servidor chocaría con el límite de tamaño de las funciones,
 * que un archivo para imprimir supera sin esfuerzo.
 *
 * Lo que sí se puede es acotar el daño:
 *
 * - Va a su propia carpeta, separada del catálogo. Si alguien abusa, se vacía
 *   `sublime-clientes` sin tocar los diseños ni las fotos de las prendas.
 * - La carpeta y los formatos van firmados, así que el cliente no puede
 *   cambiarlos: la firma deja de valer si los toca.
 * - Hay un tope de pedidos por IP.
 *
 * Las subidas del panel usan /api/admin/upload-signature, que sí pide sesión.
 */

/** Carpeta propia, para poder limpiarla sin llevarse nada más puesto. */
const FOLDER = "sublime-clientes";

/** Lo que se puede estampar o mandar como referencia, nada más. */
const ALLOWED_FORMATS = "png,jpg,jpeg,webp,gif,svg,mp4,webm,mov";

const MAX_POR_IP = 40;
const VENTANA_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limite = rateLimit(`upload:${ip}`, MAX_POR_IP, VENTANA_MS);

  if (!limite.ok) {
    return NextResponse.json(
      { error: "Demasiadas subidas seguidas. Esperá un momento y probá de nuevo." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limite.esperarMs / 1000)) } }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Todo lo que se firma queda fijo: si el cliente lo cambia, Cloudinary
  // rechaza la subida por firma inválida.
  const params = { timestamp, folder: FOLDER, allowed_formats: ALLOWED_FORMATS };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
