import type { MensajeMail, ResumenCompra } from './compras.types';

interface DatosMailConfirmacion {
  remitente: string;
  para: string;
  resumen: ResumenCompra;
  imagenesQR: Buffer[];
}

export const armarMailConfirmacion = ({
  remitente,
  para,
  resumen,
}: DatosMailConfirmacion): MensajeMail => ({
  de: remitente,
  para,
  asunto: `Confirmación de tu compra ${resumen.numeroOrden} · EcoHarmony Park`,
});
