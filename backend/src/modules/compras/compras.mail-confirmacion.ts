import type { FormaPago, TipoPase } from '../pagos/pagos.types';
import type { EntradaConfirmada, MensajeMail, ResumenCompra } from './compras.types';

interface DatosMailConfirmacion {
  remitente: string;
  para: string;
  resumen: ResumenCompra;
  imagenesQR: Buffer[];
}

const NOMBRE_PASE: Record<TipoPase, string> = { VIP: 'VIP', REGULAR: 'Regular' };

const DESCRIPCION_PAGO: Record<FormaPago, string> = {
  TARJETA: 'Tarjeta, con Mercado Pago',
  EFECTIVO: 'Efectivo, se abona en boletería',
};

const FORMATO_PESOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

// La fecha de visita es un día de calendario: se formatea en UTC a partir de sus partes
// locales para que no se corra según la zona del proceso.
const FORMATO_FECHA = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const formatearFecha = (fecha: Date): string =>
  FORMATO_FECHA.format(new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())));

const formatearPrecio = (precio: number): string =>
  precio === 0 ? 'Gratis' : FORMATO_PESOS.format(precio);

const describirEntrada = (entrada: EntradaConfirmada): string[] => [
  `${entrada.edad} años`,
  NOMBRE_PASE[entrada.tipoPase],
  formatearPrecio(entrada.precio),
];

const armarTexto = (resumen: ResumenCompra): string =>
  [
    '¡Gracias por tu compra en EcoHarmony Park!',
    '',
    `Orden: ${resumen.numeroOrden}`,
    `Fecha de visita: ${formatearFecha(resumen.fechaVisita)}`,
    `Forma de pago: ${DESCRIPCION_PAGO[resumen.formaPago]}`,
    '',
    'Entradas:',
    ...resumen.entradas.map(
      (entrada, indice) => `${indice + 1}. ${describirEntrada(entrada).join(' · ')}`,
    ),
    '',
    `Total: ${FORMATO_PESOS.format(resumen.detalle.total)}`,
  ].join('\n');

const armarHtml = (resumen: ResumenCompra): string => `
<h1>¡Gracias por tu compra en EcoHarmony Park!</h1>
<p>Orden: ${resumen.numeroOrden}</p>
<p>Fecha de visita: ${formatearFecha(resumen.fechaVisita)}</p>
<p>Forma de pago: ${DESCRIPCION_PAGO[resumen.formaPago]}</p>
<table>
  ${resumen.entradas
    .map(
      (entrada) =>
        `<tr>${describirEntrada(entrada)
          .map((dato) => `<td>${dato}</td>`)
          .join('')}</tr>`,
    )
    .join('\n  ')}
  <tr><td>Total</td><td>${FORMATO_PESOS.format(resumen.detalle.total)}</td></tr>
</table>`;

export const armarMailConfirmacion = ({
  remitente,
  para,
  resumen,
}: DatosMailConfirmacion): MensajeMail => ({
  de: remitente,
  para,
  asunto: `Confirmación de tu compra ${resumen.numeroOrden} · EcoHarmony Park`,
  html: armarHtml(resumen),
  texto: armarTexto(resumen),
});
