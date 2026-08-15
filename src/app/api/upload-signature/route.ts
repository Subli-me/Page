import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// Genera una firma para que el cliente suba la imagen directo a Cloudinary
// (sin pasar el archivo por nuestro servidor) manteniendo el folder controlado.
export async function POST() {
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
