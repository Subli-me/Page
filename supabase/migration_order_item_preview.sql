-- La imagen de cómo quedó la prenda con el diseño puesto.
--
-- Hasta ahora esa composición solo viajaba en el mensaje de WhatsApp: si el
-- mensaje se perdía, se perdía la única constancia de cómo lo quería el
-- cliente. Guardarla en el pedido la deja disponible en el panel.
--
-- Es opcional a propósito: si la composición falla (por ejemplo, porque la
-- prenda no tiene mockup cargado para esa zona), el pedido se guarda igual.

alter table order_items
  add column if not exists preview_url text;
