import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";

const orderSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1),
  color: z.string().optional().nullable(),
  printZoneKey: z.string().min(1),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const supabase = createServiceClient();

  const [{ data: product }, { data: zone }] = await Promise.all([
    supabase.from("products").select("*").eq("id", data.productId).single(),
    supabase.from("print_zones").select("*").eq("key", data.printZoneKey).single(),
  ]);

  if (!product || !zone) {
    return NextResponse.json({ error: "Producto o zona inválidos" }, { status: 400 });
  }

  const sizeDelta = await supabase
    .from("product_sizes")
    .select("price_delta")
    .eq("product_id", data.productId)
    .eq("size", data.size)
    .maybeSingle();

  const totalPrice =
    Number(product.base_price) +
    Number(zone.extra_price) +
    Number(sizeDelta.data?.price_delta ?? 0);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      product_id: data.productId,
      size: data.size,
      color: data.color ?? null,
      print_zone_key: data.printZoneKey,
      image_url: data.imageUrl,
      image_public_id: data.imagePublicId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone ?? null,
      notes: data.notes ?? null,
      total_price: totalPrice,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "pedidos@resend.dev",
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Nuevo pedido — ${product.name} (${data.size})`,
        html: `
          <h2>Nuevo pedido personalizado</h2>
          <p><strong>Prenda:</strong> ${product.name} — Talle ${data.size}${data.color ? ` — Color ${data.color}` : ""}</p>
          <p><strong>Zona de estampado:</strong> ${zone.label}</p>
          <p><strong>Precio total:</strong> $${totalPrice}</p>
          <p><strong>Cliente:</strong> ${data.customerName} — ${data.customerEmail}${data.customerPhone ? ` — ${data.customerPhone}` : ""}</p>
          ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ""}
          <p><a href="${data.imageUrl}">Ver imagen en resolución original</a></p>
          <img src="${data.imageUrl}" style="max-width:400px;border:1px solid #eee" />
        `,
      });
    } catch (e) {
      console.error("No se pudo enviar el email de notificación", e);
    }
  }

  return NextResponse.json({ order });
}
