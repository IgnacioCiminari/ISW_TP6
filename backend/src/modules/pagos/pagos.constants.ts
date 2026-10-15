import type { TipoPase } from './pagos.types';

// Precio completo de la entrada (en ARS) según el tipo de pase.
export const PRECIO_ENTRADA_POR_PASE: Record<TipoPase, number> = {
  VIP: 20000,
  REGULAR: 10000,
};

export const PRECIO_ENTRADA_GRATIS = 0;

// Límites de edad inclusivos para cada beneficio.
export const EDAD_MAX_NINOS_GRATIS = 3;
export const EDAD_MAX_MENORES_DESCUENTO = 15;
export const EDAD_MIN_JUBILADOS_DESCUENTO = 60;

// Menores y jubilados pagan la mitad del precio de su pase.
export const FACTOR_DESCUENTO_MEDIA_ENTRADA = 0.5;
