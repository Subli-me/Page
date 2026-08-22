/**
 * Celulares a los que se avisan los pedidos.
 *
 * `wa.me` necesita el número en formato internacional sin signos ni espacios.
 * En Argentina los móviles llevan un 9 entre el país (54) y el área: el
 * 381 664-2680 queda como 5493816642680.
 *
 * El primero es el que aparece en el botón principal al terminar el pedido.
 */
export const ORDER_WHATSAPP_NUMBERS = [
  { label: "381 664-2680", wa: "5493816642680" },
  { label: "388 439-8192", wa: "5493884398192" },
] as const;

/** Link de WhatsApp con el mensaje ya escrito. */
export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
