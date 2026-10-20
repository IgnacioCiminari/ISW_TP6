// Formato de presentación (moneda y fechas en es-AR). No contiene reglas del negocio.

const formatoPesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** Importe de una entrada: las de $0 se muestran como «Gratis». */
export const formatearPesos = (importe: number): string =>
  importe === 0 ? 'Gratis' : formatoPesos.format(importe);

/** Importe total, siempre en pesos. */
export const formatearTotal = (importe: number): string => formatoPesos.format(importe);

// larga: «sábado, 24 de octubre de 2026» · media: «sábado, 24 de octubre» · corta: «sáb, 24 oct»
export const formatearFecha = (
  fecha: Date,
  estilo: 'larga' | 'media' | 'corta' = 'larga',
): string =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: estilo === 'corta' ? 'short' : 'long',
    day: 'numeric',
    month: estilo === 'corta' ? 'short' : 'long',
    year: estilo === 'larga' ? 'numeric' : undefined,
  }).format(fecha);

const dosDigitos = (n: number) => String(n).padStart(2, '0');

/** Fecha local como `AAAA-MM-DD`, el formato que espera la API. */
export const aFechaIso = (fecha: Date): string =>
  `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;

export const mismoDia = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
