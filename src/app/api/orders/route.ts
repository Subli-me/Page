import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { buildOrderBreakdown } from "@/lib/pricing";

const printSchema = z.object({
  printZoneKey: z.string().min(1),
  imageUrl: z.string().url(),
  imagePublicId: z.string().min(1),
  designTransform: z
    .object({ tx: z.number(), ty: z.number(), scale: z.number(), rotation: z.number() })
    .optional()
    .nullable(),
  /** Como quedo la prenda con el diseno puesto. Puede faltar. */
  previewUrl: z.string().url().optional().nullable(),
});

/** Una prenda del pedido, con sus estampados. */
const lineSchema = z.object({
  productId: z.string().uuid(),
  size: z.string().min(1),
  color: z.string().optional().nullable(),
  quantity: z.number().int().min(1).max(500).default(1),
  prints: z.array(printSchema).min(1),
});

const orderSchema = z.object({
  lines: z.array(lineSchema).min(1).max(50),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  // Obligatorio: WhatsApp es el canal por el que se responde el pedido.
  customerPhone: z.string().min(8),
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

  const productIds = [...new Set(data.lines.map((l) => l.productId))];
  const zoneKeys = [...new Set(data.lines.flatMap((l) => l.prints.map((p) => p.printZoneKey)))];

  const [{ data: products }, { data: zones }, { data: combos }, { data: allSizes }] =
    await Promise.all([
      supabase.from("products").select("*").in("id", productIds),
      supabase.from("print_zones").select("*").in("key", zoneKeys),
      supabase.from("print_zone_combos").select("*"),
      supabase.from("product_sizes").select("product_id,size,price_delta").in("product_id", productIds),
    ]);

  if (!products || products.length !== productIds.length || !zones || zones.length !== zoneKeys.length) {
    return NextResponse.json({ error: "Producto o zonas inválidas" }, { status: 400 });
  }

  // El precio de cada prenda lo decide el servidor con la misma función que usa
  // el navegador para mostrarlo, no lo que haya calculado el cliente.
  const priced = data.lines.map((line) => {
    const product = products.find((p) => p.id === line.productId)!;
    const sizeDelta = Number(
      allSizes?.find((s) => s.product_id === line.productId && s.size === line.size)?.price_delta ?? 0
    );

    const breakdown = buildOrderBreakdown({
      productName: product.name,
      basePrice: Number(product.base_price),
      size: line.size,
      sizeDelta,
      zones,
      zoneKeys: line.prints.map((p) => p.printZoneKey),
      combos: combos ?? [],
      quantity: line.quantity,
    });

    return { line, product, breakdown };
  });

  const totalPrice = priced.reduce((sum, p) => sum + p.breakdown.total, 0);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      notes: data.notes ?? null,
      total_price: totalPrice,
      // Las columnas viejas quedan con la primera prenda para que cualquier
      // vista que todavía las lea siga mostrando algo con sentido.
      product_id: priced[0].line.productId,
      size: priced[0].line.size,
      color: priced[0].line.color ?? null,
      quantity: priced[0].line.quantity,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: insertedLines, error: linesError } = await supabase
    .from("order_lines")
    .insert(
      priced.map(({ line, breakdown }, i) => ({
        order_id: order.id,
        product_id: line.productId,
        size: line.size,
        color: line.color ?? null,
        quantity: line.quantity,
        unit_price: breakdown.unitTotal,
        line_total: breakdown.total,
        sort_order: i,
      }))
    )
    .select();

  if (linesError || !insertedLines) {
    return NextResponse.json({ error: linesError?.message ?? "No se pudo guardar" }, { status: 500 });
  }

  const ordered = [...insertedLines].sort((a, b) => a.sort_order - b.sort_order);

  const { error: itemsError } = await supabase.from("order_items").insert(
    priced.flatMap(({ line }, i) =>
      line.prints.map((p) => ({
        order_id: order.id,
        order_line_id: ordered[i].id,
        print_zone_key: p.printZoneKey,
        image_url: p.imageUrl,
        image_public_id: p.imagePublicId,
        design_transform: p.designTransform ?? null,
        preview_url: p.previewUrl ?? null,
      }))
    )
  );

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const linesHtml = priced
        .map(({ line, product, breakdown }) => {
          const zoneLabels = line.prints
            .map((p) => zones.find((z) => z.key === p.printZoneKey)?.label ?? p.printZoneKey)
            .join(", ");
          const images = line.prints
            .map((p) => `<img src="${p.imageUrl}" style="max-width:200px;border:1px solid #eee;margin:4px" />`)
            .join("");
          return `
            <div style="border-top:1px solid #eee;padding:12px 0">
              <p><strong>${product.name}</strong> — Talle ${line.size}${line.color ? ` — ${line.color}` : ""} — x${line.quantity}</p>
              <p>Zonas: ${zoneLabels} — ${breakdown.total}</p>
              ${images}
            </div>`;
        })
        .join("");

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "pedidos@resend.dev",
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Nuevo pedido — ${priced.length} prenda${priced.length !== 1 ? "s" : ""}`,
        html: `
          <h2>Nuevo pedido personalizado</h2>
          ${linesHtml}
          <p><strong>Total:</strong> $${totalPrice}</p>
          <p><strong>Cliente:</strong> ${data.customerName} — ${data.customerEmail}${data.customerPhone ? ` — ${data.customerPhone}` : ""}</p>
          ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ""}
        `,
      });
    } catch (e) {
      console.error("No se pudo enviar el email de notificación", e);
    }
  }

  return NextResponse.json({ order });
}
