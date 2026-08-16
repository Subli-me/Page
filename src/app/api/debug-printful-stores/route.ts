import { NextResponse } from "next/server";

// Endpoint temporal de diagnóstico — se borra después de confirmar el store_id.
export async function GET() {
  if (!process.env.PRINTFUL_API_KEY) {
    return NextResponse.json({ error: "PRINTFUL_API_KEY no está configurada" }, { status: 400 });
  }
  const res = await fetch("https://api.printful.com/stores", {
    headers: { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` },
  });
  const json = await res.json();
  return NextResponse.json(json);
}
