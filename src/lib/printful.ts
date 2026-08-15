const PRINTFUL_API = "https://api.printful.com";

function headers() {
  return {
    Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    "Content-Type": "application/json",
    ...(process.env.PRINTFUL_STORE_ID ? { "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID } : {}),
  };
}

type TemplateDetail = {
  template_id: number;
  image_url: string;
  // Para algunos colores no viene foto de fondo, solo un color sólido
  // (la misma capa de sombras se reutiliza para todos los colores).
  background_url: string | null;
  background_color: string;
  template_width: number;
  template_height: number;
  print_area_width: number;
  print_area_height: number;
  print_area_top: number;
  print_area_left: number;
};

type TemplatesResponse = {
  variant_mapping: { variant_id: number; templates: { placement: string; template_id: number }[] }[];
  templates: TemplateDetail[];
};

// Las mismas plantillas (foto de la prenda en ese color + capa de sombras +
// área de impresión exacta) que usa Printful en su propio "Empezar a
// diseñar". Nos permite armar la vista previa en vivo, del lado del cliente,
// sin llamar a su generador de mockups (que es asíncrono y más lento).
export async function getVariantTemplate(
  printfulProductId: number,
  variantId: number,
  placement: string
): Promise<TemplateDetail | null> {
  const res = await fetch(`${PRINTFUL_API}/mockup-generator/templates/${printfulProductId}`, {
    headers: headers(),
  });
  if (!res.ok) return null;

  const json = await res.json();
  const data: TemplatesResponse = json.result;

  const mapping = data.variant_mapping.find((m) => m.variant_id === variantId);
  const templateRef = mapping?.templates.find((t) => t.placement === placement);
  if (!templateRef) return null;

  return data.templates.find((t) => t.template_id === templateRef.template_id) ?? null;
}
