import { fabricColor, garmentLayers } from "@/components/GarmentPreview";
import type { DesignTransform } from "@/components/order/DesignAdjuster";

/**
 * Rehace en un canvas la vista previa que armó el cliente: la prenda del color
 * elegido con el diseño ubicado, escalado y rotado como lo dejó.
 *
 * Sin esto solo se manda la imagen suelta y del otro lado hay que adivinar
 * dónde iba y de qué tamaño.
 *
 * Tiene que dar igual que lo que se ve en pantalla, así que replica lo que hace
 * el DOM: el color va de fondo, encima la foto repetida según lo oscuro que sea
 * (ver GarmentPreview) y arriba el diseño, que arranca ocupando el 55% del
 * ancho de la zona y se transforma respecto de su centro.
 */

/** Proporción del ancho de la zona que ocupa el diseño sin escalar. */
const DESIGN_BASE_WIDTH = 0.55;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

export async function renderOrderPreview({
  garmentUrl,
  colorHex,
  overlay,
  designUrl,
  transform,
}: {
  garmentUrl: string;
  colorHex?: string | null;
  /** Zona de estampado, en % del ancho y alto de la foto. */
  overlay: { x: number; y: number; w: number; h: number };
  designUrl: string;
  transform?: DesignTransform | null;
}): Promise<Blob | null> {
  try {
    const [garment, design] = await Promise.all([loadImage(garmentUrl), loadImage(designUrl)]);

    const W = garment.naturalWidth;
    const H = garment.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fondo del color elegido: la tela de la foto es semitransparente y lo deja
    // pasar, el fondo opaco lo tapa.
    if (colorHex) {
      ctx.fillStyle = fabricColor(colorHex);
      ctx.fillRect(0, 0, W, H);
    }

    const layers = colorHex ? garmentLayers(colorHex) : 1;
    for (let i = 0; i < layers; i++) ctx.drawImage(garment, 0, 0, W, H);

    // Zona de estampado en píxeles.
    const zoneX = (overlay.x / 100) * W;
    const zoneY = (overlay.y / 100) * H;
    const zoneW = (overlay.w / 100) * W;
    const zoneH = (overlay.h / 100) * H;

    const t = transform ?? { tx: 0, ty: 0, scale: 1, rotation: 0 };

    // El diseño se transforma respecto de su centro, que arranca en el centro
    // de la zona y se corre según lo que arrastró el cliente.
    const centerX = zoneX + zoneW / 2 + t.tx * zoneW;
    const centerY = zoneY + zoneH / 2 + t.ty * zoneH;

    const baseW = zoneW * DESIGN_BASE_WIDTH;
    const baseH = baseW * (design.naturalHeight / design.naturalWidth);

    ctx.save();
    // Recortamos a la zona: en pantalla el diseño no puede salirse de ahí.
    ctx.beginPath();
    ctx.rect(zoneX, zoneY, zoneW, zoneH);
    ctx.clip();

    ctx.translate(centerX, centerY);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.scale(t.scale, t.scale);
    ctx.drawImage(design, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();

    return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  } catch {
    // Si algo falla preferimos seguir sin la composición antes que trabar el
    // pedido: el diseño original igual viaja en el mensaje.
    return null;
  }
}

/** Sube la composición a Cloudinary y devuelve su URL. */
export async function uploadPreview(blob: Blob): Promise<string | null> {
  try {
    const sigRes = await fetch("/api/upload-signature", { method: "POST" });
    const sig = await sigRes.json();

    const form = new FormData();
    form.append("file", new File([blob], "preview.png", { type: "image/png" }));
    form.append("api_key", sig.apiKey);
    form.append("timestamp", sig.timestamp);
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    // Va firmado, así que tiene que viajar tal cual vino.
    if (sig.allowed_formats) form.append("allowed_formats", sig.allowed_formats);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.secure_url ?? null;
  } catch {
    return null;
  }
}
