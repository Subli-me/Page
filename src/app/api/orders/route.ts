import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";

const printSchema = z.object({
  printZoneKey: z.string().min(1),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
  designTransform: z
    .object({ tx: z.number(), ty: z.number(), scale: z.number(), rotation: z.number() })
    .optional()
    .nullable(),
});

const orderSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1),
  color: z.string().optional().nullable(),
  prints: z.array(printSchema).min(1),
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

  const zoneKeys = data.prints.map((p) => p.printZoneKey);

  const [{ data: product }, { data: zones }] = await Promise.all([
    supabase.from("products").select("*").eq("id", data.productId).single(),
    supabase.from("print_zones").select("*").in("key", zoneKeys),
  ]);

  if (!product || !zones || zones.length !== new Set(zoneKeys).size) {
    return NextResponse.json({ error: "Producto o zonas inválidas" }, { status: 400 });
  }

  const sizeDelta = await supabase
    .from("product_sizes")
    .select("price_delta")
    .eq("product_id", data.productId)
    .eq("size", data.size)
    .maybeSingle();

  const extraTotal = zones.reduce((sum, z) => sum + Number(z.extra_price), 0);
  const totalPrice = Number(product.base_price) + extraTotal + Number(sizeDelta.data?.price_delta ?? 0);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      product_id: data.productId,
      size: data.size,
      color: data.color ?? null,
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

  const { error: itemsError } = await supabase.from("order_items").insert(
    data.prints.map((p) => ({
      order_id: order.id,
      print_zone_key: p.printZoneKey,
      image_url: p.imageUrl,
      image_public_id: p.imagePublicId,
      design_transform: p.designTransform ?? null,
    }))
  );

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const zoneLabels = data.prints
        .map((p) => zones.find((z) => z.key === p.printZoneKey)?.label ?? p.printZoneKey)
        .join(", ");
      const imagesHtml = data.prints
        .map((p) => `<img src="${p.imageUrl}" style="max-width:250px;border:1px solid #eee;margin:4px" />`)
        .join("");

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "pedidos@resend.dev",
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Nuevo pedido — ${product.name} (${data.size})`,
        html: `
          <h2>Nuevo pedido personalizado</h2>
          <p><strong>Prenda:</strong> ${product.name} — Talle ${data.size}${data.color ? ` — Color ${data.color}` : ""}</p>
          <p><strong>Zonas de estampado:</strong> ${zoneLabels}</p>
          <p><strong>Precio total:</strong> $${totalPrice}</p>
          <p><strong>Cliente:</strong> ${data.customerName} — ${data.customerEmail}${data.customerPhone ? ` — ${data.customerPhone}` : ""}</p>
          ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ""}
          ${imagesHtml}
        `,
      });
    } catch (e) {
      console.error("No se pudo enviar el email de notificación", e);
    }
  }

  return NextResponse.json({ order });
}
