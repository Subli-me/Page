/**
 * Traduce errores de la base a algo accionable.
 *
 * El caso que importa es el 23503: la base rechaza borrar algo que un pedido
 * todavía usa. Eso protege el historial —un pedido no puede quedar apuntando a
 * una zona que ya no existe— pero como error crudo no dice nada.
 */
export function mensajeDeBorrado(
  error: { code?: string } | null,
  que: string
): string | null {
  if (!error) return null;
  if (error.code === "23503") {
    return `No se puede borrar ${que} porque hay pedidos que la usan. Podés desactivarla para que deje de ofrecerse, sin perder el historial.`;
  }
  return `No se pudo borrar ${que}.`;
}
