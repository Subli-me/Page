import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { createServiceClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import { ORDER_WHATSAPP_NUMBERS, whatsappLink } from "@/lib/contact";

/**
 * El pedido confirmado, en una página propia que se puede volver a abrir.
 *
 * Antes la confirmación vivía solo en la memoria del navegador: si el cliente
 * recargaba o cerraba la pestaña antes de tocar el botón de WhatsApp, se
 * quedaba sin forma de avisarnos y el pedido quedaba huérfano en el panel.
 *
 * La dirección lleva el identificador completo del pedido, que no se puede
 * adivinar, así que sirve de enlace privado para el cliente.
 */

export const dynamic = "force-dynamic";

const money = (n: number) => `$${Number(n).toLocaleString("es-AR")}`;

const ESTADOS: Record<string, string> = {
  pendiente: "Lo recibimos y lo estamos revisando",
  confirmado: "Confirmado, entra a producción",
  impreso: "Ya está impreso",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Sin un identificador con forma válida no hace falta ni consultar.
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = createServiceClient();
  const [{ data: order }, settings] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "*, order_lines(*, products(name), order_items(*, print_zones(label))), order_items(*, print_zones(label)), products(name)"
      )
      .eq("id", id)
      .maybeSingle(),
    getSiteSettings(),
  ]);

  if (!order) notFound();

  const lines =
    order.order_lines?.length > 0
      ? [...order.order_lines].sort(
          (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
        )
      : [
          {
            id: order.id,
            size: order.size,
            color: order.color,
            quantity: order.quantity ?? 1,
            line_total: order.total_price ?? 0,
            products: order.products,
            order_items: order.order_items ?? [],
          },
        ];

  const numero = order.id.slice(0, 8);

  const waMessage = [
    `*PEDIDO #${numero}*`,
    "",
    ...lines.flatMap((l: (typeof lines)[number]) => [
      `${l.products?.name ?? "Prenda"} — Talle ${l.size}${l.color ? ` — ${l.color}` : ""} — x${l.quantity}`,
      ...(l.order_items ?? []).map(
        (i: { print_zones: { label: string } | null; print_zone_key: string; preview_url?: string | null; image_url: string }) =>
          `  ${i.print_zones?.label ?? i.print_zone_key}: ${i.preview_url ?? i.image_url}`
      ),
    ]),
    "",
    `TOTAL: ${money(order.total_price ?? 0)}`,
    "",
    order.customer_name,
    order.customer_phone ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-24 sm:pt-20">
          <div className="rounded-2xl border border-line bg-panel p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Check size={28} />
            </div>
            <p className="font-mono text-xs text-accent">PEDIDO #{numero}</p>
            <h1 className="mt-2 font-display text-3xl">{settings.confirmation_title}</h1>
            <p className="mt-3 text-sm text-ink-soft">
              {ESTADOS[order.status] ?? order.status}. Guardá esta página: podés
              volver cuando quieras para ver tu pedido.
            </p>

            <div className="mx-auto mt-7 max-w-md rounded-xl border border-line bg-paper px-6 py-5">
              <p className="text-sm font-medium">Mandanos el pedido por WhatsApp</p>
              <p className="mt-1 text-xs text-ink-soft">
                Así lo vemos al toque y te confirmamos más rápido. Elegí a quién
                escribirle:
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {ORDER_WHATSAPP_NUMBERS.map((n) => (
                  <a
                    key={n.wa}
                    href={whatsappLink(n.wa, waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent"
                  >
                    <MessageCircle size={15} />
                    {n.name ?? n.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {lines.map((l: (typeof lines)[number], i: number) => (
              <div key={l.id} className="rounded-xl border border-line bg-panel p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    <span className="mr-2 text-ink-soft">{i + 1}.</span>
                    {l.products?.name ?? "Prenda"} — Talle {l.size}
                    {l.color ? ` — ${l.color}` : ""}
                    {l.quantity > 1 && <span className="text-ink-soft"> × {l.quantity}</span>}
                  </p>
                  <p className="text-sm tabular-nums">{money(l.line_total)}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {(l.order_items ?? []).map(
                    (item: {
                      id: string;
                      preview_url?: string | null;
                      image_url: string;
                      print_zone_key: string;
                      print_zones: { label: string } | null;
                    }) => (
                      <div key={item.id} className="w-20">
                        <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-paper">
                          <Image
                            src={item.preview_url ?? item.image_url}
                            alt={item.print_zones?.label ?? item.print_zone_key}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <p className="mt-1 truncate text-center text-[11px] text-ink-soft">
                          {item.print_zones?.label ?? item.print_zone_key}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between gap-4 rounded-xl border border-line bg-paper px-4 py-3">
              <span className="font-medium">Total</span>
              <span className="font-display text-xl tabular-nums">
                {money(order.total_price ?? 0)}
              </span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pedido"
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm hover:border-ink hover:bg-panel transition-colors"
            >
              Hacer otro pedido <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
