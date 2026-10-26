import type { FormaPago, TipoPase } from '../pagos/pagos.types';
import type { AdjuntoMail, EntradaConfirmada, MensajeMail, ResumenCompra } from './compras.types';

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

const AVISO_INGRESO = 'Presentá el QR de cada entrada en el ingreso del parque.';

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
  entrada.codigoQR,
];

const cidDelQR = (indice: number): string => `qr-${indice + 1}@ecoharmonypark`;

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
    '',
    AVISO_INGRESO,
  ].join('\n');

// Paleta de la guía de estilos. Los clientes de mail ignoran <style> y las clases,
// por eso el HTML lleva estilos inline y se maqueta con tablas.
const COLOR = {
  primario: '#386641',
  fondo: '#f2e8cf',
  superficie: '#ffffff',
  renglon: '#e3d8ba',
  tinta: '#1f3a25',
  tintaSuave: '#4b5a44',
} as const;

const FUENTE = "Lato, 'Helvetica Neue', Arial, sans-serif";
const TAMANIO_QR = 160;

const filaDato = (etiqueta: string, valor: string): string => `
<tr>
  <td style="padding:8px 0;border-bottom:1px solid ${COLOR.renglon};color:${COLOR.tintaSuave};font-size:14px">${etiqueta}</td>
  <td style="padding:8px 0;border-bottom:1px solid ${COLOR.renglon};color:${COLOR.tinta};font-size:14px;font-weight:700;text-align:right">${valor}</td>
</tr>`;

const bloqueEntrada = (entrada: EntradaConfirmada, indice: number): string => {
  const [edad, pase, precio, codigo] = describirEntrada(entrada);
  return `
<tr>
  <td style="padding:16px 0;border-bottom:1px solid ${COLOR.renglon};text-align:center">
    <p style="margin:0;color:${COLOR.tinta};font-size:15px"><strong>Entrada ${indice + 1}</strong> · ${edad} · ${pase} · ${precio}</p>
    <img src="cid:${cidDelQR(indice)}" alt="QR ${codigo}" width="${TAMANIO_QR}" height="${TAMANIO_QR}" style="display:block;margin:12px auto 4px">
    <p style="margin:0;color:${COLOR.tintaSuave};font-size:12px">${codigo}</p>
  </td>
</tr>`;
};

const armarHtml = (resumen: ResumenCompra): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.fondo};font-family:${FUENTE}">
  <tr>
    <td style="padding:24px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:${COLOR.superficie};border-radius:6px">
        <tr>
          <td style="background:${COLOR.primario};padding:20px 24px;border-radius:6px 6px 0 0">
            <p style="margin:0;color:${COLOR.superficie};font-size:13px;letter-spacing:1px">ECOHARMONY PARK · BIOPARQUE</p>
            <h1 style="margin:6px 0 0;color:${COLOR.superficie};font-size:22px">¡Gracias por tu compra!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${filaDato('Orden', resumen.numeroOrden)}
              ${filaDato('Fecha de visita', formatearFecha(resumen.fechaVisita))}
              ${filaDato('Forma de pago', DESCRIPCION_PAGO[resumen.formaPago])}
            </table>
            <h2 style="margin:24px 0 0;color:${COLOR.primario};font-size:17px">Tus entradas</h2>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${resumen.entradas.map(bloqueEntrada).join('')}
              <tr>
                <td style="padding:16px 0 0;color:${COLOR.primario};font-size:18px;font-weight:700;text-align:right">Total ${FORMATO_PESOS.format(resumen.detalle.total)}</td>
              </tr>
            </table>
            <p style="margin:24px 0 8px;color:${COLOR.tintaSuave};font-size:13px">${AVISO_INGRESO}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

const armarAdjuntos = (entradas: EntradaConfirmada[], imagenesQR: Buffer[]): AdjuntoMail[] =>
  entradas.map((entrada, indice) => ({
    nombre: `${entrada.codigoQR}.png`,
    contenido: imagenesQR[indice],
    cid: cidDelQR(indice),
  }));

export const armarMailConfirmacion = ({
  remitente,
  para,
  resumen,
  imagenesQR,
}: DatosMailConfirmacion): MensajeMail => ({
  de: remitente,
  para,
  asunto: `Confirmación de tu compra ${resumen.numeroOrden} · EcoHarmony Park`,
  html: armarHtml(resumen),
  texto: armarTexto(resumen),
  adjuntos: armarAdjuntos(resumen.entradas, imagenesQR),
});
