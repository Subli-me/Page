import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = [
  "logo_text",
  "logo_url",
  "favicon_emoji",
  "color_accent",
  "color_lime",
  "hero_badge",
  "hero_title_line1",
  "hero_title_line2",
  "hero_subtitle",
  "hero_cta_label",
  "marquee_text",
  "step1_title",
  "step1_text",
  "step2_title",
  "step2_text",
  "step3_title",
  "step3_text",
  "footer_headline_line1",
  "footer_headline_line2",
  "footer_tagline",
  "contact_email",
  "contact_phone",
  "contact_instagram",
  "seo_title",
  "seo_description",
  "nav_catalog_label",
  "pedido_badge",
  "pedido_title",
  "pedido_subtitle",
  "confirmation_title",
  "confirmation_message",
  "footer_copyright_suffix",
  "nav_process_label",
  "process_title",
  "process_subtitle",
  "process_step1_title",
  "process_step1_text",
  "process_step2_title",
  "process_step2_text",
  "process_step3_title",
  "process_step3_text",
  "process_step4_title",
  "process_step4_text",
  "care_title",
  "care_text",
];

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_FIELDS.includes(k))
  );

  const service = createServiceClient();
  const { error } = await service.from("site_settings").update(update).eq("id", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
