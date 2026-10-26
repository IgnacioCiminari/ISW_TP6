// Tipos del envío de mail. Usan Buffer (solo existe en Node), por eso no están en
// compras.types.ts, que el frontend también importa.

// Imagen embebida en el HTML: el cuerpo la referencia con `<img src="cid:...">`.
export interface AdjuntoMail {
  nombre: string;
  contenido: Buffer;
  cid: string;
}

export interface MensajeMail {
  de: string;
  para: string;
  asunto: string;
  html: string;
  texto: string;
  adjuntos: AdjuntoMail[];
}

// Puerto hacia el servidor de mail: en los tests se reemplaza por un fake,
// en producción se implementa con SMTP.
export interface TransporteMail {
  enviar(mensaje: MensajeMail): Promise<void>;
}
