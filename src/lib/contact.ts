/**
 * Celulares a los que se avisan los pedidos.
 *
 * Al terminar, el cliente elige a cuál mandarlo: un link de `wa.me` abre una
 * conversación con un solo número, así que no hay forma de mandarlo a los dos
 * a la vez desde el teléfono del cliente.
 *
 * `wa.me` necesita el número en formato internacional sin signos ni espacios.
 * En Argentina los móviles llevan un 9 entre el país (54) y el área: el
 * 381 664-2680 queda como 5493816642680.
 *
 * `name` es opcional y sirve para que el cliente sepa a quién le escribe.
 */
export const ORDER_WHATSAPP_NUMBERS: { label: string; wa: string; name?: string }[] = [
  { label: "381 664-2680", wa: "5493816642680" },
  { label: "388 439-8192", wa: "5493884398192" },
];

/** Link de WhatsApp con el mensaje ya escrito. */
export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
