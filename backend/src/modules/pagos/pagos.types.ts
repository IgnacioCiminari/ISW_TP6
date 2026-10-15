export type TipoPase = 'VIP' | 'REGULAR';

export type FormaPago = 'EFECTIVO' | 'TARJETA';

export interface Visitante {
  edad: number;
  tipoPase: TipoPase;
}

export interface Subtotal {
  edad: number;
  tipoPase: TipoPase;
  precio: number;
}

export interface DetallePrecio {
  subtotales: Subtotal[];
  total: number;
}

export interface PreferenciaPago {
  id: string;
  urlRedireccion: string;
}

// Puerto hacia Mercado Pago: en los tests se reemplaza por un fake,
// en producción se implementa con el SDK (sandbox) o con un mock completo.
export interface PasarelaPago {
  crearPreferencia(numeroOrden: string, total: number): Promise<PreferenciaPago>;
}

export type ResultadoPago =
  | { formaPago: 'EFECTIVO'; estado: 'PENDIENTE_EN_BOLETERIA' }
  | { formaPago: 'TARJETA'; estado: 'REDIRIGIDO_A_MERCADO_PAGO'; urlRedireccion: string };
