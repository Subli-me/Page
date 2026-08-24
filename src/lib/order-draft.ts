/**
 * Guarda el pedido a medio armar en el navegador.
 *
 * Sin esto, recargar la página perdía todo: prenda, talle, la imagen subida y
 * la posición que el cliente ajustó a mano. En celular es peor de lo que suena,
 * porque para elegir una foto hay que salir del navegador a la galería y el
 * sistema puede matar la pestaña mientras tanto.
 *
 * Solo guardamos referencias (las imágenes ya viven en Cloudinary), así que el
 * borrador pesa unos pocos kilobytes.
 */

const KEY = "sublime:pedido-borrador";

/** Si cambia la forma de lo guardado, subir esto descarta los borradores viejos. */
const VERSION = 2;

/** Pasado este tiempo el borrador se considera abandonado. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type OrderDraft = {
  version: number;
  savedAt: number;
  step: number;
  productId: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  prints: Record<
    string,
    {
      image: { url: string; publicId: string } | null;
      transform: { tx: number; ty: number; scale: number; rotation: number } | null;
    }
  >;
  activeZone: string | null;
  contact: { name: string; email: string; phone: string; notes: string };
  /** Las prendas ya agregadas al pedido. */
  lines: {
    id: string;
    productId: string;
    size: string;
    color: string | null;
    quantity: number;
    prints: Record<
      string,
      {
        image: { url: string; publicId: string } | null;
        transform: { tx: number; ty: number; scale: number; rotation: number } | null;
      }
    >;
  }[];
  editingLineId: string | null;
};

/**
 * El evento `storage` del navegador solo llega a las *otras* pestañas, así que
 * avisamos aparte para que el botón del carrito se actualice en la misma.
 */
const DRAFT_EVENT = "sublime:borrador";

function notify() {
  try {
    window.dispatchEvent(new Event(DRAFT_EVENT));
  } catch {
    // en el servidor no hay window
  }
}

export function saveDraft(draft: Omit<OrderDraft, "version" | "savedAt">) {
  try {
    // Un borrador vacío no aporta nada al volver.
    if (!draft.productId && draft.lines.length === 0) return clearDraft();
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...draft, version: VERSION, savedAt: Date.now() })
    );
    notify();
  } catch {
    // Modo incógnito o almacenamiento lleno: seguir sin guardar es aceptable.
  }
}

/** Cuántas prendas hay en el pedido a medio armar. */
export function countDraftLines(): number {
  return loadDraft()?.lines?.length ?? 0;
}

/** Avisa cuando el borrador cambia, en esta pestaña o en otra. */
export function subscribeDraft(onChange: () => void): () => void {
  const handler = () => onChange();
  window.addEventListener(DRAFT_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(DRAFT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function loadDraft(): OrderDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const draft = JSON.parse(raw) as OrderDraft;
    if (draft.version !== VERSION) return clearDraft(), null;
    if (Date.now() - draft.savedAt > MAX_AGE_MS) return clearDraft(), null;
    if (!draft.productId && !draft.lines?.length) return null;

    return draft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
    notify();
  } catch {
    // nada que hacer
  }
}
